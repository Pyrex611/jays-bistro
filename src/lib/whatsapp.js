import { formatPrice } from "./format.js";

/**
 * Build the wa.me deep link for checkout. Message format is unchanged from the legacy site.
 * @param {Array<{item:{name:string}, quantity:number, lineTotal:number}>} lines
 * @param {string} phoneNumber international format, digits only
 */
export function buildWhatsAppLink(lines, phoneNumber) {
  const base = `https://wa.me/${phoneNumber}`;
  if (lines.length === 0) return base;

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const body = lines.map((line) => `▪ ${line.quantity}x ${line.item.name} - ${formatPrice(line.lineTotal)}`).join("\n");
  const message = `Hello Jay's Bistro, I would like to place an order:\n\n${body}\n\n*Total Order Value: ${formatPrice(total)}*`;

  return `${base}?text=${encodeURIComponent(message)}`;
}
