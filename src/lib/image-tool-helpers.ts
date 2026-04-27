/** Client-side only helpers for canvas-based image tools. */

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.drawImage(img, 0, 0);
  return c;
}

export function scaleCanvas(
  source: HTMLCanvasElement | HTMLImageElement,
  targetW: number,
  targetH: number,
  mode: "cover" | "contain"
): HTMLCanvasElement {
  const sw =
    "naturalWidth" in source && source.naturalWidth
      ? source.naturalWidth
      : (source as HTMLCanvasElement).width;
  const sh =
    "naturalHeight" in source && source.naturalHeight
      ? source.naturalHeight
      : (source as HTMLCanvasElement).height;
  const c = document.createElement("canvas");
  c.width = targetW;
  c.height = targetH;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  if (mode === "contain") {
    const r = Math.min(targetW / sw, targetH / sh);
    const w = sw * r;
    const h = sh * r;
    const x = (targetW - w) / 2;
    const y = (targetH - h) / 2;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(source, 0, 0, sw, sh, x, y, w, h);
  } else {
    const r = Math.max(targetW / sw, targetH / sh);
    const w = sw * r;
    const h = sh * r;
    const x = (targetW - w) / 2;
    const y = (targetH - h) / 2;
    ctx.drawImage(source, 0, 0, sw, sh, x, y, w, h);
  }
  return c;
}
