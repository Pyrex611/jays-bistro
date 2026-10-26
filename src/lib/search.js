/** Menu search: accent/case-insensitive, every typed word must match; name matches rank first. */

export const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (query) => normalizeText(query).split(" ").filter(Boolean);

/** Returns matching items ordered by relevance (stable for equal scores). Empty query returns []. */
export function searchItems(items, query) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const scored = [];
  items.forEach((item, index) => {
    const name = normalizeText(item.name);
    const nameWords = name.split(" ");
    const rest = normalizeText(`${item.description} ${item.category}`);
    let score = 0;

    for (const token of tokens) {
      if (nameWords.some((w) => w.startsWith(token))) score += name.startsWith(token) ? 6 : 5;
      else if (name.includes(token)) score += 3;
      else if (rest.includes(token)) score += 1;
      else return; // every token must match somewhere
    }
    scored.push({ item, score, index });
  });

  return scored.sort((a, b) => b.score - a.score || a.index - b.index).map((s) => s.item);
}
