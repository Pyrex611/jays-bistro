import { useCallback, useEffect, useRef, useState } from "react";
import { pickActiveGroup } from "../lib/scrollSpy.js";

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const startOf = (name) => document.querySelector(`[data-group-start="${CSS.escape(name)}"]`);

/**
 * Tracks which menu group is "current" while scrolling and lets the category bar jump to a group.
 * `getLine()` returns the viewport Y (px) that a group's first card must rise above to become current.
 * Updates are rAF-throttled; after a tap-to-jump, spying pauses briefly so the pill doesn't flicker through groups on the way.
 */
export function useScrollSpy(names, { enabled = true, getLine }) {
  const [active, setActive] = useState(names[0] ?? null);
  const lockUntil = useRef(0);
  const key = names.join("|");

  useEffect(() => {
    if (!enabled || names.length === 0) return undefined;
    let frame = 0;

    const compute = () => {
      frame = 0;
      if (performance.now() < lockUntil.current) return;
      const groups = names.map((name) => ({ name, el: startOf(name) })).filter((g) => g.el).map((g) => ({ name: g.name, top: g.el.getBoundingClientRect().top }));
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const next = pickActiveGroup(groups, getLine(), atBottom);
      if (next) setActive(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key, getLine]);

  const jumpTo = useCallback((name) => {
    const el = startOf(name);
    if (!el) return;
    setActive(name);
    lockUntil.current = performance.now() + 800;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }, []);

  return { active: active ?? names[0] ?? null, jumpTo };
}
