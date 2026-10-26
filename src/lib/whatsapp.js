import { formatPrice } from "./format.js";

/**
 * Build the wa.me deep link for WhatsApp checkout.
 * When `invoiceUrl` is given (the normal case) the message ends with a link to an expiring invoice
 * that the customer can pay online; it turns into their receipt once paid.
 *
 * @param {Array<{item:{name:string}, quantity:number, lineTotal:number}>} lines
 * @param {string} phoneNumber international format, digits only
 * @param {{ invoiceUrl?: string, total?: number, note?: string }} [options] `total` overrides the items sum (e.g. includes delivery)
 */
export function buildWhatsAppLink(lines, phoneNumber, options = {}) {
  const base = `https://wa.me/${phoneNumber}`;
  if (lines.length === 0) return base;

  const itemsTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const total = options.total ?? itemsTotal;
  const body = lines.map((line) => `▪ ${line.quantity}x ${line.item.name} - ${formatPrice(line.lineTotal)}`).join("\n");

  let message = `Hello Jay's Bistro, I would like to place an order:\n\n${body}\n\n*Total Order Value: ${formatPrice(total)}*`;
  if (options.invoiceUrl) message += `\n\n🧾 Invoice (valid 24h, pay online): ${options.invoiceUrl}`;
  if (options.note) message += `\n\n${options.note}`;

  return `${base}?text=${encodeURIComponent(message)}`;
}
