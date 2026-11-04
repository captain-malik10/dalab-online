// Writes docs/AI_PROMPTS.md from server/ai-prompts.js so the docs always contain the
// exact prompts the server sends. Usage: npm run docs:prompts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as prompts from '../server/ai-prompts.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const block = (text) => '```text\n' + text + '\n```';

const doc = `# Dalab Online — AI prompts

Every system prompt and prompt template used by Dalab Online's AI features, word for word.
This file is generated from \`server/ai-prompts.js\` with \`npm run docs:prompts\`.

- **Provider:** Google Gemini API (\`generateContent\`, REST, called with \`fetch\` in \`server/ai.js\`)
- **Model:** value of the \`AI_MODEL\` env variable (default \`gemini-3.5-flash-lite\`)
- **Timeout:** 20 seconds per request
- **Placeholders** in \`{{DOUBLE_BRACES}}\` are filled by the server before sending.

## 1. Dalab AI shopping assistant

**Endpoint:** \`POST /api/ai/chat\` · **Used by:** the "Ask Dalab AI ✨" chat on storefront pages

- **System prompt:** the text below, with \`{{CATALOG}}\` replaced by up to 150 products, one per line:
  \`#<id> | <name> | $<price> | <category> | <store> | stock <n> | <short description>\`
- **Messages:** the last 10 chat messages (customer = \`user\`, assistant = \`model\`), max 500 characters each.
- **Output:** JSON (\`responseMimeType: application/json\`), max 700 tokens. The server keeps only product ids
  that exist in the catalog (max 4) and also reads ids written as \`[#id]\` in the reply.
- **Safeguards:** 20 requests per IP per 10 minutes. If the AI key is missing or the call fails,
  a keyword search over the catalog answers instead (no prompt involved).

${block(prompts.SHOPPING_ASSISTANT_PROMPT)}

## 2. AI product description generator

**Endpoint:** \`POST /api/ai/description\` · **Used by:** the "✨ Generate with AI" button in the seller
product form. The generated text fills the Description field and stays editable.

**System prompt:**

${block(prompts.PRODUCT_DESCRIPTION_PROMPT)}

**User message template** (filled from the form; max 300 output tokens):

${block(prompts.PRODUCT_DESCRIPTION_USER_TEMPLATE)}

If AI is unavailable, the server returns a simple template description instead.

## 3. AI review summary ("What customers say")

**Endpoint:** \`GET /api/ai/review-summary/:productId\` · **Used by:** the product page, for products
with at least 2 written reviews. Cached in memory per product until its review count changes.

**System prompt:**

${block(prompts.REVIEW_SUMMARY_PROMPT)}

**User message template** (up to 30 most recent reviews; max 200 output tokens):

${block(prompts.REVIEW_SUMMARY_USER_TEMPLATE)}
`;

fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'AI_PROMPTS.md'), doc);
console.log('Wrote docs/AI_PROMPTS.md');
