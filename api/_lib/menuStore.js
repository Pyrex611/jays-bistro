import { getStorage } from "./storage.js";
import { defaultMenuDoc, validateMenuDoc } from "../../src/lib/menuDoc.js";

const KEY = "data/menu.json";

/** Loads the live menu. Public reads never fail: they fall back to the bundled default catalogue. */
export async function loadMenuDoc({ strict = false } = {}) {
  try {
    const stored = await getStorage().getJSON(KEY);
    if (stored) {
      const v = validateMenuDoc(stored);
      if (v.ok) return { ...v.doc, version: stored.version ?? 0, updatedAt: stored.updatedAt ?? null, source: "storage" };
    }
  } catch (e) {
    if (strict) throw e;
  }
  return { ...defaultMenuDoc(), source: "default" };
}

export class MenuConflict extends Error {
  constructor(current) {
    super("The menu changed since you opened it.");
    this.current = current;
  }
}
export class MenuInvalid extends Error {
  constructor(errors) {
    super("Menu validation failed");
    this.errors = errors;
  }
}

/** Optimistic concurrency: the caller must pass the version it loaded. */
export async function saveMenuDoc(input, baseVersion) {
  const current = await loadMenuDoc({ strict: true });
  if (baseVersion !== current.version) throw new MenuConflict(current);
  const v = validateMenuDoc(input);
  if (!v.ok) throw new MenuInvalid(v.errors);
  const doc = { ...v.doc, version: current.version + 1, updatedAt: new Date().toISOString() };
  await getStorage().putJSON(KEY, doc);
  return { ...doc, source: "storage" };
}
