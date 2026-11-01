import Sheet from "../ui/Sheet.jsx";

export { Sheet };

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

export const Card = ({ className = "", children }) => <section className={`rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-sm ${className}`}>{children}</section>;

export const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-full bg-leaf-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-leaf-800 active:scale-[0.99] disabled:opacity-50";
export const btnGhost = "inline-flex items-center justify-center gap-2 rounded-full border border-cream-400 bg-cream-50 px-5 py-3 text-sm font-bold text-ink-700 transition hover:bg-cream-200 disabled:opacity-50";
export const btnDanger = "inline-flex items-center justify-center gap-2 rounded-full border border-red-300 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50";
