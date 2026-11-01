import { Switch } from "./ui.jsx";

/** A titled settings card with an anchor id (so the section chips can scroll to it). */
export function Section({ id, icon: Icon, title, subtitle, badge, children }) {
  return (
    <section id={`settings-${id}`} className="scroll-mt-36 rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && <span className="surface-sage flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-leaf-800"><Icon size={20} /></span>}
          <div className="min-w-0">
            <h2 className="font-display text-base font-extrabold text-leaf-800">{title}</h2>
            {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
          </div>
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}

export const SwitchRow = ({ title, hint, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between gap-3 py-3">
    <div className="min-w-0">
      <p className="text-sm font-bold">{title}</p>
      {hint && <p className="text-[11px] text-ink-500">{hint}</p>}
    </div>
    <Switch checked={checked} onChange={onChange} label={title} disabled={disabled} />
  </div>
);

export const Row = ({ title, hint, children }) => (
  <div className="flex items-center justify-between gap-3 py-3">
    <div className="min-w-0">
      <p className="text-sm font-bold">{title}</p>
      {hint && <p className="text-[11px] text-ink-500">{hint}</p>}
    </div>
    {children}
  </div>
);

/** Whole-number input with a prefix/suffix. Keeps digits only. */
export function NumberBox({ id, value, onChange, prefix, suffix, width = "w-28", label, step }) {
  return (
    <div className={`relative ${width} flex-shrink-0`}>
      {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-500">{prefix}</span>}
      <input
        id={id}
        aria-label={label}
        inputMode={step ? "decimal" : "numeric"}
        value={value}
        onChange={(e) => {
          const raw = step ? e.target.value.replace(/[^\d.]/g, "") : e.target.value.replace(/\D/g, "");
          onChange(raw === "" ? 0 : Number(raw));
        }}
        className={`h-11 w-full rounded-xl border border-cream-300 bg-cream-50 text-right text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200 ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-8" : "pr-3"}`}
      />
      {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-500">{suffix}</span>}
    </div>
  );
}

/** Small status pill used across the console. */
export function Badge({ tone = "neutral", children }) {
  const tones = {
    neutral: "bg-cream-300 text-ink-700",
    good: "bg-sage-200 text-leaf-900",
    warn: "bg-apricot-300 text-sun-900",
    demo: "bg-apricot-200 text-sun-900 ring-1 ring-apricot-400",
    bad: "bg-red-100 text-red-700",
    soon: "bg-cream-200 text-ink-500 ring-1 ring-cream-400",
  };
  return <span className={`inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}
