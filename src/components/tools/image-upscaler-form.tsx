"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Download, GripVertical, ImagePlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_INPUT_BYTES = 20 * 1024 * 1024;
/** Guardrail so tab stays responsive */
const MAX_INPUT_LONG_EDGE = 4096;
const MAX_OUTPUT_LONG_EDGE = 8192;

const SCALE_OPTIONS = [
  { value: 1.5 as const, label: "1.5×" },
  { value: 2 as const, label: "2×" },
  { value: 3 as const, label: "3×" },
] as const;

type Scale = (typeof SCALE_OPTIONS)[number]["value"];

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

type Phase = "idle" | "working" | "done";

type DownloadFormat = "image/png" | "image/webp";

type CompareProps = {
  originalSrc: string;
  upscaledSrc: string;
  outputWidth: number;
  outputHeight: number;
  labelId: string;
};

/**
 * Left = original (top layer, clipped). Right = upscaled (full layer below).
 * Vertical divider; position is % from left (0–100), default ~50.
 */
function UpscaleCompareSlider({
  originalSrc,
  upscaledSrc,
  outputWidth,
  outputHeight,
  labelId,
}: CompareProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0) return;
    const x = clientX - r.left;
    const p = Math.min(100, Math.max(0, (x / r.width) * 100));
    setPos(p);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setFromClientX(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, setFromClientX]);

  const beginDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setDragging(true);
    setFromClientX(e.clientX);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPos((p) => Math.max(0, p - 2));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPos((p) => Math.min(100, p + 2));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPos(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPos(100);
    }
  };

  const clipOriginal = `inset(0 ${100 - pos}% 0 0)`;

  return (
    <div className="space-y-3">
      <p id={labelId} className="text-xs text-muted-foreground">
        Drag the divider or use arrow keys when the handle is focused. Left: original
        · right: upscaled (matched aspect ratio).
      </p>
      <div
        ref={wrapRef}
        className={cn(
          "relative mx-auto w-full max-w-4xl overflow-hidden rounded-md border border-[#262626] bg-[#0e0e0e] shadow-inner",
          dragging && "cursor-ew-resize touch-none select-none",
        )}
        style={{
          aspectRatio: `${outputWidth} / ${outputHeight}`,
          maxHeight: "min(70vh, 28rem)",
        }}
        onPointerDown={beginDrag}
        role="presentation"
      >
        {/* Upscaled — full frame */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={upscaledSrc}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
        {/* Original — same box, clipped from the left */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={originalSrc}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          style={{ clipPath: clipOriginal }}
          draggable={false}
        />

        <span
          className="pointer-events-none absolute left-2 top-2 z-[5] rounded border border-[#262626]/80 bg-[#0e0e0e]/90 px-2 py-1 font-heading text-[0.65rem] font-bold uppercase tracking-widest text-stitch-muted"
          aria-hidden
        >
          Original
        </span>
        <span
          className="pointer-events-none absolute right-2 top-2 z-[5] rounded border border-[#262626]/80 bg-[#0e0e0e]/90 px-2 py-1 font-heading text-[0.65rem] font-bold uppercase tracking-widest text-[#cafd00]"
          aria-hidden
        >
          Upscaled
        </span>

        <div
          className="pointer-events-none absolute bottom-0 top-0 z-10 w-0"
          style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute bottom-0 top-0 w-px bg-[#cafd00]/90 shadow-[0_0_12px_rgba(202,253,0,0.35)]" />
          <div
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-labelledby={labelId}
            aria-label="Compare original and upscaled image"
            tabIndex={0}
            className={cn(
              "pointer-events-auto absolute top-1/2 flex h-12 w-8 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center rounded-sm border-2 border-[#cafd00] bg-[#0e0e0e] text-[#cafd00] shadow-md outline-none ring-offset-2 ring-offset-[#0e0e0e] focus-visible:ring-2 focus-visible:ring-[#cafd00]",
              dragging && "border-[#f3ffca] bg-[#1a1a1a]",
            )}
            style={{ left: "50%", transform: "translate(-50%, -50%)" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              beginDrag(e);
            }}
            onKeyDown={onKeyDown}
          >
            <GripVertical className="size-5" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

async function upscaleToBitmap(
  source: ImageBitmap,
  scale: Scale,
): Promise<ImageBitmap> {
  const w = Math.round(source.width * scale);
  const h = Math.round(source.height * scale);
  if (Math.max(w, h) > MAX_OUTPUT_LONG_EDGE) {
    throw new Error(
      `Result would exceed ${MAX_OUTPUT_LONG_EDGE}px on the longest side. Use a smaller image or a lower scale.`,
    );
  }
  try {
    return await createImageBitmap(source, {
      resizeWidth: w,
      resizeHeight: h,
      resizeQuality: "high",
    });
  } catch {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, w, h);
    return await createImageBitmap(canvas);
  }
}

export function ImageUpscalerForm() {
  const inputId = useId();
  const compareLabelId = `${inputId}-compare`;
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scale, setScale] = useState<Scale>(2);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("image/png");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [outMeta, setOutMeta] = useState<{ w: number; h: number } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const onPick = useCallback(
    (f: File | null) => {
      setError(null);
      setResultBlob(null);
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
        setResultUrl(null);
      }
      setOutMeta(null);
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
      if (f.size > MAX_INPUT_BYTES) {
        setError(`File is too large (max ${formatBytes(MAX_INPUT_BYTES)}).`);
        setFile(null);
        return;
      }
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    },
    [previewUrl, resultUrl],
  );

  const runUpscale = useCallback(async () => {
    if (!file) return;
    setError(null);
    setPhase("working");
    setResultBlob(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }

    let src: ImageBitmap | null = null;
    let scaled: ImageBitmap | null = null;
    try {
      src = await createImageBitmap(file);
      if (Math.max(src.width, src.height) > MAX_INPUT_LONG_EDGE) {
        throw new Error(
          `Longest side must be at most ${MAX_INPUT_LONG_EDGE}px for this browser tool.`,
        );
      }
      scaled = await upscaleToBitmap(src, scale);
      src.close?.();
      src = null;

      setOutMeta({ w: scaled.width, h: scaled.height });

      const canvas = document.createElement("canvas");
      canvas.width = scaled.width;
      canvas.height = scaled.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not use canvas.");
      ctx.drawImage(scaled, 0, 0);
      scaled.close?.();
      scaled = null;

      const q = 0.92;
      const blob: Blob | null = await new Promise((resolve) => {
        if (downloadFormat === "image/webp") {
          canvas.toBlob((b) => resolve(b), "image/webp", q);
        } else {
          canvas.toBlob((b) => resolve(b), "image/png");
        }
      });

      if (!blob || blob.size === 0) {
        throw new Error("Export failed. Try PNG if WebP is unavailable.");
      }

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setPhase("done");
    } catch (e) {
      if (src) src.close?.();
      if (scaled) scaled.close?.();
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Upscale failed.");
    }
  }, [file, scale, downloadFormat, resultUrl]);

  const onDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const ext = downloadFormat === "image/webp" ? "webp" : "png";
    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(resultBlob);
    a.download = `${base}-${scale}x.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [resultBlob, file, scale, downloadFormat]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) onPick(f);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border-2 border-border bg-card/40 p-4 text-sm leading-relaxed text-muted-foreground shadow-sm sm:p-5">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]">
          What this does
        </p>
        <p className="mt-2">
          This is <strong className="text-foreground">high-quality resampling</strong>{" "}
          (larger canvas, smooth pixels) — not generative AI. It will not invent skin
          pores, text, or missing detail; it makes a sharper-looking larger export for
          screens or print layouts where you already have enough resolution to work
          with.
        </p>
      </div>

      <div
        className={cn(
          "relative cursor-pointer rounded-lg border-2 border-dashed border-[#777575] bg-[#131313] p-8 text-center transition-colors hover:border-[#cafd00]/45",
          phase === "working" && "pointer-events-none opacity-60",
        )}
        onClick={() => fileRef.current?.click()}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        <ImagePlus
          className="mx-auto size-10 text-[#cafd00]"
          strokeWidth={1.25}
          aria-hidden
        />
        <p className="mt-3 font-heading text-sm font-bold uppercase tracking-widest text-white">
          Drop image or click to upload
        </p>
        <p className="mt-2 text-xs text-stitch-muted">
          JPG, PNG, or WebP · max {formatBytes(MAX_INPUT_BYTES)} · longest side ≤{" "}
          {MAX_INPUT_LONG_EDGE}px · processed in your browser
        </p>
      </div>

      {previewUrl && file ? (
        <div className="overflow-hidden rounded-lg border-2 border-border bg-black/40 p-4">
          <div className="relative mx-auto max-h-72 w-full max-w-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Original preview"
              className="mx-auto max-h-72 w-auto object-contain"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Original · {formatBytes(file.size)}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={(e) => {
                e.stopPropagation();
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
        <div className="space-y-6 rounded-lg border-2 border-border bg-card p-5 shadow-sm sm:p-6">
          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]">
              Scale
            </span>
            <div className="mt-3 flex flex-wrap gap-3">
              {SCALE_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={scale === opt.value ? "default" : "outline"}
                  className={cn(
                    "rounded-none font-heading text-xs font-bold uppercase tracking-widest",
                    scale === opt.value &&
                      "border-0 bg-[#cafd00] text-[#516700] hover:bg-[#f3ffca]",
                  )}
                  onClick={() => setScale(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              3× can produce very large files and may feel slow on big sources.
            </p>
          </div>

          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]">
              Download format
            </span>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-dl`}
                  checked={downloadFormat === "image/png"}
                  onChange={() => setDownloadFormat("image/png")}
                  className="accent-[#cafd00]"
                />
                <span className="text-foreground">PNG (lossless, larger)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-dl`}
                  checked={downloadFormat === "image/webp"}
                  onChange={() => setDownloadFormat("image/webp")}
                  className="accent-[#cafd00]"
                />
                <span className="text-foreground">WebP (smaller)</span>
              </label>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            disabled={phase === "working"}
            className="rounded-none bg-[#cafd00] px-8 font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca]"
            onClick={() => void runUpscale()}
          >
            {phase === "working" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Upscaling…
              </>
            ) : (
              "Upscale"
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

      {phase === "done" && resultBlob && file && resultUrl && outMeta && previewUrl ? (
        <div className="space-y-6 rounded-lg border-2 border-border bg-card p-5 shadow-sm sm:p-6">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
            Result
          </h3>
          <p className="text-sm text-muted-foreground">
            Output size · {outMeta.w}×{outMeta.h}px · {formatBytes(resultBlob.size)}
          </p>

          <UpscaleCompareSlider
            key={resultUrl}
            originalSrc={previewUrl}
            upscaledSrc={resultUrl}
            outputWidth={outMeta.w}
            outputHeight={outMeta.h}
            labelId={compareLabelId}
          />

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-none"
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
