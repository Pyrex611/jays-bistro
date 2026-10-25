import { Minus, Plus } from "lucide-react";

/** Compact − qty + control. `tone="light"` for white surfaces, `tone="dark"` for dark ones. */
export default function QuantityStepper({ quantity, onDecrement, onIncrement, label, size = 18, tone = "light" }) {
  const surface = tone === "dark" ? "bg-ink-800 text-white" : "bg-ink-100 text-ink-900";
  return (
    <div className={`flex items-center justify-between rounded-full px-2 py-1 ${surface}`} role="group" aria-label={`${label} quantity`}>
      <button type="button" onClick={onDecrement} aria-label={`Decrease ${label}`} className="flex h-8 w-8 items-center justify-center rounded-full transition hover:text-sprout-500 active:scale-95">
        <Minus size={size} />
      </button>
      <span className="min-w-[2ch] px-2 text-center font-bold" aria-live="polite">{quantity}</span>
      <button type="button" onClick={onIncrement} aria-label={`Increase ${label}`} className="flex h-8 w-8 items-center justify-center rounded-full transition hover:text-sprout-500 active:scale-95">
        <Plus size={size} />
      </button>
    </div>
  );
}
