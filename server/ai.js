// The only file that talks to the AI provider (Google Gemini REST API).
// Swap providers by changing this file; callers only use generateText().

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const TIMEOUT_MS = 20_000;

export class AIError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message);
    this.name = 'AIError';
    this.status = status;
    this.cause = cause;
  }
}

export const isAIConfigured = () => Boolean(process.env.AI_API_KEY);

/**
 * Generate text with Gemini.
 * @param {string} systemPrompt - system instruction
 * @param {{role: 'user'|'assistant', content: string}[]} messages - conversation, oldest first
 * @param {{json?: boolean, maxOutputTokens?: number}} [options]
 * @returns {Promise<string>} the model's text
 */
export async function generateText(systemPrompt, messages, { json = false, maxOutputTokens = 800 } = {}) {
  if (!isAIConfigured()) {
    throw new AIError('AI is not configured (AI_API_KEY is missing).');
  }

  const model = process.env.AI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      maxOutputTokens,
      ...(json && { responseMimeType: 'application/json' }),
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.AI_API_KEY },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new AIError(`AI request timed out after ${TIMEOUT_MS / 1000}s.`, { cause: err });
    }
    throw new AIError(`Could not reach the AI service: ${err.message}`, { cause: err });
  } finally {
    clearTimeout(timer);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new AIError(`AI service returned a non-JSON response (HTTP ${response.status}).`, {
      status: response.status,
    });
  }

  if (!response.ok) {
    const detail = data?.error?.message || `HTTP ${response.status}`;
    throw new AIError(`AI service error (${model}): ${detail}`, { status: response.status });
  }

  if (data.promptFeedback?.blockReason) {
    throw new AIError(`AI blocked the request: ${data.promptFeedback.blockReason}`);
  }

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text || '').join('').trim();
  if (!text) {
    throw new AIError(`AI returned no text (finish reason: ${candidate?.finishReason || 'unknown'}).`);
  }
  return text;
}
