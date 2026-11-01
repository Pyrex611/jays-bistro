/** Demo persistence: localStorage when available (survives refreshes), with an in-memory shadow so nothing breaks if the quota is hit. */
const memory = new Map();
const ls = () => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};

export const demoStorage = {
  get(key, fallback = null) {
    try {
      const raw = ls()?.getItem(key) ?? memory.get(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    const raw = JSON.stringify(value);
    memory.set(key, raw);
    try {
      ls()?.setItem(key, raw);
    } catch {
      /* quota: the in-memory copy keeps this session working */
    }
  },
  remove(key) {
    memory.delete(key);
    try {
      ls()?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
  clearAll(prefix = "jb:demo:") {
    for (const k of [...memory.keys()]) if (k.startsWith(prefix)) memory.delete(k);
    try {
      const store = ls();
      if (store) Object.keys(store).filter((k) => k.startsWith(prefix)).forEach((k) => store.removeItem(k));
    } catch {
      /* ignore */
    }
  },
};
