import { fail } from "./http.js";
import { storageConfigured } from "./storage.js";

/** Handlers that need storage call this first. Answers 503 (not a crash) while the platform is still in demo mode. */
export function requireStorage(res) {
  if (storageConfigured()) return true;
  fail(res, 503, "Storage isn't connected yet.", { code: "storage_not_configured", mode: "demo" });
  return false;
}
