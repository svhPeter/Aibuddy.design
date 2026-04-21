/**
 * Builds transparent, icon-only favicons (no matte / no boxed background):
 * - public/favicon.ico (16 + 32 PNG-in-ICO, alpha preserved)
 * - public/icon.png (48×48, for <link rel="icon" type="image/png">)
 * - public/apple-touch-icon.png (180×180, Apple touch; transparent areas stay clear)
 *
 * Source (first match):
 * 1. public/favicon-source.png — preferred (transparent PNG of the mark)
 * 2. public/icon.png
 * 3. public/favicon.ico (if Sharp can decode)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outIco = path.join(root, "public", "favicon.ico");
const outIconPng = path.join(root, "public", "icon.png");
const outApple = path.join(root, "public", "apple-touch-icon.png");

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

async function sharpCanRead(file) {
  try {
    await sharp(file).metadata();
    return true;
  } catch {
    return false;
  }
}

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function resolveSource() {
  const candidates = [
    path.join(root, "public", "favicon-source.png"),
    path.join(root, "public", "icon.png"),
    path.join(root, "public", "favicon.ico"),
  ];
  for (const p of candidates) {
    if (await fileExists(p)) {
      if (p.endsWith(".ico") && !(await sharpCanRead(p))) continue;
      return p;
    }
  }
  throw new Error(
    "No favicon source found. Add public/favicon-source.png (transparent PNG) or public/icon.png.",
  );
}

const input = await resolveSource();

/** Preserve alpha; letterbox with transparent pixels (no black square). */
function rasterForSize(px) {
  return sharp(input)
    .ensureAlpha()
    .resize(px, px, { fit: "contain", background: transparent })
    .png();
}

const [png32, png16, png48, png180] = await Promise.all([
  rasterForSize(32).toBuffer(),
  rasterForSize(16).toBuffer(),
  rasterForSize(48).toBuffer(),
  rasterForSize(180).toBuffer(),
]);

const ico = await pngToIco([png32, png16]);
await fs.writeFile(outIco, ico);
await fs.writeFile(outIconPng, png48);
await fs.writeFile(outApple, png180);

console.log("Source:", path.relative(root, input));
console.log(
  "Wrote",
  [path.relative(root, outIco), path.relative(root, outIconPng), path.relative(root, outApple)].join(", "),
);
