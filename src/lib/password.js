/** Rules for a new merchant password: shared by the API and the demo backend. Returns an error message or null. */
export function validateNewPassword(pw) {
  if (typeof pw !== "string" || pw.length < 10) return "Use at least 10 characters.";
  if (pw.length > 128) return "That password is too long.";
  if (/^(.)\1+$/.test(pw)) return "Choose something less repetitive.";
  return null;
}
