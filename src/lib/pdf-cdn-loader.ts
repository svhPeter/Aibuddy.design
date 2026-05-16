/**
 * Lazy CDN loader for pdf-lib and pdf.js — with jsDelivr + unpkg fallback.
 */

import { loadScriptWithFallback } from "@/lib/cdn-loader";

/* eslint-disable @typescript-eslint/no-explicit-any */

// CDN URLs with fallback (jsDelivr primary, unpkg secondary)
const PDFLIB_URLS = [
  "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js",
  "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js",
];
const PDFJS_URLS = [
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
];
const PDFJS_WORKER = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

// ── pdf-lib types ────────────────────────────────────────────────────────

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

// ── pdf.js types ─────────────────────────────────────────────────────────

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

// ── Loaders with cache ───────────────────────────────────────────────────

let pdfLibCache: PdfLibModule | null = null;
let pdfJsCache: PdfJsModule | null = null;

export async function loadPdfLib(): Promise<PdfLibModule> {
  if (pdfLibCache) return pdfLibCache;
  await loadScriptWithFallback(PDFLIB_URLS, "PDF library");
  const mod = (window as any).PDFLib;
  if (!mod?.PDFDocument) throw new Error("PDF library failed to initialize. Please refresh and try again.");
  pdfLibCache = mod as PdfLibModule;
  return pdfLibCache;
}

export async function loadPdfJs(): Promise<PdfJsModule> {
  if (pdfJsCache) return pdfJsCache;
  await loadScriptWithFallback(PDFJS_URLS, "PDF renderer");
  const mod = (window as any).pdfjsLib;
  if (!mod?.getDocument) throw new Error("PDF renderer failed to initialize. Please refresh and try again.");
  mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  pdfJsCache = mod as PdfJsModule;
  return pdfJsCache;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
