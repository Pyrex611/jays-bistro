import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";

/** Bottom sheet (full-width on phones, centred card on larger screens). Used by the storefront info sheet and the console. */
export default function Sheet({ open, title, onClose, children, footer }) {
  const ref = useRef(null);
  useBodyScrollLock(open);
  useEscapeKey(open, onClose);
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex animate-fade-in items-end justify-center bg-leaf-950/50 backdrop-blur-sm sm:items-center sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
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
