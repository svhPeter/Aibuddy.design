/**
 * Flattens the logo onto #000 and writes:
 * - public/favicon.ico (16 + 32 ICO)
 * - src/app/icon.png (32×32 for Next.js)
 *
 * Source (first match):
 * 1. public/favicon-source.png — preferred; replace when updating the mark
 * 2. public/favicon.ico — if Sharp can decode it
 * 3. src/app/icon.png — last resort for regeneration
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outIco = path.join(root, "public", "favicon.ico");
const outPng = path.join(root, "src", "app", "icon.png");

const black = { r: 0, g: 0, b: 0, alpha: 1 };

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
  const pngSource = path.join(root, "public", "favicon-source.png");
  if (await fileExists(pngSource)) return pngSource;

  const icoPath = path.join(root, "public", "favicon.ico");
  if (await fileExists(icoPath) && (await sharpCanRead(icoPath))) return icoPath;

  const iconPng = path.join(root, "src", "app", "icon.png");
  if (await fileExists(iconPng)) return iconPng;

  throw new Error(
    "No favicon source found. Add public/favicon-source.png (transparent PNG) or a Sharp-readable public/favicon.ico.",
  );
}

const input = await resolveSource();
const base = sharp(input).ensureAlpha().flatten({ background: black });

const [png32, png16] = await Promise.all([
  base.clone().resize(32, 32).png().toBuffer(),
  base.clone().resize(16, 16).png().toBuffer(),
]);

const ico = await pngToIco([png32, png16]);
await fs.writeFile(outIco, ico);
await fs.writeFile(outPng, png32);

console.log("Source:", path.relative(root, input));
console.log("Wrote", path.relative(root, outIco), "and", path.relative(root, outPng));
