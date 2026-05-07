import { useState, useCallback, useEffect } from "react";
import {
  fileToImage,
  imageToCanvas,
  downloadBlob,
} from "@/lib/image-tool-helpers";
import { useObjectUrl } from "@/hooks/use-object-url";
import { ToolResultPanel } from "@/components/tools/ToolResultPanel";
import { Loader2, Download } from "lucide-react";

type OutFmt = "image/jpeg" | "image/webp";

export function ImageCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [quality, setQuality] = useState(0.82);
  const [format, setFormat] = useState<OutFmt>("image/jpeg");
  const [inBytes, setInBytes] = useState(0);
  const [outBytes, setOutBytes] = useState(0);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [name, setName] = useState("export");

  const previewUrl = useObjectUrl(outputBlob);

  useEffect(() => {
    if (!file) {
      setOutputBlob(null);
      setInBytes(0);
      setOutBytes(0);
      return;
    }
    let cancelled = false;
    (async () => {
      setBusy(true);
      setInBytes(file.size);
      try {
        const img = await fileToImage(file);
        const canvas = imageToCanvas(img);
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), format, quality)
        );
        if (cancelled) return;
        setOutputBlob(blob);
        setOutBytes(blob ? blob.size : 0);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, quality, format]);

  const onPick = (f: File | null) => {
    if (!f) {
      setFile(null);
      setInBytes(0);
      setOutBytes(0);
      setOutputBlob(null);
      return;
    }
    setFile(f);
    setName(f.name.replace(/\.[^.]+$/, "") || "export");
  };

  const download = useCallback(async () => {
    if (!outputBlob) return;
    const ext = format === "image/webp" ? "webp" : "jpg";
    downloadBlob(outputBlob, `${name || "image"}-smaller.${ext}`);
  }, [outputBlob, format, name]);

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        Images stay in this tab. Pick JPEG, PNG, or WebP, adjust quality, preview,
        then download.
      </p>
      <input
        type="file"
        accept="image/*"
        className="input-brutal p-2 text-xs file:font-oswald file:uppercase"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-oswald text-xs font-bold uppercase block mb-1">
            Output
          </label>
          <select
            className="input-brutal"
            value={format}
            onChange={(e) => setFormat(e.target.value as OutFmt)}
          >
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
        <div>
          <label className="font-oswald text-xs font-bold uppercase block mb-1">
            Quality: {Math.round(quality * 100)}%
          </label>
          <input
            type="range"
            min={0.45}
            max={0.98}
            step={0.01}
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full accent-[#1a1a1a]"
          />
        </div>
      </div>

      <ToolResultPanel
        show={!!file}
        title="Compressed preview"
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
                Waiting for preview…
              </span>
            )}
          </div>
        }
        auxiliary={
          inBytes ? (
            <p>
              <strong>Original:</strong> {(inBytes / 1024).toFixed(1)} KB —{" "}
              <strong>Output:</strong>{" "}
              {busy ? "…" : outBytes ? (outBytes / 1024).toFixed(1) + " KB" : "—"}
            </p>
          ) : null
        }
        actions={
          <button
            type="button"
            onClick={download}
            disabled={!outputBlob || busy}
            className="inline-flex items-center gap-2 btn-brutal btn-brutal-yellow disabled:opacity-40"
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : null}
            <Download size={16} />
            Download
          </button>
        }
      />
    </div>
  );
}
