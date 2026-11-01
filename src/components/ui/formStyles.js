/** Shared text-input styling (kept apart from components so React Fast Refresh stays happy). */
export const inputClass = (bad) =>
  `h-12 w-full rounded-xl border bg-cream-50 px-3.5 text-base text-ink-900 outline-none transition placeholder:text-ink-400 focus:ring-2 ${
    bad ? "border-red-400 focus:ring-red-200" : "border-cream-300 focus:border-leaf-500 focus:ring-leaf-200"
  }`;
