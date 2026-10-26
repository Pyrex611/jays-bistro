import { useEffect, useMemo, useState } from "react";
import { MenuContext } from "./MenuContext.js";
import { api } from "../services/api.js";
import { buildMenuModel } from "../lib/menuModel.js";
import { defaultMenuDoc, validateMenuDoc } from "../lib/menuDoc.js";

const CACHE_KEY = "jb:menu:v2";

const readCache = () => {
  try {
    const v = validateMenuDoc(JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null"));
    return v.ok ? v.doc : null;
  } catch {
    return null;
  }
};

/**
 * Menu source for the whole app.
 *   1. First paint: last good menu from this device, else the bundled catalogue (never a blank screen).
 *   2. Then /api/menu (merchant-published, edge-cached 30 s). If it fails the first paint stays.
 */
export default function MenuProvider({ children }) {
  const [doc, setDoc] = useState(() => readCache() ?? defaultMenuDoc());

  useEffect(() => {
    const controller = new AbortController();
    api
      .menu(controller.signal)
      .then((remote) => {
        const v = validateMenuDoc(remote);
        if (!v.ok) return;
        setDoc(v.doc);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(v.doc));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const value = useMemo(
    () => buildMenuModel({ items: doc.items, categories: doc.categories, heroIds: doc.layout.heroIds, subheroIds: doc.layout.subheroIds, settings: doc.settings }),
    [doc],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
