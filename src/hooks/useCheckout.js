import { useCallback, useState } from "react";
import { api } from "../services/api.js";
import { buildWhatsAppLink } from "../lib/whatsapp.js";
import { saveCustomer } from "../lib/cartStorage.js";
import { SITE } from "../config/site.js";
import { track } from "../lib/track.js";

const payload = (lines) => lines.map((l) => ({ id: l.item.id, quantity: l.quantity }));

/**
 * Checkout actions for the tray.
 *   payOnline()      → creates an invoice + Paystack payment, then sends the browser to Paystack's hosted page.
 *   shareOnWhatsApp()→ creates an expiring invoice and opens WhatsApp with the order + invoice link
 *                      (falls back to a plain message if the invoice can't be created, so ordering never breaks).
 */
export function useCheckout({ lines, total }) {
  const [busy, setBusy] = useState(null); // "pay" | "whatsapp" | null
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const payOnline = useCallback(
    async ({ customer, fulfilment }) => {
      setBusy("pay");
      setError("");
      setFieldErrors({});
      try {
        saveCustomer(customer);
        track("checkout_click", { channel: "paystack", total });
        const res = await api.checkout({ items: payload(lines), fulfilment, intent: "pay", customer });
        window.location.assign(res.authorizationUrl);
        return true; // leaving the page; keep the spinner up
      } catch (e) {
        setFieldErrors(e.data?.fields ?? {});
        setError(e.status === 422 ? "" : e.message);
        setBusy(null);
        return false;
      }
    },
    [lines, total],
  );

  const shareOnWhatsApp = useCallback(
    async ({ fulfilment = "pickup" } = {}) => {
      setBusy("whatsapp");
      setError("");
      track("checkout_click", { channel: "whatsapp", total });
      // Open the tab synchronously (inside the tap) so iOS Safari doesn't block it, then point it at WhatsApp.
      const tab = window.open("", "_blank");
      if (tab) tab.opener = null;
      const go = (url) => (tab ? (tab.location.href = url) : window.location.assign(url));

      try {
        const inv = await api.checkout({ items: payload(lines), fulfilment, intent: "invoice" });
        go(buildWhatsAppLink(lines, SITE.whatsappNumber, { invoiceUrl: inv.invoiceUrl, total: inv.total }));
      } catch (e) {
        // Business rules (paused store, sold out, minimum order) must be shown, not bypassed.
        if (e.status && [403, 409, 400].includes(e.status) && e.data?.code) {
          tab?.close();
          setError(e.message);
        } else {
          go(buildWhatsAppLink(lines, SITE.whatsappNumber)); // network trouble: plain WhatsApp order still works
        }
      } finally {
        setBusy(null);
      }
    },
    [lines, total],
  );

  const reset = useCallback(() => {
    setError("");
    setFieldErrors({});
  }, []);

  return { busy, error, fieldErrors, payOnline, shareOnWhatsApp, reset };
}
