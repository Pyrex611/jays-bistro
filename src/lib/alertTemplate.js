import { formatPrice } from "./format.js";
import { channelLabel, formatLagosDateTime } from "./receipt.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/**
 * The kitchen alert for a paid order. Pure: the same template is previewed in the console today and will be
 * sent by the email channel when integration is approved (api/_lib/notify/channels/email.js).
 */
export function renderOrderPaidAlert(order, { consoleUrl = "" } = {}) {
  const delivery = order.fulfilment === "delivery";
  const when = formatLagosDateTime(order.payment.paidAt);
  const subject = `New paid order ${order.code} · ${formatPrice(order.total)} · ${delivery ? "Delivery" : "Pickup"}`;
  const where = delivery ? `${order.zone?.name ? `${order.zone.name} — ` : ""}${order.customer.address}` : "Pickup at the restaurant";

  const text = [
    `NEW PAID ORDER ${order.code}`,
    `${when.full} · ${channelLabel(order.payment.channel)}`,
    "",
    ...order.items.map((i) => `${i.quantity}x ${i.name} — ${formatPrice(i.lineTotal)}`),
    "",
    `Items ${formatPrice(order.subtotal)}${order.deliveryFee ? ` · Delivery ${formatPrice(order.deliveryFee)}` : ""}${order.serviceFee ? ` · Service fee ${formatPrice(order.serviceFee)}` : ""}`,
    `TOTAL ${formatPrice(order.total)}`,
    "",
    `${delivery ? "DELIVER TO" : "PICKUP"}: ${where}`,
    `Customer: ${order.customer.name} · +${order.customer.phone}`,
    order.customer.note ? `Note: ${order.customer.note}` : "",
    consoleUrl ? `\nOpen in console: ${consoleUrl}` : "",
  ].filter((l) => l !== "").join("\n");

  const rows = order.items.map((i) => `<tr><td style="padding:6px 0">${i.quantity}× ${esc(i.name)}</td><td style="padding:6px 0;text-align:right">${esc(formatPrice(i.lineTotal))}</td></tr>`).join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#121C16">
<div style="background:#C9DCCE;border-radius:16px 16px 0 0;padding:20px"><div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#1E4B28">New paid order</div><div style="font-size:28px;font-weight:800;color:#143219">${esc(order.code)}</div><div style="font-size:13px;color:#2F3D34">${esc(when.full)} · ${esc(channelLabel(order.payment.channel))}</div></div>
<div style="background:#FDFCF6;border:1px solid #E9E2CC;border-top:0;border-radius:0 0 16px 16px;padding:20px">
<table style="width:100%;border-collapse:collapse;font-size:15px">${rows}<tr><td colspan="2" style="border-top:1px dashed #B1BAB1"></td></tr><tr><td style="padding-top:10px;font-weight:800">Total paid</td><td style="padding-top:10px;text-align:right;font-weight:800;font-size:20px;color:#286334">${esc(formatPrice(order.total))}</td></tr></table>
<p style="margin:18px 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.15em;color:#5C6B61">${delivery ? "Deliver to" : "Pickup"}</p><p style="margin:0;font-size:15px">${esc(where)}</p>
<p style="margin:14px 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.15em;color:#5C6B61">Customer</p><p style="margin:0;font-size:15px">${esc(order.customer.name)} · <a href="tel:+${esc(order.customer.phone)}" style="color:#286334">+${esc(order.customer.phone)}</a></p>
${order.customer.note ? `<p style="margin:14px 0 0;padding:10px 12px;background:#F5DAB8;border-radius:10px;font-size:14px;color:#5E3010">Note: ${esc(order.customer.note)}</p>` : ""}
${consoleUrl ? `<p style="margin:20px 0 0"><a href="${esc(consoleUrl)}" style="display:inline-block;background:#286334;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">Open in console</a></p>` : ""}
</div></div>`;

  return { subject, text, html };
}
