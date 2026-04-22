"use client";

import { useCallback, useId, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  FileImage,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";

import { postUsageConsume } from "@/lib/access/client-consume";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/browser/format-bytes";
import { cn } from "@/lib/utils";

import { jsPDF } from "jspdf";
import JSZip from "jszip";

const IMG_ACCEPT = "image/jpeg,image/png,image/webp";
const PDF_ACCEPT = "application/pdf";
const MAX_IMG = 20 * 1024 * 1024;
const MAX_PDF = 40 * 1024 * 1024;
const MAX_IMAGES = 24;

type Mode = "to-pdf" | "from-pdf";

async function imagesToPdf(files: File[]): Promise<Blob> {
  if (files.length === 0) throw new Error("Add at least one image.");
  let pdf: jsPDF | null = null;
  for (const file of files) {
    const bmp = await createImageBitmap(file);
    const w = bmp.width;
    const h = bmp.height;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close?.();
      throw new Error("Canvas error.");
    }
    ctx.drawImage(bmp, 0, 0);
    bmp.close?.();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const orient = w > h ? "landscape" : "portrait";
    if (!pdf) {
      pdf = new jsPDF({
        unit: "px",
        format: [w, h],
        orientation: orient,
        hotfixes: ["px_scaling"],
      });
    } else {
      pdf.addPage([w, h], orient);
    }
    pdf.addImage(dataUrl, "JPEG", 0, 0, w, h);
  }
  if (!pdf) throw new Error("No PDF created.");
  return pdf.output("blob");
}

async function pdfToJpegs(file: File): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  const data = new Uint8Array(await file.arrayBuffer());
  const loading = pdfjs.getDocument({ data });
  const doc = await loading.promise;
  const zip = new JSZip();

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas error.");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const task = page.render({ canvas, viewport });
    await task.promise;
    const blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92);
    });
    if (!blob) throw new Error(`Could not render page ${i}.`);
    zip.file(`page-${String(i).padStart(3, "0")}.jpg`, blob);
  }

  await doc.destroy();

  return zip.generateAsync({ type: "blob" });
}

type Phase = "idle" | "working" | "done";

export function JpgPdfToolForm() {
  const baseId = useId();
  const [mode, setMode] = useState<Mode>("to-pdf");
  const [images, setImages] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [outName, setOutName] = useState("export");

  const addImages = useCallback((list: FileList | File[]) => {
    setError(null);
    const arr = Array.from(list).filter((f) => {
      const m = f.type.toLowerCase();
      return ["image/jpeg", "image/png", "image/webp"].includes(m);
    });
    if (arr.length === 0) {
      setError("Only JPG, PNG, or WebP images.");
      return;
    }
    const oversized = arr.find((f) => f.size > MAX_IMG);
    if (oversized) {
      setError(`Each image must be under ${formatBytes(MAX_IMG)}.`);
      return;
    }
    setImages((prev) => {
      const next = [...prev, ...arr].slice(0, MAX_IMAGES);
      return next;
    });
  }, []);

  const move = (idx: number, dir: -1 | 1) => {
    setImages((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[j]] = [copy[j], copy[idx]];
      return copy;
    });
  };

  const removeAt = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const run = useCallback(async () => {
    setError(null);
    setOutBlob(null);
    setPhase("working");
    try {
      if (mode === "to-pdf") {
        if (images.length === 0) {
          throw new Error("Add at least one image.");
        }
        const blob = await imagesToPdf(images);
        setOutBlob(blob);
        setOutName("images");
        setPhase("done");
      } else {
        if (!pdfFile) throw new Error("Choose a PDF file.");
        const blob = await pdfToJpegs(pdfFile);
        setOutBlob(blob);
        setOutName(pdfFile.name.replace(/\.pdf$/i, "") || "pdf-pages");
        setPhase("done");
      }
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Processing failed.");
    }
  }, [mode, images, pdfFile]);

  const download = useCallback(async () => {
    if (!outBlob) return;
    const gate = await postUsageConsume("jpg-pdf-tool");
    if (!gate.ok) {
      setError(gate.message);
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(outBlob);
    a.download =
      mode === "to-pdf" ? `${outName || "export"}.pdf` : `${outName}-pages.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [outBlob, mode, outName]);

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-wrap gap-3 rounded-lg border-2 border-border bg-card/60 p-3 sm:p-4">
        <Button
          type="button"
          size="sm"
          variant={mode === "to-pdf" ? "default" : "outline"}
          className={cn(
            "rounded-none font-heading text-xs uppercase tracking-widest",
            mode === "to-pdf" && "bg-[#cafd00] text-[#516700] hover:bg-[#f3ffca]",
          )}
          onClick={() => {
            setMode("to-pdf");
            setError(null);
            setOutBlob(null);
            setPhase("idle");
          }}
        >
          <FileImage className="mr-2 size-4" aria-hidden />
          Images → PDF
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "from-pdf" ? "default" : "outline"}
          className={cn(
            "rounded-none font-heading text-xs uppercase tracking-widest",
            mode === "from-pdf" && "bg-[#cafd00] text-[#516700] hover:bg-[#f3ffca]",
          )}
          onClick={() => {
            setMode("from-pdf");
            setError(null);
            setOutBlob(null);
            setPhase("idle");
          }}
        >
          <FileText className="mr-2 size-4" aria-hidden />
          PDF → JPG (zip)
        </Button>
      </div>

      {mode === "to-pdf" ? (
        <div className="space-y-4 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
          <p className="text-sm text-muted-foreground">
            Add up to {MAX_IMAGES} images. Order is top to bottom in the final PDF.
          </p>
          <input
            id={`${baseId}-multi`}
            type="file"
            accept={IMG_ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => {
              const fl = e.target.files;
              if (fl?.length) addImages(fl);
              e.target.value = "";
            }}
          />
          <label htmlFor={`${baseId}-multi`}>
            <span className="inline-flex cursor-pointer items-center justify-center rounded-none border-2 border-dashed border-[#777575] bg-[#131313] px-4 py-8 text-center text-sm text-foreground transition-colors hover:border-[#cafd00]/45">
              Click or use your file picker to add images (drag-drop not wired for
              multi — use Add images).
            </span>
          </label>

          {images.length > 0 ? (
            <ul className="list-none space-y-2 p-0">
              {images.map((f, i) => (
                <li
                  key={`${f.name}-${i}-${f.size}`}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate font-medium">{f.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(f.size)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-destructive"
                    onClick={() => removeAt(i)}
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No images yet.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
          <input
            id={`${baseId}-pdf`}
            type="file"
            accept={PDF_ACCEPT}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setError(null);
              setOutBlob(null);
              setPhase("idle");
              if (!f) {
                setPdfFile(null);
                return;
              }
              if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
                setError("Please choose a PDF file.");
                setPdfFile(null);
                return;
              }
              if (f.size > MAX_PDF) {
                setError(`PDF must be under ${formatBytes(MAX_PDF)}.`);
                setPdfFile(null);
                return;
              }
              setPdfFile(f);
            }}
          />
          <label htmlFor={`${baseId}-pdf`}>
            <span className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#777575] bg-[#131313] px-4 py-10 text-center transition-colors hover:border-[#cafd00]/45">
              <FileText className="mb-2 size-10 text-[#cafd00]" aria-hidden />
              <span className="font-heading text-sm font-bold uppercase tracking-widest text-white">
                Choose PDF
              </span>
              <span className="mt-2 text-xs text-stitch-muted">
                Max {formatBytes(MAX_PDF)} · pages export as JPG in a zip
              </span>
            </span>
          </label>
          {pdfFile ? (
            <p className="text-sm text-muted-foreground">
              Selected: <strong className="text-foreground">{pdfFile.name}</strong> ·{" "}
              {formatBytes(pdfFile.size)}
            </p>
          ) : null}
        </div>
      )}

      <Button
        type="button"
        size="lg"
        disabled={phase === "working" || (mode === "to-pdf" && images.length === 0) || (mode === "from-pdf" && !pdfFile)}
        className="w-full justify-center rounded-none bg-[#cafd00] px-6 font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca] sm:w-auto sm:px-8"
        onClick={() => void run()}
      >
        {phase === "working" ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Working…
          </>
        ) : mode === "to-pdf" ? (
          "Build PDF"
        ) : (
          "Extract pages as JPG"
        )}
      </Button>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border-2 border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {phase === "done" && outBlob ? (
        <div className="rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
            Ready
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "to-pdf"
              ? "Your merged PDF is ready to download."
              : "ZIP contains one JPG per page (numbered)."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-none"
            onClick={download}
          >
            Download
          </Button>
        </div>
      ) : null}
    </div>
  );
}
