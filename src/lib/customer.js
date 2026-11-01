/** Customer detail validation: shared by the API (authoritative) and the browser demo backend. */

export function normalizePhone(raw) {
  const digits = String(raw ?? "").replace(/[^\d]/g, "");
  if (/^0\d{10}$/.test(digits)) return `234${digits.slice(1)}`;
  return digits;
}

/** Full validation used when someone is about to pay. */
export function validateCustomer(c, fulfilment) {
  const errors = {};
  const name = String(c?.name ?? "").trim();
  const email = String(c?.email ?? "").trim().toLowerCase();
  const phone = normalizePhone(c?.phone);
  const address = String(c?.address ?? "").trim();
  const note = String(c?.note ?? "").trim();

  if (name.length < 2 || name.length > 60) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) errors.email = "Enter a valid email for your receipt.";
  if (phone.length < 10 || phone.length > 15) errors.phone = "Enter a phone number we can reach.";
  if (fulfilment === "delivery" && (address.length < 5 || address.length > 200)) errors.address = "Enter your delivery address.";
  if (note.length > 200) errors.note = "Keep the note under 200 characters.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, customer: { name, email, phone, address: fulfilment === "delivery" ? address : "", note } };
}
