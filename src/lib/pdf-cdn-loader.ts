/**
 * Lazy CDN loader for pdf-lib and pdf.js (pdfjs-dist).
 * Zero build-time dependency — loaded via UMD <script> injection at runtime.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const PDFLIB_CDN = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

// ── pdf-lib types (subset we use) ────────────────────────────────────────

export interface PdfLibModule {
  PDFDocument: {
    load(bytes: ArrayBuffer | Uint8Array): Promise<PdfLibDoc>;
    create(): Promise<PdfLibDoc>;
  };
  rgb(r: number, g: number, b: number): any;
  StandardFonts: Record<string, string>;
}

export interface PdfLibDoc {
  getPageCount(): number;
  getPages(): PdfLibPage[];
  getPage(index: number): PdfLibPage;
  removePage(index: number): void;
  copyPages(src: PdfLibDoc, indices: number[]): Promise<PdfLibPage[]>;
  addPage(page?: PdfLibPage | [number, number]): PdfLibPage;
  insertPage(index: number, page?: PdfLibPage | [number, number]): PdfLibPage;
  embedFont(font: string): Promise<any>;
  embedPng(bytes: Uint8Array | ArrayBuffer): Promise<any>;
  embedJpg(bytes: Uint8Array | ArrayBuffer): Promise<any>;
  save(): Promise<Uint8Array>;
}

export interface PdfLibPage {
  getSize(): { width: number; height: number };
  drawText(text: string, opts: Record<string, any>): void;
  drawImage(img: any, opts: Record<string, any>): void;
  drawRectangle(opts: Record<string, any>): void;
  drawLine(opts: Record<string, any>): void;
}

// ── pdf.js types (subset we use) ─────────────────────────────────────────

export interface PdfJsModule {
  getDocument(src: { data: ArrayBuffer | Uint8Array }): { promise: Promise<PdfJsDoc> };
  GlobalWorkerOptions: { workerSrc: string };
}

export interface PdfJsDoc {
  numPages: number;
  getPage(num: number): Promise<PdfJsPage>;
  destroy(): void;
}

export interface PdfJsPage {
  getViewport(opts: { scale: number }): { width: number; height: number };
  render(opts: { canvasContext: CanvasRenderingContext2D; viewport: any }): { promise: Promise<void> };
}

// ── Loaders ──────────────────────────────────────────────────────────────

let pdfLibCache: PdfLibModule | null = null;
let pdfJsCache: PdfJsModule | null = null;

export async function loadPdfLib(): Promise<PdfLibModule> {
  if (pdfLibCache) return pdfLibCache;
  await loadScript(PDFLIB_CDN);
  const mod = (window as any).PDFLib;
  if (!mod?.PDFDocument) throw new Error("pdf-lib failed to load from CDN.");
  pdfLibCache = mod as PdfLibModule;
  return pdfLibCache;
}

export async function loadPdfJs(): Promise<PdfJsModule> {
  if (pdfJsCache) return pdfJsCache;
  await loadScript(PDFJS_CDN);
  const mod = (window as any).pdfjsLib;
  if (!mod?.getDocument) throw new Error("pdf.js failed to load from CDN.");
  mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
  pdfJsCache = mod as PdfJsModule;
  return pdfJsCache;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
