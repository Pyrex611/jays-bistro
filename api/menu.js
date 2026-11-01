import { allow, send } from "./_lib/http.js";
import { loadMenuDoc } from "./_lib/menuStore.js";
import { storageConfigured } from "./_lib/storage.js";
import { paystackMode } from "./_lib/paystack.js";

/**
 * GET /api/menu — the live menu (public) plus which integrations are connected.
 * `capabilities` lets the app pick real vs demo behaviour per integration, so connecting storage / Paystack / email
 * later needs no front-end change: each demo module switches off by itself.
 * Cached at the edge for 30s so menu edits go live within a minute.
 */
export default async function handler(req, res) {
  if (!allow(req, res, ["GET"])) return;
  const connected = storageConfigured();
  const doc = connected ? await loadMenuDoc() : { ...(await loadMenuDoc()), source: "default" };
  const capabilities = { storage: connected, payments: connected ? paystackMode() : "demo", email: false, orderStatus: false };
  send(res, 200, { ...doc, capabilities }, { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" });
}
