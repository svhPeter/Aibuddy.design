"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Download, ImagePlus, Loader2, Type } from "lucide-react";

import { postUsageConsume } from "@/lib/access/client-consume";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/browser/format-bytes";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 25 * 1024 * 1024;
const MAX_LOGO_BYTES = 8 * 1024 * 1024;

type PositionId =
  | "tl"
  | "tc"
  | "tr"
  | "ml"
  | "mc"
  | "mr"
  | "bl"
  | "bc"
  | "br";

const POSITIONS: { id: PositionId; label: string }[] = [
  { id: "tl", label: "Top left" },
  { id: "tc", label: "Top center" },
  { id: "tr", label: "Top right" },
  { id: "ml", label: "Middle left" },
  { id: "mc", label: "Center" },
  { id: "mr", label: "Middle right" },
  { id: "bl", label: "Bottom left" },
  { id: "bc", label: "Bottom center" },
  { id: "br", label: "Bottom right" },
];

function placeBox(
  mainW: number,
  mainH: number,
  boxW: number,
  boxH: number,
  pos: PositionId,
  pad: number,
): { x: number; y: number } {
  const maxX = Math.max(pad, mainW - boxW - pad);
  const maxY = Math.max(pad, mainH - boxH - pad);
  const cx = (mainW - boxW) / 2;
  const cy = (mainH - boxH) / 2;
  switch (pos) {
    case "tl":
      return { x: pad, y: pad };
    case "tc":
      return { x: cx, y: pad };
    case "tr":
      return { x: maxX, y: pad };
    case "ml":
      return { x: pad, y: cy };
    case "mc":
      return { x: cx, y: cy };
    case "mr":
      return { x: maxX, y: cy };
    case "bl":
      return { x: pad, y: maxY };
    case "bc":
      return { x: cx, y: maxY };
    case "br":
      return { x: maxX, y: maxY };
    default:
      return { x: cx, y: cy };
  }
}

type Phase = "idle" | "working" | "done";

export function WatermarkToolForm() {
  const inputId = useId();
  const logoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [text, setText] = useState("© Your brand");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(28);
  const [position, setPosition] = useState<PositionId>("br");
  const [opacityPct, setOpacityPct] = useState(72);
  const [padding, setPadding] = useState(24);
  const [logoScalePct, setLogoScalePct] = useState(18);
  const [useLogo, setUseLogo] = useState(false);
  const [exportMime, setExportMime] = useState<"image/png" | "image/jpeg">(
    "image/png",
  );
  const [qualityPct, setQualityPct] = useState(92);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  useEffect(() => {
    return () => {
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [outUrl]);

  const onPickMain = useCallback(
    (f: File | null) => {
      setError(null);
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
        setError("Use JPG, PNG, or WebP for the main image.");
        setFile(null);
        return;
      }
      if (f.size > MAX_BYTES) {
        setError(`Image is too large (max ${formatBytes(MAX_BYTES)}).`);
        setFile(null);
        return;
      }
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    },
    [previewUrl, outUrl],
  );

  const onPickLogo = useCallback(
    (f: File | null) => {
      setError(null);
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
        setLogoUrl(null);
      }
      if (!f) {
        setLogoFile(null);
        return;
      }
      const mime = f.type.toLowerCase();
      if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
        setError("Logo must be JPG, PNG, or WebP.");
        return;
      }
      if (f.size > MAX_LOGO_BYTES) {
        setError(`Logo is too large (max ${formatBytes(MAX_LOGO_BYTES)}).`);
        return;
      }
      setLogoFile(f);
      setLogoUrl(URL.createObjectURL(f));
      setUseLogo(true);
    },
    [logoUrl],
  );

  const applyWatermark = useCallback(async () => {
    if (!file) return;
    if (!text.trim() && !(useLogo && logoFile)) {
      setError("Add watermark text or upload and enable a logo.");
      return;
    }
    setError(null);
    setPhase("working");
    if (outUrl) {
      URL.revokeObjectURL(outUrl);
      setOutUrl(null);
    }
    try {
      const bitmap = await createImageBitmap(file);
      const w = bitmap.width;
      const h = bitmap.height;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported.");
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close?.();

      const alpha = Math.min(100, Math.max(8, opacityPct)) / 100;
      const pad = Math.min(200, Math.max(0, padding));

      if (useLogo && logoFile && logoUrl) {
        const logoBmp = await createImageBitmap(logoFile);
        const targetMax = (Math.min(w, h) * Math.min(50, Math.max(5, logoScalePct))) / 100;
        const scale = targetMax / Math.max(logoBmp.width, logoBmp.height);
        const lw = logoBmp.width * scale;
        const lh = logoBmp.height * scale;
        const { x, y } = placeBox(w, h, lw, lh, position, pad);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(logoBmp, x, y, lw, lh);
        ctx.restore();
        logoBmp.close?.();
      }

      if (text.trim()) {
        const fs = Math.min(200, Math.max(12, fontSize));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = textColor;
        ctx.font = `600 ${fs}px ui-sans-serif, system-ui, sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.55)";
        ctx.shadowBlur = fs * 0.15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = fs * 0.06;
        const metrics = ctx.measureText(text.trim());
        const tw = metrics.width;
        const th = fs * 1.25;
        const { x, y } = placeBox(w, h, tw, th, position, pad);
        ctx.fillText(text.trim(), x, y + fs);
        ctx.restore();
      }

      const q = Math.min(100, Math.max(60, qualityPct)) / 100;
      const mime = exportMime;
      const blob: Blob | null = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), mime, mime === "image/jpeg" ? q : undefined);
      });
      if (!blob?.size) throw new Error("Export failed.");
      setOutUrl(URL.createObjectURL(blob));
      setPhase("done");
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Could not apply watermark.");
    }
  }, [
    file,
    text,
    useLogo,
    logoFile,
    logoUrl,
    position,
    opacityPct,
    padding,
    logoScalePct,
    fontSize,
    textColor,
    exportMime,
    qualityPct,
    outUrl,
  ]);

  const onDownload = useCallback(async () => {
    if (!outUrl || !file) return;
    const gate = await postUsageConsume("watermark-tool");
    if (!gate.ok) {
      setError(gate.message);
      return;
    }
    const ext = exportMime === "image/png" ? "png" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "") || "watermarked";
    const a = document.createElement("a");
    a.href = outUrl;
    a.download = `${base}-watermark.${ext}`;
    a.click();
  }, [outUrl, file, exportMime]);

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
          onPickMain(e.dataTransfer.files?.[0] ?? null);
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
          onChange={(e) => onPickMain(e.target.files?.[0] ?? null)}
        />
        <ImagePlus className="mx-auto size-10 text-[#cafd00]" strokeWidth={1.25} aria-hidden />
        <p className="mt-3 font-heading text-sm font-bold uppercase tracking-widest text-white">
          Main image — drop or click
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
            alt="Source"
            className="mx-auto max-h-52 w-auto max-w-full object-contain"
          />
          <div className="mt-3 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={() => {
                onPickMain(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Remove image
            </Button>
          </div>
        </div>
      ) : null}

      {file ? (
        <div className="space-y-6 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
          <div>
            <label
              htmlFor={`${inputId}-wmtext`}
              className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
            >
              <Type className="size-3.5" aria-hidden />
              Text watermark
            </label>
            <input
              id={`${inputId}-wmtext`}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={120}
              className="mt-3 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label htmlFor={`${inputId}-tc`} className="text-xs text-muted-foreground">
                Colour
              </label>
              <input
                id={`${inputId}-tc`}
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-9 w-14 cursor-pointer rounded border border-border"
              />
              <label htmlFor={`${inputId}-fs`} className="text-xs text-muted-foreground">
                Size ({fontSize}px)
              </label>
              <input
                id={`${inputId}-fs`}
                type="range"
                min={12}
                max={120}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="min-w-[8rem] accent-[#cafd00]"
              />
            </div>
          </div>

          <div className="rounded-md border border-border bg-background/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]">
                Logo watermark (optional)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => logoRef.current?.click()}
              >
                {logoFile ? "Change logo" : "Upload logo"}
              </Button>
            </div>
            <input
              ref={logoRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => onPickLogo(e.target.files?.[0] ?? null)}
            />
            {logoUrl ? (
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo preview" className="h-14 w-auto object-contain" />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useLogo}
                    onChange={(e) => setUseLogo(e.target.checked)}
                    className="accent-[#cafd00]"
                  />
                  Use logo in export
                </label>
                <div className="flex min-w-[12rem] flex-1 items-center gap-2">
                  <span className="text-xs text-muted-foreground">Scale</span>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    value={logoScalePct}
                    onChange={(e) => setLogoScalePct(Number(e.target.value))}
                    className="flex-1 accent-[#cafd00]"
                  />
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                PNG with transparency works best for logos.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${inputId}-pos`}
                className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
              >
                Position
              </label>
              <select
                id={`${inputId}-pos`}
                value={position}
                onChange={(e) => setPosition(e.target.value as PositionId)}
                className="mt-2 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm"
              >
                {POSITIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={`${inputId}-pad`}
                className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
              >
                Padding ({padding}px)
              </label>
              <input
                id={`${inputId}-pad`}
                type="range"
                min={0}
                max={120}
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="mt-4 block w-full accent-[#cafd00]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`${inputId}-op`}
              className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
            >
              Opacity ({opacityPct}%)
            </label>
            <input
              id={`${inputId}-op`}
              type="range"
              min={8}
              max={100}
              value={opacityPct}
              onChange={(e) => setOpacityPct(Number(e.target.value))}
              className="mt-3 block w-full accent-[#cafd00]"
            />
          </div>

          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]">
              Export format
            </span>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-ex`}
                  checked={exportMime === "image/png"}
                  onChange={() => setExportMime("image/png")}
                  className="accent-[#cafd00]"
                />
                PNG
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-ex`}
                  checked={exportMime === "image/jpeg"}
                  onChange={() => setExportMime("image/jpeg")}
                  className="accent-[#cafd00]"
                />
                JPG
              </label>
            </div>
            {exportMime === "image/jpeg" ? (
              <input
                type="range"
                min={60}
                max={100}
                value={qualityPct}
                onChange={(e) => setQualityPct(Number(e.target.value))}
                className="mt-3 block w-full accent-[#cafd00]"
                aria-label="JPEG quality"
              />
            ) : null}
          </div>

          <Button
            type="button"
            size="lg"
            disabled={phase === "working"}
            className="w-full justify-center rounded-none bg-[#cafd00] px-6 font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca] sm:w-auto sm:px-8"
            onClick={() => void applyWatermark()}
          >
            {phase === "working" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Applying…
              </>
            ) : (
              "Preview watermark"
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
            Result
          </h3>
          <div className="overflow-auto rounded-md border border-border bg-black/30 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={outUrl}
              alt="Watermarked preview"
              className="mx-auto max-h-[min(70vh,24rem)] w-auto max-w-full object-contain"
            />
          </div>
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
