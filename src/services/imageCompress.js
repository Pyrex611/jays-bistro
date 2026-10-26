/**
 * Browser-side image prep for menu photos: downscale, re-encode, and make sure the result fits the 1.5 MB server limit.
 * Cutouts keep transparency (WebP, or PNG on browsers that can't encode WebP, e.g. iOS Safari); photos become JPEG.
 */
const MAX_BYTES = 1_200_000;

const loadBitmap = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file couldn't be read as an image."));
    };
    img.src = url;
  });

const bytesOf = (dataUrl) => Math.floor((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75);

/** @param {File} file @param {"cutout"|"photo"} style @returns {Promise<string>} data URL */
export async function prepareImage(file, style = "photo") {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  const img = await loadBitmap(file);

  for (const maxSide of [1000, 800, 640, 480]) {
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

    const dataUrl = style === "cutout" ? canvas.toDataURL("image/webp", 0.88) : canvas.toDataURL("image/jpeg", 0.84);
    if (bytesOf(dataUrl) <= MAX_BYTES) return dataUrl;
  }
  throw new Error("That image is too large to upload. Try a smaller photo.");
}
