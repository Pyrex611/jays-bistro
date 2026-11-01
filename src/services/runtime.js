/**
 * Which integrations are connected? Filled from `/api/menu` → `capabilities`.
 * Every integration (storage, payments, email, order status) has a REAL implementation and a DEMO one;
 * `isDemo()` picks per call. When Vercel Blob / Paystack / email are connected the server reports it and the demo
 * code simply stops being used. No front-end change is needed to switch over.
 */
let capabilities = null;
let demo = null; // true | false | null (not known yet)
const listeners = new Set();
let waiters = [];

const notify = () => {
  waiters.splice(0).forEach((resolve) => resolve());
  listeners.forEach((fn) => fn());
};

export const runtime = {
  get capabilities() {
    return capabilities;
  },
  setCapabilities(next) {
    capabilities = next;
    if (next) demo = next.storage === false;
    notify();
  },
  setDemo(value) {
    demo = value;
    notify();
  },
  isDemo: () => demo === true,
  isKnown: () => demo !== null,
  /** Resolves once we know, or after `timeoutMs` (then we assume the real backend). */
  whenReady(timeoutMs = 3000) {
    if (demo !== null) return Promise.resolve();
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, timeoutMs);
      waiters.push(() => {
        clearTimeout(timer);
        resolve();
      });
    });
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  reset() {
    capabilities = null;
    demo = null;
    waiters = [];
  },
};
