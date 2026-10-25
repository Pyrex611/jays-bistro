import { buildContents, buildSystemPrompt, parseModelReply, sanitizeActions } from "../lib/chat.js";

export const DEMO_MESSAGE = "I'm in demo mode! Add a real Gemini key to enable my brain.";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isDemo = (apiKey) => !apiKey || apiKey.includes("PLACEHOLDER");

/**
 * Ask the concierge. Resolves to { message, actions } where `actions` are already sanitised.
 * Throws on network / API / parsing failure — the caller shows a friendly fallback message.
 */
export async function askConcierge({ apiKey, model, menuItems, byId, cartLines, history, userText, signal }) {
  if (isDemo(apiKey)) {
    await sleep(1000);
    return { message: DEMO_MESSAGE, actions: [] };
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildSystemPrompt(menuItems, cartLines) }] },
      contents: buildContents(history, userText),
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
    signal,
  });

  if (!response.ok) throw new Error(`Concierge API error: ${response.status}`);

  const data = await response.json();
  const parsed = parseModelReply(data?.candidates?.[0]?.content?.parts?.[0]?.text);
  if (!parsed) throw new Error("Concierge returned an unreadable reply");

  return { message: parsed.message, actions: sanitizeActions(parsed.actions, byId) };
}
