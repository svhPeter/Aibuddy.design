"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Download, ImagePlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 25 * 1024 * 1024;

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function supportsWebpExport(): boolean {
  try {
    const c = document.createElement("canvas");
    c.width = 2;
    c.height = 2;
    const d = c.toDataURL("image/webp");
    return d.startsWith("data:image/webp");
  } catch {
    return false;
  }
}

type OutputMime = "image/webp" | "image/jpeg";

type Phase = "idle" | "working" | "done";

export function ImageCompressorForm() {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [qualityPct, setQualityPct] = useState(82);
  const [outputMime, setOutputMime] = useState<OutputMime>("image/webp");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ w: number; h: number } | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [webpSupported, setWebpSupported] = useState(false);

  useEffect(() => {
    setWebpSupported(supportsWebpExport());
  }, []);

  useEffect(() => {
    if (!webpSupported && outputMime === "image/webp") {
      setOutputMime("image/jpeg");
    }
  }, [webpSupported, outputMime]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [compressedUrl]);

  const onPick = useCallback((f: File | null) => {
    setError(null);
    setCompressedBlob(null);
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(null);
    }
    setMeta(null);
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
  }, [previewUrl, compressedUrl]);

  const runCompress = useCallback(async () => {
    if (!file) return;
    setError(null);
    setPhase("working");
    setCompressedBlob(null);
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(null);
    }

    const mime: OutputMime =
      outputMime === "image/webp" && !webpSupported ? "image/jpeg" : outputMime;
    const q = Math.min(100, Math.max(50, qualityPct)) / 100;

    try {
      const bitmap = await createImageBitmap(file);
      setMeta({ w: bitmap.width, h: bitmap.height });

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not use canvas in this browser.");
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close?.();

      const blob: Blob | null = await new Promise((resolve) => {
        if (mime === "image/webp") {
          canvas.toBlob((b) => resolve(b), "image/webp", q);
        } else {
          canvas.toBlob((b) => resolve(b), "image/jpeg", q);
        }
      });

      if (!blob || blob.size === 0) {
        throw new Error("Compression produced an empty file. Try another format.");
      }

      setCompressedBlob(blob);
      setCompressedUrl(URL.createObjectURL(blob));
      setPhase("done");
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Compression failed.");
    }
  }, [file, outputMime, qualityPct, compressedUrl, webpSupported]);

  const onDownload = useCallback(() => {
    if (!compressedBlob || !file) return;
    const ext = compressedBlob.type.includes("webp") ? "webp" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(compressedBlob);
    a.download = `${base}-compressed.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [compressedBlob, file]);

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
          JPG, PNG, or WebP · max {formatBytes(MAX_BYTES)} · stays in your browser
        </p>
      </div>

      {previewUrl && file ? (
        <div className="overflow-hidden rounded-lg border-2 border-border bg-black/40 p-4">
          <div className="relative mx-auto max-h-72 w-full max-w-lg">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
            <img
              src={previewUrl}
              alt="Original preview"
              className="mx-auto max-h-72 w-auto object-contain"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Original file · {formatBytes(file.size)}
            {meta ? ` · ${meta.w}×${meta.h}px` : null}
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
            <label
              htmlFor={`${inputId}-quality`}
              className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
            >
              Quality ({qualityPct}%)
            </label>
            <input
              id={`${inputId}-quality`}
              type="range"
              min={50}
              max={100}
              value={qualityPct}
              onChange={(e) => setQualityPct(Number(e.target.value))}
              className="mt-3 block w-full accent-[#cafd00]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Lower = smaller file, more visible compression. Higher = larger file,
              closer to the original look.
            </p>
          </div>

          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]">
              Output format
            </span>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-fmt`}
                  checked={outputMime === "image/webp"}
                  disabled={!webpSupported}
                  onChange={() => setOutputMime("image/webp")}
                  className="accent-[#cafd00]"
                />
                <span className="text-foreground">
                  WebP{!webpSupported ? " (unsupported)" : ""}
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-fmt`}
                  checked={outputMime === "image/jpeg"}
                  onChange={() => setOutputMime("image/jpeg")}
                  className="accent-[#cafd00]"
                />
                <span className="text-foreground">JPEG</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              JPEG does not preserve transparency. WebP can preserve alpha when the
              browser supports WebP export.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            disabled={phase === "working"}
            className="rounded-none bg-[#cafd00] px-8 font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca]"
            onClick={() => void runCompress()}
          >
            {phase === "working" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Compressing…
              </>
            ) : (
              "Compress"
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

      {phase === "done" && compressedBlob && file && compressedUrl ? (
        <div className="space-y-4 rounded-lg border-2 border-border bg-card p-5 shadow-sm sm:p-6">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
            Result
          </h3>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md border border-border bg-background/60 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Original
              </p>
              <p className="mt-1 font-medium text-foreground">{formatBytes(file.size)}</p>
            </div>
            <div className="rounded-md border border-border bg-background/60 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Compressed
              </p>
              <p className="mt-1 font-medium text-foreground">
                {formatBytes(compressedBlob.size)}
                <span className="ml-2 text-xs text-[#cafd00]">
                  (
                  {file.size > 0
                    ? compressedBlob.size <= file.size
                      ? `${Math.round((1 - compressedBlob.size / file.size) * 100)}% smaller`
                      : `${Math.round((compressedBlob.size / file.size - 1) * 100)}% larger`
                    : "—"}
                  )
                </span>
              </p>
            </div>
          </div>
          <div className="relative mx-auto max-h-56 w-full max-w-md overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={compressedUrl}
              alt="Compressed preview"
              className="mx-auto max-h-56 w-auto object-contain"
            />
          </div>
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
          <p className="text-xs text-muted-foreground">
            Very detailed PNGs may not shrink much when re-encoded as WebP/JPEG.
            This tool does not change pixel dimensions — only encoding quality.
          </p>
        </div>
      ) : null}
    </div>
  );
}
