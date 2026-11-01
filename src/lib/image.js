import { assetUrl } from "../config/site.js";
import { demoStorage } from "../demo/storage.js";

/** Menu images are either absolute URLs (S3, Unsplash) or paths under /public such as "menu/jollof.png". */
export const resolveImageUrl = (src) => {
  if (!src) return "";
  // Demo mode keeps merchant uploads in this browser (see demo/demoApi.js → uploadImage).
  if (src.startsWith("uploads/demo-")) return demoStorage.get(`jb:demo:img:${src.slice("uploads/".length)}`) ?? "";
  return /^(https?:)?\/\//.test(src) || src.startsWith("data:") ? src : assetUrl(src.replace(/^\//, ""));
};
