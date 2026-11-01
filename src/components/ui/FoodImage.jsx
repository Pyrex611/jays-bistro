import { useState } from "react";
import CategoryIcon from "../icons/CategoryIcon.jsx";
import { resolveImageUrl } from "../../lib/image.js";

const isPlaceholder = (url) => /placeholder\.svg$/.test(url);

/**
 * Food image with an honest, on-brand fallback: if a dish has no photo (or the file is missing/offline) we show the category's
 * line icon on a soft pastel tile, never a wrong photo.
 * variant="cutout": transparent PNG, contained with a soft shadow. variant="photo": rectangular photo, covers its box.
 */
export default function FoodImage({ src, alt, variant = "photo", icon = "meals", className = "", ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const url = resolveImageUrl(src);

  if (!url || isPlaceholder(url) || failedSrc === url) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-white/25 text-leaf-700 ${className}`}>
        <CategoryIcon name={icon} size={40} className="opacity-70" />
      </div>
    );
  }

  const fit = variant === "cutout" ? "object-contain drop-shadow-[0_6px_8px_rgba(20,50,25,0.28)]" : "object-cover";
  return <img src={url} alt={alt} loading="lazy" decoding="async" onError={() => setFailedSrc(url)} className={`${fit} ${className}`} {...rest} />;
}
