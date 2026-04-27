import { useState, useCallback } from "react";
import { fileToImage, imageToCanvas, downloadBlob } from "@/lib/image-tool-helpers";
import { Download } from "lucide-react";

type Fmt = "image/png" | "image/jpeg" | "image/webp";

const ext: Record<Fmt, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Fmt>("image/png");
  const [quality, setQuality] = useState(0.9);
  const [name, setName] = useState("out");

  const go = useCallback(() => {
    if (!file) return;
    void (async () => {
      const img = await fileToImage(file);
      const canvas = imageToCanvas(img);
      const q = format === "image/png" ? undefined : quality;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(
          (b) => resolve(b),
          format,
          format === "image/png" ? undefined : q
        )
      );
      if (!blob) return;
      downloadBlob(blob, `${name}.${ext[format]}`);
    })();
  }, [file, format, quality, name]);

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        Re-encode a single image. Transparent PNGs stay on PNG; JPEG/WebP drop alpha.
      </p>
      <input
        type="file"
        accept="image/*"
        className="input-brutal p-2 text-xs"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setFile(f);
          if (f) setName(f.name.replace(/\.[^.]+$/, "") || "out");
        }}
      />
      {file && (
        <>
          <div>
            <label className="font-oswald text-xs font-bold uppercase block mb-1">
              Format
            </label>
            <select
              className="input-brutal"
              value={format}
              onChange={(e) => setFormat(e.target.value as Fmt)}
            >
              <option value="image/png">PNG (lossless)</option>
              <option value="image/jpeg">JPG (lossy)</option>
              <option value="image/webp">WebP (lossy, often smaller)</option>
            </select>
          </div>
          {format !== "image/png" && (
            <div>
              <label className="font-oswald text-xs font-bold uppercase block mb-1">
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min={0.5}
                max={0.99}
                step={0.01}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
          <button
            type="button"
            onClick={go}
            className="inline-flex items-center gap-2 btn-brutal btn-brutal-yellow"
          >
            <Download size={16} />
            download
          </button>
        </>
      )}
    </div>
  );
}
