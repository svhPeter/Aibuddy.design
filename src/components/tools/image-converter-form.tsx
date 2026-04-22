"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Download, ImagePlus, Loader2 } from "lucide-react";

import { postUsageConsume } from "@/lib/access/client-consume";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/browser/format-bytes";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 25 * 1024 * 1024;

type OutMime = "image/jpeg" | "image/png" | "image/webp";

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

type Phase = "idle" | "working" | "done";

async function convertToBlob(
  file: File,
  outMime: OutMime,
  quality: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not use canvas in this browser.");

  if (outMime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();

  const q = Math.min(100, Math.max(50, quality)) / 100;
  const blob: Blob | null = await new Promise((resolve) => {
    if (outMime === "image/webp") {
      canvas.toBlob((b) => resolve(b), "image/webp", q);
    } else if (outMime === "image/jpeg") {
      canvas.toBlob((b) => resolve(b), "image/jpeg", q);
    } else {
      canvas.toBlob((b) => resolve(b), "image/png");
    }
  });
  if (!blob || blob.size === 0) {
    throw new Error("Conversion produced an empty file.");
  }
  return blob;
}

export function ImageConverterForm() {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outMime, setOutMime] = useState<OutMime>("image/webp");
  const [qualityPct, setQualityPct] = useState(90);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);

  const webpOk = useMemo(() => {
    if (typeof window === "undefined") return false;
    return supportsWebpExport();
  }, []);

  const activeOutMime: OutMime =
    outMime === "image/webp" && !webpOk ? "image/jpeg" : outMime;

  const inputMime = file?.type?.toLowerCase() ?? "";
  const jpegTransparencyWarning =
    inputMime === "image/png" && activeOutMime === "image/jpeg";

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
      setOutBlob(null);
      if (outUrl) {
        URL.revokeObjectURL(outUrl);
        setOutUrl(null);
      }
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

  const runConvert = useCallback(async () => {
    if (!file) return;
    setError(null);
    setPhase("working");
    setOutBlob(null);
    if (outUrl) {
      URL.revokeObjectURL(outUrl);
      setOutUrl(null);
    }
    try {
      const blob = await convertToBlob(file, activeOutMime, qualityPct);
      setOutBlob(blob);
      setOutUrl(URL.createObjectURL(blob));
      setPhase("done");
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Conversion failed.");
    }
  }, [file, activeOutMime, qualityPct, outUrl]);

  const onDownload = useCallback(async () => {
    if (!outBlob || !file) return;
    const gate = await postUsageConsume("image-converter");
    if (!gate.ok) {
      setError(gate.message);
      return;
    }
    const t = outBlob.type;
    const ext = t.includes("png")
      ? "png"
      : t.includes("webp")
        ? "webp"
        : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(outBlob);
    a.download = `${base}-converted.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [outBlob, file]);

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
    <div className="min-w-0 space-y-8">
      <div
        className={cn(
          "relative min-h-[10.5rem] cursor-pointer rounded-lg border-2 border-dashed border-[#777575] bg-[#131313] px-4 py-6 text-center transition-colors hover:border-[#cafd00]/45 sm:min-h-0 sm:p-8",
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
        <div className="min-w-0 overflow-hidden rounded-lg border-2 border-border bg-black/40 p-3 sm:p-4">
          <div className="relative mx-auto max-h-[min(50vh,18rem)] w-full max-w-lg sm:max-h-72">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
            <img
              src={previewUrl}
              alt="Original preview"
              className="mx-auto max-h-[min(50vh,18rem)] w-auto max-w-full object-contain sm:max-h-72"
            />
          </div>
          <p className="mt-3 text-balance break-words text-center text-xs text-muted-foreground">
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
        <div className="min-w-0 space-y-6 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]">
              Output format
            </span>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-out`}
                  checked={activeOutMime === "image/webp"}
                  disabled={!webpOk}
                  onChange={() => setOutMime("image/webp")}
                  className="accent-[#cafd00]"
                />
                <span className="text-foreground">
                  WebP{!webpOk ? " (unsupported)" : ""}
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-out`}
                  checked={activeOutMime === "image/jpeg"}
                  onChange={() => setOutMime("image/jpeg")}
                  className="accent-[#cafd00]"
                />
                <span className="text-foreground">JPG</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-out`}
                  checked={activeOutMime === "image/png"}
                  onChange={() => setOutMime("image/png")}
                  className="accent-[#cafd00]"
                />
                <span className="text-foreground">PNG</span>
              </label>
            </div>
          </div>

          {(activeOutMime === "image/jpeg" || activeOutMime === "image/webp") && (
            <div>
              <label
                htmlFor={`${inputId}-q`}
                className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
              >
                Quality ({qualityPct}%)
              </label>
              <input
                id={`${inputId}-q`}
                type="range"
                min={50}
                max={100}
                value={qualityPct}
                onChange={(e) => setQualityPct(Number(e.target.value))}
                className="mt-3 block w-full accent-[#cafd00]"
              />
            </div>
          )}

          {jpegTransparencyWarning ? (
            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200/90">
              PNG transparency will be flattened on a white background when
              exporting as JPG.
            </p>
          ) : null}

          <Button
            type="button"
            size="lg"
            disabled={phase === "working"}
            className="w-full justify-center rounded-none bg-[#cafd00] px-6 font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca] sm:w-auto sm:px-8"
            onClick={() => void runConvert()}
          >
            {phase === "working" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Converting…
              </>
            ) : (
              "Convert"
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

      {phase === "done" && outBlob && file && outUrl ? (
        <div className="min-w-0 space-y-4 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
            Result
          </h3>
          <div className="relative mx-auto max-h-[min(45vh,14rem)] w-full min-w-0 max-w-md overflow-hidden rounded-md border border-border sm:max-h-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={outUrl}
              alt="Converted preview"
              className="mx-auto max-h-[min(45vh,14rem)] w-auto max-w-full object-contain sm:max-h-56"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Output size · {formatBytes(outBlob.size)}
          </p>
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
