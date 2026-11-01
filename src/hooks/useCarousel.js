import { useCallback, useEffect, useRef, useState } from "react";
import { CAROUSEL_INTERVAL_MS } from "../config/site.js";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll-snap carousel controller with autoplay.
 * Autoplay pauses while the tab is hidden, after any user interaction, and for reduced-motion users.
 */
export function useCarousel(count) {
  const trackRef = useRef(null);
  const indexRef = useRef(0);
  const lastInteractionRef = useRef(0);
  const [index, setIndex] = useState(0);

  const setActive = useCallback((i) => {
    indexRef.current = i;
    setIndex(i);
  }, []);

  const goTo = useCallback(
    (i) => {
      const track = trackRef.current;
      const slide = track?.querySelectorAll("[data-slide]")[i];
      if (!track || !slide) return;
      const left = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
      track.scrollTo({ left, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      setActive(i);
    },
    [setActive],
  );

  const markInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  /** Jump to a slide because the user asked to (dot tap). */
  const selectSlide = useCallback(
    (i) => {
      markInteraction();
      goTo(i);
    },
    [goTo, markInteraction],
  );

  /** Keep the active dot in sync with manual swiping. */
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = [...track.querySelectorAll("[data-slide]")];
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let minDistance = Infinity;
    slides.forEach((slide, i) => {
      const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - trackCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closest = i;
      }
    });
    if (closest !== indexRef.current) setActive(closest);
  }, [setActive]);

  useEffect(() => {
    if (count < 2 || prefersReducedMotion()) return undefined;
    const timer = setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - lastInteractionRef.current < CAROUSEL_INTERVAL_MS) return;
      goTo((indexRef.current + 1) % count);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count, goTo]);

  return { trackRef, index: Math.min(index, Math.max(count - 1, 0)), selectSlide, onScroll, markInteraction };
}
