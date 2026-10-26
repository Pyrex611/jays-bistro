import { allow, send } from "./_lib/http.js";
import { loadMenuDoc } from "./_lib/menuStore.js";

/** GET /api/menu — the live menu (public). Cached at the edge for 30s so menu edits go live within a minute. */
export default async function handler(req, res) {
  if (!allow(req, res, ["GET"])) return;
  const doc = await loadMenuDoc();
  send(res, 200, doc, { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" });
}
