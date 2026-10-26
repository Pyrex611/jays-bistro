import crypto from "node:crypto";
import { allow, fail, ok, parseBody, requireAjax } from "../_lib/http.js";
import { requireMerchant } from "../_lib/auth.js";
import { getStorage } from "../_lib/storage.js";

const MAX_BYTES = 1_500_000; // the portal compresses to well under this before uploading

const sniff = (buf) => {
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  if (buf.length > 8 && buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") return { ext: "png", type: "image/png" };
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  return null;
};

/** POST /api/merchant/image { dataUrl } → { url }  (password-protected; WebP/PNG/JPEG only, ≤ 1.5 MB) */
export default async function handler(req, res) {
  if (!allow(req, res, ["POST"])) return;
  if (!requireAjax(req, res)) return;
  if (!(await requireMerchant(req, res))) return;

  const match = /^data:image\/(?:webp|png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(String(parseBody(req).dataUrl ?? ""));
  if (!match) return fail(res, 400, "Upload a WebP, PNG or JPEG image.");

  const buffer = Buffer.from(match[1], "base64");
  if (buffer.length > MAX_BYTES) return fail(res, 413, "That image is too large. Try a smaller photo.");
  const kind = sniff(buffer); // trust the bytes, not the label
  if (!kind) return fail(res, 400, "That file doesn't look like an image.");

  const storage = getStorage();
  const key = `images/${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.${kind.ext}`;
  await storage.putBinary(key, buffer, kind.type);
  return ok(res, { url: storage.publicUrl(key) });
}
