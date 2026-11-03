import { useState } from "react";
import { Check, ExternalLink, Link2, Pencil, X } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import { Sheet, btnGhost, btnPrimary } from "./ui.jsx";
import { formatPrice, getDishUrl } from "../../lib/format.js";

/**
 * Read-only dish preview modal for the merchant console.
 * Displays dish details, the "Copy dish link" button, and a pencil button to edit.
 */
export default function DishPreviewModal({ item, icon, onClose, onEdit }) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;
  const dishUrl = getDishUrl(item.id);
  const soldOut = item.isAvailable === false;
  const isCutout = item.imageStyle === "cutout";

  const copyDishLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(dishUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = dishUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  };

  return (
    <Sheet
      open
      title={item.name}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button type="button" className={`${btnGhost} flex-1`} onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className={`${btnPrimary} flex-1`}
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.name}`}
          >
            <Pencil size={16} /> Edit dish
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Image preview with quick edit pencil button overlay */}
        <div className="surface-sage-tile relative h-56 w-full overflow-hidden rounded-2xl shadow-card">
          <FoodImage
            src={item.image}
            alt={item.name}
            variant={item.imageStyle}
            icon={icon}
            className={`h-full w-full ${isCutout ? "p-4" : ""} ${soldOut ? "opacity-50 grayscale" : ""}`}
          />
          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Edit this dish"
            aria-label={`Edit ${item.name}`}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-cream-50/95 text-leaf-800 shadow-md transition hover:bg-white hover:scale-105 active:scale-95"
          >
            <Pencil size={18} />
          </button>
        </div>

        {/* Read-only dish details */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-sun-700">
              {item.category}
            </span>
            <span className="font-display text-xl font-extrabold text-leaf-700">
              {formatPrice(item.price)}
            </span>
          </div>

          <h3 className="mt-1 font-display text-2xl font-extrabold text-leaf-800">
            {item.name}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            {item.description || "No description provided."}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                soldOut ? "bg-apricot-200 text-sun-900" : "bg-sage-200 text-leaf-900"
              }`}
            >
              {soldOut ? "Sold out today" : "In stock"}
            </span>
            <span className="inline-flex items-center rounded-full bg-cream-200 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
              {isCutout ? "Cutout photo" : "Cover photo"}
            </span>
            {item.featured && (
              <span className="inline-flex items-center rounded-full bg-sun-200 px-2.5 py-0.5 text-xs font-bold text-sun-900">
                Featured
              </span>
            )}
            {!item.isActive && (
              <span className="inline-flex items-center rounded-full bg-ink-200 px-2.5 py-0.5 text-xs font-bold text-ink-700">
                Hidden
              </span>
            )}
          </div>
        </div>

        {/* Shareable customer link card hosting the "Copy dish link" button */}
        <div className="rounded-2xl border border-cream-300 bg-cream-100 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-leaf-900">Customer Dish Link</p>
              <p className="truncate font-mono text-[11px] text-ink-500">{dishUrl}</p>
            </div>
            <button
              type="button"
              onClick={copyDishLink}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-leaf-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-leaf-800 active:scale-95"
            >
              {copied ? <Check size={14} /> : <Link2 size={14} />}
              {copied ? "Link copied!" : "Copy dish link"}
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-cream-300/80 pt-2 text-xs">
            <span className="text-[11px] text-ink-500">
              Leads customers directly to the menu with this dish open
            </span>
            <a
              href={`/menu?dish=${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-leaf-700 hover:text-leaf-800 underline underline-offset-2"
            >
              Open in menu <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </Sheet>
  );
}