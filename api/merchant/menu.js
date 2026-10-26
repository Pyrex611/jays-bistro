import { allow, fail, ok, parseBody, requireAjax } from "../_lib/http.js";
import { requireMerchant } from "../_lib/auth.js";
import { loadMenuDoc, MenuConflict, MenuInvalid, saveMenuDoc } from "../_lib/menuStore.js";

/**
 * /api/merchant/menu  (password-protected)
 *   GET → the current menu document (with version)
 *   PUT { doc, baseVersion } → validate + publish. 409 if someone published since baseVersion.
 */
export default async function handler(req, res) {
  if (!allow(req, res, ["GET", "PUT"])) return;
  if (!(await requireMerchant(req, res))) return;

  if (req.method === "GET") return ok(res, await loadMenuDoc({ strict: true }));

  if (!requireAjax(req, res)) return;
  const { doc, baseVersion } = parseBody(req);
  try {
    return ok(res, await saveMenuDoc(doc, baseVersion));
  } catch (e) {
    if (e instanceof MenuConflict) return fail(res, 409, e.message, { current: e.current });
    if (e instanceof MenuInvalid) return fail(res, 400, "Some fields need fixing.", { errors: e.errors });
    throw e;
  }
}
