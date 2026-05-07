import { useState, useCallback, useEffect } from "react";
import {
  fileToImage,
  imageToCanvas,
  downloadBlob,
} from "@/lib/image-tool-helpers";
import { useObjectUrl } from "@/hooks/use-object-url";
import { ToolResultPanel } from "@/components/tools/ToolResultPanel";
import { Loader2, Download } from "lucide-react";

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
  const [busy, setBusy] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);

  const previewUrl = useObjectUrl(blob);

  useEffect(() => {
    if (!file) {
      setBlob(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const img = await fileToImage(file);
        const canvas = imageToCanvas(img);
        const q = format === "image/png" ? undefined : quality;
        const next = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(
            (b) => resolve(b),
            format,
            format === "image/png" ? undefined : q
          )
        );
        if (!cancelled) setBlob(next);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, format, quality]);

  const download = useCallback(() => {
    if (!blob) return;
    downloadBlob(blob, `${name || "out"}.${ext[format]}`);
  }, [blob, format, name]);

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        Re-encode a single image. Preview matches the downloaded file.
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

          <ToolResultPanel
            show
            title="Converted preview"
            preview={
              <div className="relative">
                {busy ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                    <Loader2 className="animate-spin" size={24} />
                  </div>
                ) : null}
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="max-h-[420px] w-auto max-w-full border-[3px] border-black object-contain"
                  />
                ) : (
                  <span className="font-inter text-xs text-[#1a1a1a]/50 py-8">
                    Building preview…
                  </span>
                )}
              </div>
            }
            auxiliary={
              blob ? (
                <span>Output ~{(blob.size / 1024).toFixed(1)} KB</span>
              ) : null
            }
            actions={
              <button
                type="button"
                onClick={download}
                disabled={!blob || busy}
                className="inline-flex items-center gap-2 btn-brutal btn-brutal-yellow disabled:opacity-40"
              >
                <Download size={16} />
                Download
              </button>
            }
          />
        </>
      )}
    </div>
  );
}
