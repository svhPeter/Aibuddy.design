"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Download, ImagePlus, Loader2 } from "lucide-react";

import { postUsageConsume } from "@/lib/access/client-consume";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/browser/format-bytes";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 25 * 1024 * 1024;

type FitMode = "contain" | "cover" | "fill";
type ExportMime = "image/jpeg" | "image/png";

const PRESETS = [
  { id: "ig-post", label: "Instagram Post", w: 1080, h: 1080 },
  { id: "ig-story", label: "Instagram Story", w: 1080, h: 1920 },
  { id: "reel-cover", label: "Reel / Shorts cover", w: 1080, h: 1920 },
  { id: "yt-thumb", label: "YouTube Thumbnail", w: 1280, h: 720 },
  { id: "linkedin", label: "LinkedIn post (landscape)", w: 1200, h: 627 },
  { id: "facebook", label: "Facebook / link preview", w: 1200, h: 630 },
  { id: "tiktok", label: "TikTok cover (9:16)", w: 1080, h: 1920 },
] as const;

function renderToCanvas(
  img: ImageBitmap,
  tw: number,
  th: number,
  mode: FitMode,
  bg: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported.");
  const iw = img.width;
  const ih = img.height;

  if (mode === "fill") {
    ctx.drawImage(img, 0, 0, iw, ih, 0, 0, tw, th);
    return canvas;
  }

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, tw, th);

  if (mode === "contain") {
    const scale = Math.min(tw / iw, th / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const ox = (tw - dw) / 2;
    const oy = (th - dh) / 2;
    ctx.drawImage(img, 0, 0, iw, ih, ox, oy, dw, dh);
    return canvas;
  }

  const scale = Math.max(tw / iw, th / ih);
  const sw = tw / scale;
  const sh = th / scale;
  const sx = Math.max(0, (iw - sw) / 2);
  const sy = Math.max(0, (ih - sh) / 2);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th);
  return canvas;
}

type Phase = "idle" | "working" | "done";

export function SocialResizeForm() {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [bg, setBg] = useState("#111111");
  const [exportMime, setExportMime] = useState<ExportMime>("image/jpeg");
  const [qualityPct, setQualityPct] = useState(92);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [outUrl]);

  const onPick = useCallback(
    (f: File | null) => {
      setError(null);
      if (outUrl) {
        URL.revokeObjectURL(outUrl);
        setOutUrl(null);
      }
      setOutSize(null);
      setPhase("idle");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      if (!f) {
        setFile(null);
        return;
      }
      const mime = f.type.toLowerCase();
      if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
        setError("Use JPG, PNG, or WebP.");
        setFile(null);
        return;
      }
      if (f.size > MAX_BYTES) {
        setError(`File is too large (max ${formatBytes(MAX_BYTES)}).`);
        setFile(null);
        return;
      }
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    },
    [previewUrl, outUrl],
  );

  const runResize = useCallback(async () => {
    if (!file) return;
    setError(null);
    setPhase("working");
    if (outUrl) {
      URL.revokeObjectURL(outUrl);
      setOutUrl(null);
    }
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = renderToCanvas(
        bitmap,
        preset.w,
        preset.h,
        fitMode,
        bg,
      );
      bitmap.close?.();

      const q = Math.min(100, Math.max(60, qualityPct)) / 100;
      const mime = exportMime;
      const blob: Blob | null = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), mime, mime === "image/jpeg" ? q : undefined);
      });
      if (!blob || blob.size === 0) {
        throw new Error("Export failed.");
      }
      setOutSize(blob.size);
      setOutUrl(URL.createObjectURL(blob));
      setPhase("done");
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Resize failed.");
    }
  }, [file, preset.w, preset.h, fitMode, bg, exportMime, qualityPct, outUrl]);

  const onDownload = useCallback(async () => {
    if (!outUrl || !file) return;
    const gate = await postUsageConsume("social-resize");
    if (!gate.ok) {
      setError(gate.message);
      return;
    }
    const ext = exportMime === "image/png" ? "png" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "") || "social";
    const a = document.createElement("a");
    a.href = outUrl;
    a.download = `${base}-${preset.w}x${preset.h}.${ext}`;
    a.click();
  }, [outUrl, file, exportMime, preset.w, preset.h]);

  return (
    <div className="min-w-0 space-y-8">
      <div
        className={cn(
          "relative min-h-[10.5rem] cursor-pointer rounded-lg border-2 border-dashed border-[#777575] bg-[#131313] px-4 py-6 text-center transition-colors hover:border-[#cafd00]/45 sm:min-h-0 sm:p-8",
          phase === "working" && "pointer-events-none opacity-60",
        )}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onPick(f);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
      >
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        <ImagePlus className="mx-auto size-10 text-[#cafd00]" strokeWidth={1.25} aria-hidden />
        <p className="mt-3 font-heading text-sm font-bold uppercase tracking-widest text-white">
          Drop image or click to upload
        </p>
        <p className="mt-2 text-xs text-stitch-muted">
          JPG, PNG, WebP · max {formatBytes(MAX_BYTES)}
        </p>
      </div>

      {previewUrl && file ? (
        <div className="overflow-hidden rounded-lg border-2 border-border bg-black/40 p-3 sm:p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Source preview"
            className="mx-auto max-h-48 w-auto max-w-full object-contain"
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {formatBytes(file.size)}
          </p>
          <div className="mt-3 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={() => {
                onPick(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : null}

      {file ? (
        <div className="space-y-6 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
          <div>
            <label
              htmlFor={`${inputId}-preset`}
              className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
            >
              Preset
            </label>
            <select
              id={`${inputId}-preset`}
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="mt-3 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.w}×{p.h})
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]">
              Fit mode
            </span>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              {(
                [
                  ["contain", "Contain (letterbox)"],
                  ["cover", "Cover (crop)"],
                  ["fill", "Stretch"],
                ] as const
              ).map(([v, label]) => (
                <label key={v} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name={`${inputId}-fit`}
                    checked={fitMode === v}
                    onChange={() => setFitMode(v)}
                    className="accent-[#cafd00]"
                  />
                  <span className="text-foreground">{label}</span>
                </label>
              ))}
            </div>
            {fitMode === "contain" ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label htmlFor={`${inputId}-bg`} className="text-xs text-muted-foreground">
                  Letterbox color
                </label>
                <input
                  id={`${inputId}-bg`}
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border border-border bg-transparent"
                />
              </div>
            ) : null}
          </div>

          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]">
              Export
            </span>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-exp`}
                  checked={exportMime === "image/jpeg"}
                  onChange={() => setExportMime("image/jpeg")}
                  className="accent-[#cafd00]"
                />
                <span>JPG</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-exp`}
                  checked={exportMime === "image/png"}
                  onChange={() => setExportMime("image/png")}
                  className="accent-[#cafd00]"
                />
                <span>PNG</span>
              </label>
            </div>
            {exportMime === "image/jpeg" ? (
              <div className="mt-4">
                <label
                  htmlFor={`${inputId}-qj`}
                  className="text-xs font-medium text-muted-foreground"
                >
                  JPEG quality ({qualityPct}%)
                </label>
                <input
                  id={`${inputId}-qj`}
                  type="range"
                  min={60}
                  max={100}
                  value={qualityPct}
                  onChange={(e) => setQualityPct(Number(e.target.value))}
                  className="mt-2 block w-full accent-[#cafd00]"
                />
              </div>
            ) : null}
          </div>

          <Button
            type="button"
            size="lg"
            disabled={phase === "working"}
            className="w-full justify-center rounded-none bg-[#cafd00] px-6 font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca] sm:w-auto sm:px-8"
            onClick={() => void runResize()}
          >
            {phase === "working" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Exporting…
              </>
            ) : (
              "Resize & preview"
            )}
          </Button>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-lg border-2 border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {phase === "done" && outUrl && file ? (
        <div className="space-y-4 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
            Output preview ({preset.w}×{preset.h})
          </h3>
          <div className="mx-auto max-w-full overflow-auto rounded-md border border-border bg-black/30 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={outUrl}
              alt="Resized preview"
              className="mx-auto max-h-[min(70vh,28rem)] w-auto max-w-full object-contain"
            />
          </div>
          {outSize !== null ? (
            <p className="text-xs text-muted-foreground">File size · {formatBytes(outSize)}</p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full justify-center rounded-none sm:w-auto"
            onClick={onDownload}
          >
            <Download className="mr-2 size-4" aria-hidden />
            Download
          </Button>
        </div>
      ) : null}
    </div>
  );
}
