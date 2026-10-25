import { MAX_QTY_PER_ITEM } from "./cart.js";

/**
 * Pure helpers for the AI concierge. Network access lives in services/concierge.js.
 */

export function buildSystemPrompt(menuItems, cartLines) {
  const menu = menuItems.map((i) => `ID ${i.id}: ${i.name} (₦${i.price})`).join("\n");
  const cart = cartLines.length
    ? cartLines.map((l) => `ID ${l.item.id}: ${l.item.name} (x${l.quantity})`).join("\n")
    : "Empty";

  return `You are Jay's Bistro's virtual concierge.
Your job is to assist customers with their orders, answer menu questions, and manage their cart. Keep responses short, elegant and very friendly.
Only recommend and add items that appear in the menu below.

Menu:
${menu}

Current Cart:
${cart}

You MUST respond ONLY with a JSON object in this exact format. Do not use markdown code fences. Only a pure JSON string.
{
  "message": "Your conversational reply here",
  "actions": [{"action": "add" | "remove", "id": number, "quantity": number}]
}
If no cart changes are needed, actions should be [].`;
}

/** Map UI chat history + the new user message to Gemini `contents`. */
export function buildContents(history, userText) {
  const past = history.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.role === "model" ? JSON.stringify({ message: msg.text, actions: [] }) : msg.text }],
  }));
  return [...past, { role: "user", parts: [{ text: userText }] }];
}

/** Parse the model's raw text. Returns { message, actions } or null if it is not valid. */
export function parseModelReply(rawText) {
  try {
    const clean = String(rawText ?? "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(clean);
    if (!parsed || typeof parsed.message !== "string") return null;
    return { message: parsed.message, actions: Array.isArray(parsed.actions) ? parsed.actions : [] };
  } catch {
    return null;
  }
}

/**
 * Never trust model output: keep only well-formed add/remove actions for items that exist.
 * Quantities are clamped to 1..MAX_QTY_PER_ITEM.
 */
export function sanitizeActions(actions, byId) {
  if (!Array.isArray(actions)) return [];
  return actions
    .map((a) => {
      if (!a || (a.action !== "add" && a.action !== "remove")) return null;
      const id = Number(a.id);
      if (!Number.isInteger(id) || !byId[id]) return null;
      const qty = Math.trunc(Number(a.quantity ?? 1));
      if (!Number.isFinite(qty) || qty < 1) return null;
      return { action: a.action, id, quantity: Math.min(qty, MAX_QTY_PER_ITEM) };
    })
    .filter(Boolean);
}
