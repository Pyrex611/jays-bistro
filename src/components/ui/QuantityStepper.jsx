import { Minus, Plus } from "lucide-react";

/** Compact − qty + control. */
export default function QuantityStepper({ quantity, onDecrement, onIncrement, label, size = 18, disableIncrement = false }) {
  return (
    <div className="flex items-center justify-between rounded-full bg-cream-200 px-1.5 py-0.5 text-ink-900" role="group" aria-label={`${label} quantity`}>
      <button type="button" onClick={onDecrement} aria-label={`Decrease ${label}`} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:text-leaf-700 active:scale-95">
        <Minus size={size} />
      </button>
      <span className="min-w-[2ch] px-2 text-center font-bold tabular-nums" aria-live="polite">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disableIncrement}
        aria-label={`Increase ${label}`}
        className="flex h-9 w-9 items-center justify-center rounded-full transition hover:text-leaf-700 active:scale-95 disabled:opacity-40"
      >
        <Plus size={size} />
      </button>
    </div>
  );
}
