/** Label above the control (faster to scan on mobile), with an inline error or hint beneath. */
export function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-ink-700">{label}</label>
      {children}
      {error ? <p role="alert" className="mt-1 text-xs font-medium text-red-600">{error}</p> : hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}
