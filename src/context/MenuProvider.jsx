import { useEffect, useMemo, useState } from "react";
import { MenuContext } from "./MenuContext.js";
import { api } from "../services/api.js";
import { runtime } from "../services/runtime.js";
import { demoApi } from "../demo/demoApi.js";
import { buildMenuModel } from "../lib/menuModel.js";
import { defaultMenuDoc, validateMenuDoc } from "../lib/menuDoc.js";

const CACHE_KEY = "jb:menu:v3";

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
 *   1. First paint: last good menu on this device, else the bundled catalogue (never a blank screen).
 *   2. Then /api/menu (edge-cached 30 s). In demo mode (no storage connected) the merchant's browser-local edits are used instead.
 *   3. Re-reads whenever the console publishes (`jb:menu-published`), so SPA navigation shows changes without a reload.
 */
export default function MenuProvider({ children }) {
  const [doc, setDoc] = useState(() => readCache() ?? defaultMenuDoc());
  const [capabilities, setCapabilities] = useState(runtime.capabilities);

  useEffect(() => {
    const controller = new AbortController();

    const apply = (source) => {
      const v = validateMenuDoc(source);
      if (!v.ok) return;
      setDoc(v.doc);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(v.doc));
      } catch {
        /* ignore */
      }
    };

    const load = (signal) =>
      api
        .menu(signal)
        .then((remote) => {
          setCapabilities(remote.capabilities);
          apply(remote.capabilities?.storage === false ? demoApi.menu() : remote);
        })
        .catch((e) => {
          // No API at all (404, e.g. static hosting) → demo; any other error keeps what is on screen.
          if (e?.status === 404) {
            setCapabilities(runtime.capabilities);
            apply(demoApi.menu());
          }
        });

    load(controller.signal);
    const refresh = () => load();
    window.addEventListener("jb:menu-published", refresh);
    return () => {
      controller.abort();
      window.removeEventListener("jb:menu-published", refresh);
    };
  }, []);

  const value = useMemo(
    () => ({
      ...buildMenuModel({ items: doc.items, categories: doc.categories, heroIds: doc.layout.heroIds, subheroIds: doc.layout.subheroIds, settings: doc.settings }),
      capabilities,
    }),
    [doc, capabilities],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
