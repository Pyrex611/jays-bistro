import { useState } from "react";

const fallbackFor = (alt) => `https://placehold.co/400x400/2A2A28/E1ECA9?text=${encodeURIComponent(alt)}`;

/**
 * Food image with a graceful fallback.
 * variant="cutout": transparent PNG, contained with a soft drop shadow (sits on a dark card).
 * variant="photo":  rectangular photo, covers its box.
 */
export default function FoodImage({ src, alt, variant = "photo", className = "", ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = failedSrc === src;
  const fit = variant === "cutout" && !failed ? "object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" : "object-cover";

  return (
    <img
      src={failed ? fallbackFor(alt) : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={`${fit} ${className}`}
      {...rest}
    />
  );
}
