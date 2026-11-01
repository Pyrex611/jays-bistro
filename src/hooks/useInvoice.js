import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api.js";
import { clearStoredCart } from "../lib/cartStorage.js";

const POLL_MS = 3000;
const POLL_MAX = 10;

/**
 * Loads /invoice/:id. Phases: loading | pending | paid | expired | missing | error.
 * If the customer just came back from Paystack (?reference=…) and payment isn't confirmed yet
 * (bank transfers can lag), it re-checks every 3 s for ~30 s before telling them to refresh.
 */
export function useInvoice(id) {
  const [state, setState] = useState({ phase: "loading" });
  const [version, setVersion] = useState(0);
  const polls = useRef(0);

  const reload = useCallback(() => {
    polls.current = 0;
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer;
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    const mock = params.get("mock");

    const load = async () => {
      try {
        const res = await api.invoice(id, reference, mock);
        if (cancelled) return;
        if (res.status === "paid") {
          clearStoredCart();
          setState({ phase: "paid", receipt: res.receipt, mode: res.mode });
          return;
        }
        const waiting = Boolean(reference) && polls.current < POLL_MAX;
        setState({ phase: "pending", invoice: res.invoice, confirming: waiting, gaveUp: Boolean(reference) && !waiting });
        if (waiting) {
          polls.current += 1;
          timer = setTimeout(load, POLL_MS);
        }
      } catch (e) {
        if (cancelled) return;
        if (e.status === 410) setState({ phase: "expired", code: e.data?.code });
        else if (e.status === 404) setState({ phase: "missing" });
        else setState({ phase: "error", message: e.message });
      }
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, version]);

  return { ...state, reload };
}
