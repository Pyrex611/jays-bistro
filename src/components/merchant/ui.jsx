import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";

/** Accessible on/off switch. */
export function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-leaf-600" : "bg-ink-300"}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

/** Bottom sheet (full-width on phones, centred card on larger screens). */
export function Sheet({ open, title, onClose, children, footer }) {
  const ref = useRef(null);
  useBodyScrollLock(open);
  useEscapeKey(open, onClose);
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex animate-fade-in items-end justify-center bg-leaf-950/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref} className="flex max-h-[92svh] w-full max-w-md animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-cream-50 shadow-2xl outline-none sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-cream-300 px-5 py-3">
          <h2 className="font-display text-lg font-extrabold text-leaf-800">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-200"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-cream-300 bg-cream-50 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>
  );
}

export const Card = ({ className = "", children }) => <section className={`rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-sm ${className}`}>{children}</section>;

export const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-full bg-leaf-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-leaf-800 active:scale-[0.99] disabled:opacity-50";
export const btnGhost = "inline-flex items-center justify-center gap-2 rounded-full border border-cream-400 bg-cream-50 px-5 py-3 text-sm font-bold text-ink-700 transition hover:bg-cream-200 disabled:opacity-50";
export const btnDanger = "inline-flex items-center justify-center gap-2 rounded-full border border-red-300 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50";
