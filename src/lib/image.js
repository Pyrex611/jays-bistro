import { assetUrl } from "../config/site.js";

/** Menu images are either absolute URLs (S3, Unsplash) or paths under /public such as "menu/jollof.png". */
export const resolveImageUrl = (src) => {
  if (!src) return "";
  return /^(https?:)?\/\//.test(src) || src.startsWith("data:") ? src : assetUrl(src.replace(/^\//, ""));
};
