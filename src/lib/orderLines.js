/** Validate the cart the browser sent against the live menu. Prices always come from the menu, never from the client. */
export function resolveOrderLines(rawItems, doc) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return { ok: false, error: "Your tray is empty." };
  if (rawItems.length > 40) return { ok: false, error: "Too many different items in one order." };

  const byId = new Map(doc.items.filter((i) => i.isActive !== false).map((i) => [i.id, i]));
  const merged = new Map();
  for (const raw of rawItems) {
    const id = Number(raw?.id);
    const quantity = Math.trunc(Number(raw?.quantity));
    if (!Number.isInteger(id) || !byId.has(id)) return { ok: false, error: "An item in your tray is no longer on the menu.", code: "unknown_item" };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return { ok: false, error: "Quantities must be between 1 and 20." };
    merged.set(id, Math.min(20, (merged.get(id) ?? 0) + quantity));
  }

  const lines = [...merged].map(([id, quantity]) => ({ item: byId.get(id), quantity }));
  const soldOut = lines.filter((l) => l.item.isAvailable === false).map((l) => l.item.name);
  if (soldOut.length) return { ok: false, error: `Sold out today: ${soldOut.join(", ")}. Please remove ${soldOut.length > 1 ? "them" : "it"} to continue.`, code: "sold_out", soldOut };

  return { ok: true, lines };
}
