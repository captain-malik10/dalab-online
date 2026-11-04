import express from 'express';
import db from '../config/db.js';
import { authenticateAny } from '../middleware/auth.js';
import { generateText, isAIConfigured } from '../ai.js';
import {
  SHOPPING_ASSISTANT_PROMPT,
  PRODUCT_DESCRIPTION_PROMPT,
  PRODUCT_DESCRIPTION_USER_TEMPLATE,
  REVIEW_SUMMARY_PROMPT,
  REVIEW_SUMMARY_USER_TEMPLATE,
  fillTemplate,
} from '../ai-prompts.js';
import { parseImageUrls } from '../utils/images.js';

const router = express.Router();

const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY = 10;
const MAX_CATALOG = 150;

// ---------------------------------------------------------------------------
// Simple in-memory per-IP rate limit (resets on server restart)
// ---------------------------------------------------------------------------
const rateLimit = ({ max, windowMs }) => {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      const retryMin = Math.ceil((windowMs - (now - recent[0])) / 60000);
      return res
        .status(429)
        .json({ error: `Too many AI requests. Please try again in ${retryMin} minute(s).` });
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [k, times] of hits) if (now - times[times.length - 1] > windowMs) hits.delete(k);
    }
    next();
  };
};

const chatLimiter = rateLimit({ max: 20, windowMs: 10 * 60 * 1000 });
const toolLimiter = rateLimit({ max: 30, windowMs: 10 * 60 * 1000 });

// ---------------------------------------------------------------------------
// Catalog helpers
// ---------------------------------------------------------------------------
const loadCatalog = async () => {
  const [rows] = await db.query(
    `SELECT p.id, p.name, p.price, p.stock, p.description, p.image_urls,
            c.name AS category_name, v.store_name AS vendor_name
     FROM Products p
     JOIN Categories c ON p.category_id = c.id
     JOIN Vendors v ON p.vendor_id = v.id
     WHERE v.status != 'rejected'
     ORDER BY p.isFeatured DESC, p.id DESC
     LIMIT ?`,
    [MAX_CATALOG],
  );
  return rows.map((p) => ({ ...p, price: Number(p.price), image_urls: parseImageUrls(p.image_urls) }));
};

const shortText = (text, max = 140) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

const catalogLines = (catalog) =>
  catalog
    .map(
      (p) =>
        `#${p.id} | ${p.name} | $${p.price.toFixed(2)} | ${p.category_name} | ${p.vendor_name} | stock ${p.stock} | ${shortText(p.description)}`,
    )
    .join('\n');

const toCard = (p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  image_urls: p.image_urls,
  vendor_name: p.vendor_name,
  category_name: p.category_name,
  stock: p.stock,
});

// ---------------------------------------------------------------------------
// Keyword fallback (used when AI is not configured or fails)
// ---------------------------------------------------------------------------
const SOMALI_HINTS =
  /\b(ka|iyo|waxaan|rabaa|doonayaa|iga|ii|ma|fadlan|telefoon|taleefan|qiimo|jaban|raqiis|sidee|imisa|haa|maya|waa|iibso|hadiyad|dharka|kabo|gaari|guri|jikada)\b/i;

const SYNONYMS = {
  telefoon: 'phone smartphone', taleefan: 'phone smartphone', mobile: 'phone smartphone',
  phones: 'phone smartphone', laptop: 'laptop computer', kombiyuutar: 'laptop computer',
  dhar: 'fashion suit blazer outfit', dharka: 'fashion suit blazer outfit', kabo: 'sneakers shoes',
  shoes: 'sneakers shoes', hadiyad: 'gift box set', gift: 'gift box set', gifts: 'gift box set',
  jikada: 'kitchen cookware kettle', kitchen: 'kitchen cookware kettle', guri: 'home kitchen fridge',
  qurux: 'beauty skincare foundation toner', beauty: 'beauty skincare foundation toner',
  skincare: 'skincare toner foundation', koronto: 'solar power bank', power: 'power bank solar',
  kubad: 'football', ball: 'football', headphones: 'headphones earbuds', music: 'headphones earbuds',
};

const STOP_WORDS = new Set(
  'a an the and or for to of in on with under below less than me i want need show find some any best good cheap price usd dollar ka yar iga ii u ah oo waxaan rabaa doonayaa fadlan ma jiraa'.split(
    ' ',
  ),
);

const parseBudget = (text) => {
  const match =
    text.match(/(?:under|below|less than|max(?:imum)?|up to|ka yar|ka hooseeya|ilaa)\s*\$?\s*(\d+(?:\.\d+)?)/i) ||
    text.match(/\$\s*(\d+(?:\.\d+)?)/) ||
    text.match(/(\d+(?:\.\d+)?)\s*(?:\$|usd|dollar|doolar)/i);
  return match ? Number(match[1]) : null;
};

const keywordFallback = (message, catalog) => {
  const somali = SOMALI_HINTS.test(message);
  const lower = message.toLowerCase();

  if (/deliver|delivery|geyn|keen|shipping|payment|pay|evc|edahab|lacag|bixi/.test(lower)) {
    return {
      reply: somali
        ? 'Dalab Online wuxuu alaabta kuu keenaa albaabkaaga. Muqdisho gudaheeda waa isla maalinta haddii aad dalbato ka hor 2da galabnimo. Lacagta waxaad ku bixin kartaa EVC Plus ama eDahab marka aad dalabka dhammaystirto. Weligaa ha u sheegin qofna PIN-kaaga.'
        : 'Dalab Online delivers to your door. In Mogadishu it is same-day when you order before 2pm. You pay with EVC Plus or eDahab at checkout — we never ask for your PIN.',
      products: [],
    };
  }

  const budget = parseBudget(message);
  const words = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w))
    .flatMap((w) => [w, ...(SYNONYMS[w] || '').split(' ').filter(Boolean)]);

  const scored = catalog
    .filter((p) => p.stock > 0 && (budget == null || p.price <= budget))
    .map((p) => {
      const haystack = `${p.name} ${p.category_name} ${p.vendor_name} ${p.description}`.toLowerCase();
      const score = words.reduce((s, w) => s + (haystack.includes(w.replace(/s$/, '')) ? 1 : 0), 0);
      return { p, score };
    })
    .filter(({ score }) => score > 0 || words.length === 0)
    .sort((a, b) => b.score - a.score || a.p.price - b.p.price)
    .slice(0, 4)
    .map(({ p }) => p);

  let products = scored;
  if (products.length === 0 && budget != null) {
    products = catalog.filter((p) => p.stock > 0 && p.price <= budget).slice(0, 4);
  }

  const budgetText = budget != null ? (somali ? ` oo ka yar $${budget}` : ` under $${budget}`) : '';
  const reply = products.length
    ? somali
      ? `Waa kuwan alaab ku habboon${budgetText}:`
      : `Here are some products${budgetText} you might like:`
    : somali
      ? 'Waan ka xumahay, wax ku habboon ma helin. Isku day eray kale ama eeg bogga Shop.'
      : "Sorry, I couldn't find a matching product. Try other words or browse the Shop page.";
  return { reply, products };
};

// ---------------------------------------------------------------------------
// POST /api/ai/chat  — Dalab AI shopping assistant
// ---------------------------------------------------------------------------
router.post('/chat', chatLimiter, async (req, res) => {
  const raw = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = raw
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.trim() }));

  const latest = messages[messages.length - 1];
  if (!latest || latest.role !== 'user') {
    return res.status(400).json({ error: 'Please send a message.' });
  }
  if (messages.some((m) => m.content.length > MAX_MESSAGE_CHARS)) {
    return res.status(400).json({ error: `Messages can be at most ${MAX_MESSAGE_CHARS} characters.` });
  }
  // Gemini conversations must start with a user turn
  while (messages.length && messages[0].role !== 'user') messages.shift();

  let catalog;
  try {
    catalog = await loadCatalog();
  } catch (err) {
    console.error('AI chat: failed to load catalog:', err.message);
    return res.status(500).json({ error: 'Could not load products right now.' });
  }
  const byId = new Map(catalog.map((p) => [p.id, p]));

  if (isAIConfigured()) {
    try {
      const systemPrompt = fillTemplate(SHOPPING_ASSISTANT_PROMPT, { CATALOG: catalogLines(catalog) });
      const text = await generateText(systemPrompt, messages, { json: true, maxOutputTokens: 700 });

      let parsed;
      try {
        parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ''));
      } catch {
        parsed = { reply: text, productIds: [] };
      }
      const reply = String(parsed.reply || '').trim();
      const idsFromJson = Array.isArray(parsed.productIds) ? parsed.productIds : [];
      const idsFromText = [...reply.matchAll(/\[#(\d+)\]/g)].map((m) => m[1]);
      const productIds = [...new Set([...idsFromJson, ...idsFromText].map(Number))]
        .filter((id) => byId.has(id))
        .slice(0, 4);

      if (reply) {
        return res.json({
          reply,
          productIds,
          products: productIds.map((id) => toCard(byId.get(id))),
          source: 'ai',
        });
      }
    } catch (err) {
      console.error('AI chat failed, using keyword fallback:', err.message);
    }
  }

  const fallback = keywordFallback(latest.content, catalog);
  res.json({
    reply: fallback.reply,
    productIds: fallback.products.map((p) => p.id),
    products: fallback.products.map(toCard),
    source: 'fallback',
  });
});

// ---------------------------------------------------------------------------
// POST /api/ai/description — "Generate with AI" in the seller product form
// ---------------------------------------------------------------------------
router.post('/description', authenticateAny, toolLimiter, async (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 200);
  const category = String(req.body?.category || '').trim().slice(0, 100);
  const price = Number(req.body?.price);
  const notes = String(req.body?.notes || '').trim().slice(0, 500);

  if (!name) {
    return res.status(400).json({ error: 'Enter a product name first.' });
  }

  if (isAIConfigured()) {
    try {
      const userMessage = fillTemplate(PRODUCT_DESCRIPTION_USER_TEMPLATE, {
        NAME: name,
        CATEGORY: category || 'Not specified',
        PRICE: Number.isFinite(price) && price > 0 ? price.toFixed(2) : 'not specified',
        NOTES: notes || 'none',
      });
      const description = await generateText(
        PRODUCT_DESCRIPTION_PROMPT,
        [{ role: 'user', content: userMessage }],
        { maxOutputTokens: 300 },
      );
      return res.json({ description: description.replace(/^["']|["']$/g, '').trim(), source: 'ai' });
    } catch (err) {
      console.error('AI description failed, using template:', err.message);
    }
  }

  const categoryText = category ? ` in our ${category} range` : '';
  res.json({
    description: `${name} is a reliable choice${categoryText}, selected by a trusted local store on Dalab Online. It is built for everyday use and good value for money. Order today and pay easily with EVC Plus or eDahab.`,
    source: 'template',
  });
});

// ---------------------------------------------------------------------------
// GET /api/ai/review-summary/:productId — "What customers say"
// ---------------------------------------------------------------------------
const summaryCache = new Map(); // productId -> { reviewCount, summary }

router.get('/review-summary/:productId', toolLimiter, async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId)) return res.status(400).json({ error: 'Invalid product id.' });

  try {
    const [[product]] = await db.query('SELECT name FROM Products WHERE id = ?', [productId]);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const [reviews] = await db.query(
      "SELECT rating, comment FROM Reviews WHERE product_id = ? AND comment IS NOT NULL AND comment != '' ORDER BY created_at DESC LIMIT 30",
      [productId],
    );
    if (reviews.length < 2 || !isAIConfigured()) {
      return res.json({ summary: null, reviewCount: reviews.length });
    }

    const cached = summaryCache.get(productId);
    if (cached && cached.reviewCount === reviews.length) {
      return res.json({ summary: cached.summary, reviewCount: reviews.length, cached: true });
    }

    const userMessage = fillTemplate(REVIEW_SUMMARY_USER_TEMPLATE, {
      PRODUCT: product.name,
      REVIEWS: reviews.map((r) => `- ${r.rating}/5: ${shortText(r.comment, 300)}`).join('\n'),
    });
    const summary = await generateText(REVIEW_SUMMARY_PROMPT, [{ role: 'user', content: userMessage }], {
      maxOutputTokens: 200,
    });
    summaryCache.set(productId, { reviewCount: reviews.length, summary });
    res.json({ summary, reviewCount: reviews.length });
  } catch (err) {
    console.error('AI review summary failed:', err.message);
    res.json({ summary: null });
  }
});

export default router;
