import { useState } from "react";
import CategoryIcon from "../icons/CategoryIcon.jsx";
import { resolveImageUrl } from "../../lib/image.js";

/**
 * Food image with a graceful, on-brand fallback (the category's line icon) if the file is missing or offline.
 * variant="cutout": transparent PNG, contained with a soft shadow (sits on a dark tile).
 * variant="photo":  rectangular photo, covers its box.
 */
export default function FoodImage({ src, alt, variant = "photo", icon = "meals", className = "", ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const url = resolveImageUrl(src);

  if (!url || failedSrc === url) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-leaf-700/15 text-leaf-200 ${className}`}>
        <CategoryIcon name={icon} size={36} className="opacity-70" />
      </div>
    );
  }

  const fit = variant === "cutout" ? "object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" : "object-cover";
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(url)}
      className={`${fit} ${className}`}
      {...rest}
    />
  );
}
