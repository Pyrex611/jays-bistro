// One-time helper: copies the 8 bundled menu photos from src/assets/images to public/menu with stable, readable names.
// Usage: npm run images:migrate   (safe to re-run; never deletes anything)
import fs from "node:fs";
import path from "node:path";

const MAP = {
  "Isi-Ewu.jpg": "isi-ewu.jpg",
  "classic-arabian.jpg": "classic-arabian-blend.jpg",
  "IMG_2113.PNG": "chicken-caesar-salad.png",
  "IMG_2134.PNG": "basmati-fried-rice.png",
  "IMG_2135.PNG": "spiced-meat-samosa.png",
  "IMG_2136.PNG": "puff-puff.png",
  "IMG_2138.PNG": "party-jollof-rice.png",
  "IMG_1989.PNG": "yam-and-egg-sauce.png",
};
const from = path.resolve("src/assets/images");
const to = path.resolve("public/menu");
fs.mkdirSync(to, { recursive: true });

let copied = 0;
let missing = 0;
for (const [src, dest] of Object.entries(MAP)) {
  const srcPath = path.join(from, src);
  if (!fs.existsSync(srcPath)) {
    console.warn(`MISSING  ${path.relative(".", srcPath)}`);
    missing += 1;
    continue;
  }
  fs.copyFileSync(srcPath, path.join(to, dest));
  console.log(`copied   ${src}  ->  public/menu/${dest}`);
  copied += 1;
}
console.log(`\nDone: ${copied} copied, ${missing} missing.`);
if (missing) process.exitCode = 1;
