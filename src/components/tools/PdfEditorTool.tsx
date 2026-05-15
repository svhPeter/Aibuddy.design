/**
 * PDF Editor & Signer — browser-only PDF annotation tool.
 * Libraries loaded from CDN at runtime (pdf-lib + pdf.js).
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { downloadBlob } from "@/lib/image-tool-helpers";
import type { PdfLibDoc, PdfJsDoc } from "@/lib/pdf-cdn-loader";
import { AnnotationCanvas, type AnnotationCanvasHandle, type DrawMode } from "./pdf/AnnotationCanvas";
import {
  Download, Loader2, Upload, X, Type, Pen, Highlighter,
  ImagePlus, Trash2, ChevronUp, ChevronDown, RotateCcw, ZoomIn, ZoomOut,
} from "lucide-react";

const MAX_FILE = 100 * 1024 * 1024;
const fmt = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

type Tool = "none" | "text" | "draw" | "highlight" | "image";
type Status = "idle" | "loading" | "ready" | "exporting" | "error";

interface PageData { thumb: string; w: number; h: number; }
interface TextAnnotation { text: string; x: number; y: number; size: number; color: string; page: number; }
interface ImageAnnotation { dataUrl: string; x: number; y: number; w: number; h: number; page: number; }

export function PdfEditorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [pages, setPages] = useState<PageData[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [tool, setTool] = useState<Tool>("none");
  const [zoom, setZoom] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotation[]>([]);
  const [textInput, setTextInput] = useState("");
  const [textSize, setTextSize] = useState(16);
  const [drawColor, setDrawColor] = useState("#1a1a1a");

  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const pdfDocRef = useRef<PdfLibDoc | null>(null);
  const pdfJsDocRef = useRef<PdfJsDoc | null>(null);
  const canvasRefs = useRef<Map<number, AnnotationCanvasHandle>>(new Map());
  const previewRef = useRef<HTMLCanvasElement>(null);

  // ── Cleanup ────────────────────────────────────────────────────────────
  useEffect(() => () => { pdfJsDocRef.current?.destroy(); }, []);

  // ── Render single page to canvas ───────────────────────────────────────
  const renderPage = useCallback(async (pageIdx: number) => {
    const pdfJs = pdfJsDocRef.current;
    const cvs = previewRef.current;
    if (!pdfJs || !cvs || pageIdx >= pages.length) return;
    const page = await pdfJs.getPage(pageIdx + 1);
    const vp = page.getViewport({ scale: 1.5 * zoom });
    cvs.width = vp.width;
    cvs.height = vp.height;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
  }, [pages.length, zoom]);

  useEffect(() => { if (status === "ready") void renderPage(activePage); }, [activePage, zoom, status, renderPage]);

  // ── Load PDF ───────────────────────────────────────────────────────────
  const loadPdf = useCallback(async (f: File) => {
    setError("");
    setStatus("loading");
    setTextAnnotations([]);
    setImageAnnotations([]);
    canvasRefs.current.clear();
    try {
      const { loadPdfLib, loadPdfJs } = await import("@/lib/pdf-cdn-loader");
      const [pdfLib, pdfJs] = await Promise.all([loadPdfLib(), loadPdfJs()]);

      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      pdfBytesRef.current = bytes;

      const doc = await pdfLib.PDFDocument.load(buf);
      pdfDocRef.current = doc;

      pdfJsDocRef.current?.destroy();
      const jsd = await pdfJs.getDocument({ data: bytes.slice() }).promise;
      pdfJsDocRef.current = jsd;

      // Generate thumbnails
      const thumbs: PageData[] = [];
      for (let i = 0; i < jsd.numPages; i++) {
        const pg = await jsd.getPage(i + 1);
        const vp = pg.getViewport({ scale: 0.3 });
        const c = document.createElement("canvas");
        c.width = vp.width; c.height = vp.height;
        const ctx = c.getContext("2d")!;
        await pg.render({ canvasContext: ctx, viewport: vp }).promise;
        thumbs.push({ thumb: c.toDataURL("image/jpeg", 0.6), w: vp.width, h: vp.height });
      }
      setPages(thumbs);
      setActivePage(0);
      setZoom(1);
      setTool("none");
      setStatus("ready");
    } catch (e) {
      setError((e as Error).message || "Failed to load PDF.");
      setStatus("error");
    }
  }, []);

  // ── File validation ────────────────────────────────────────────────────
  const pickFile = useCallback((f: File | null) => {
    if (!f) { setFile(null); return; }
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) {
      setError("Only PDF files are supported."); return;
    }
    if (f.size > MAX_FILE) { setError(`File too large. Max ${fmt(MAX_FILE)}.`); return; }
    setFile(f);
    void loadPdf(f);
  }, [loadPdf]);

  // ── Drag & drop ────────────────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    pickFile(e.dataTransfer.files[0] ?? null);
  }, [pickFile]);

  // ── Page actions ───────────────────────────────────────────────────────
  const deletePage = useCallback(async () => {
    const doc = pdfDocRef.current;
    if (!doc || pages.length <= 1) return;
    doc.removePage(activePage);
    const newBytes = await doc.save();
    pdfBytesRef.current = newBytes;
    // Reload
    const f = new File([new Uint8Array(newBytes)], file?.name ?? "doc.pdf", { type: "application/pdf" });
    setFile(f);
    setActivePage(Math.min(activePage, pages.length - 2));
    void loadPdf(f);
  }, [activePage, pages.length, file, loadPdf]);

  const movePage = useCallback(async (dir: -1 | 1) => {
    const doc = pdfDocRef.current;
    if (!doc) return;
    const target = activePage + dir;
    if (target < 0 || target >= pages.length) return;
    // pdf-lib: copy page, remove old, insert at new position
    const { loadPdfLib } = await import("@/lib/pdf-cdn-loader");
    const pdfLib = await loadPdfLib();
    const bytes = pdfBytesRef.current!;
    const src = await pdfLib.PDFDocument.load(bytes);
    const newDoc = await pdfLib.PDFDocument.create();
    const order = Array.from({ length: src.getPageCount() }, (_, i) => i);
    // Swap
    [order[activePage], order[target]] = [order[target], order[activePage]];
    const copied = await newDoc.copyPages(src, order);
    for (const pg of copied) newDoc.addPage(pg);
    const newBytes = await newDoc.save();
    pdfBytesRef.current = newBytes;
    const f = new File([new Uint8Array(newBytes)], file?.name ?? "doc.pdf", { type: "application/pdf" });
    setFile(f);
    setActivePage(target);
    void loadPdf(f);
  }, [activePage, pages.length, file, loadPdf]);

  // ── Add text on click ──────────────────────────────────────────────────
  const handlePreviewClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "text" && textInput.trim()) {
      const cvs = previewRef.current;
      if (!cvs) return;
      const rect = cvs.getBoundingClientRect();
      const scaleX = cvs.width / rect.width;
      const scaleY = cvs.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      setTextAnnotations(prev => [...prev, { text: textInput, x, y, size: textSize, color: drawColor, page: activePage }]);
      // Draw immediately on preview
      const ctx = cvs.getContext("2d");
      if (ctx) { ctx.font = `${textSize * 1.5 * zoom}px Inter, sans-serif`; ctx.fillStyle = drawColor; ctx.fillText(textInput, x, y); }
    }
    if (tool === "image") {
      const inp = document.createElement("input");
      inp.type = "file"; inp.accept = "image/*";
      inp.onchange = async () => {
        const imgFile = inp.files?.[0];
        if (!imgFile) return;
        const url = URL.createObjectURL(imgFile);
        const img = new Image();
        img.onload = () => {
          const cvs2 = previewRef.current;
          if (!cvs2) return;
          const rect2 = cvs2.getBoundingClientRect();
          const scaleX2 = cvs2.width / rect2.width;
          const x2 = (e.clientX - rect2.left) * scaleX2;
          const y2 = (e.clientY - rect2.top) * scaleX2;
          const w = Math.min(img.naturalWidth, 200);
          const h = (w / img.naturalWidth) * img.naturalHeight;
          // Draw on preview canvas
          const ctx2 = cvs2.getContext("2d");
          if (ctx2) ctx2.drawImage(img, x2, y2, w, h);
          // Convert to data URL for embedding
          const tc = document.createElement("canvas");
          tc.width = img.naturalWidth; tc.height = img.naturalHeight;
          tc.getContext("2d")!.drawImage(img, 0, 0);
          setImageAnnotations(prev => [...prev, { dataUrl: tc.toDataURL("image/png"), x: x2, y: y2, w, h, page: activePage }]);
          URL.revokeObjectURL(url);
        };
        img.src = url;
      };
      inp.click();
    }
  }, [tool, textInput, textSize, drawColor, activePage, zoom]);

  // ── Export PDF ─────────────────────────────────────────────────────────
  const exportPdf = useCallback(async () => {
    if (!pdfDocRef.current || !pdfBytesRef.current) return;
    setStatus("exporting");
    try {
      const { loadPdfLib } = await import("@/lib/pdf-cdn-loader");
      const pdfLib = await loadPdfLib();
      const doc = await pdfLib.PDFDocument.load(pdfBytesRef.current);
      const font = await doc.embedFont(pdfLib.StandardFonts.Helvetica);

      // Embed text annotations
      for (const ann of textAnnotations) {
        if (ann.page >= doc.getPageCount()) continue;
        const pg = doc.getPage(ann.page);
        const { height } = pg.getSize();
        const scale = 1.5 * zoom;
        pg.drawText(ann.text, {
          x: ann.x / scale, y: height - ann.y / scale,
          size: ann.size, font,
          color: pdfLib.rgb(...hexToRgb(ann.color)),
        });
      }

      // Embed image annotations
      for (const ann of imageAnnotations) {
        if (ann.page >= doc.getPageCount()) continue;
        const pg = doc.getPage(ann.page);
        const { height } = pg.getSize();
        const scale = 1.5 * zoom;
        const resp = await fetch(ann.dataUrl);
        const imgBytes = new Uint8Array(await resp.arrayBuffer());
        const isPng = ann.dataUrl.includes("image/png");
        const embedded = isPng ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes);
        const drawW = ann.w / scale;
        const drawH = ann.h / scale;
        pg.drawImage(embedded, { x: ann.x / scale, y: height - ann.y / scale - drawH, width: drawW, height: drawH });
      }

      // Embed canvas drawings (strokes) per page
      for (const [pageIdx, handle] of canvasRefs.current.entries()) {
        if (handle.isEmpty() || pageIdx >= doc.getPageCount()) continue;
        const dataUrl = handle.toDataURL();
        const resp = await fetch(dataUrl);
        const imgBytes = new Uint8Array(await resp.arrayBuffer());
        const embedded = await doc.embedPng(imgBytes);
        const pg = doc.getPage(pageIdx);
        const { width, height } = pg.getSize();
        pg.drawImage(embedded, { x: 0, y: 0, width, height, opacity: 1 });
      }

      const outBytes = await doc.save();
      const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
      const baseName = (file?.name ?? "document").replace(/\.pdf$/i, "");
      downloadBlob(blob, `${baseName}-edited.pdf`);
      setStatus("ready");
    } catch (e) {
      setError((e as Error).message || "Export failed.");
      setStatus("ready");
    }
  }, [textAnnotations, imageAnnotations, file, zoom]);

  const reset = useCallback(() => {
    pdfJsDocRef.current?.destroy();
    pdfDocRef.current = null;
    pdfJsDocRef.current = null;
    pdfBytesRef.current = null;
    canvasRefs.current.clear();
    setFile(null); setPages([]); setActivePage(0); setTool("none");
    setTextAnnotations([]); setImageAnnotations([]); setError(""); setStatus("idle"); setZoom(1);
  }, []);

  const drawMode: DrawMode = tool === "draw" ? "draw" : tool === "highlight" ? "highlight" : "none";
  const curPage = pages[activePage];

  // ── Toolbar buttons ────────────────────────────────────────────────────
  const TB = ({ id, icon: Ic, label }: { id: Tool; icon: typeof Pen; label: string }) => (
    <button type="button" onClick={() => setTool(tool === id ? "none" : id)} title={label}
      className={`p-2 border-[3px] border-black transition-colors ${tool === id ? "bg-[#F9FF00] text-[#1a1a1a]" : "bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a]"}`}>
      <Ic size={16} />
    </button>
  );

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70 leading-relaxed">
        Edit, annotate, sign, and export PDFs <strong>in your browser</strong> — no uploads, no server. Max {fmt(MAX_FILE)}.
      </p>

      {/* Drop zone */}
      {status === "idle" && !file && (
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          className={`border-[3px] border-dashed p-10 text-center transition-colors cursor-pointer ${dragOver ? "border-[#F9FF00] bg-[#F9FF00]/10" : "border-black bg-[#fafafa] hover:bg-[#F9FF00]/5"}`}
          onClick={() => document.getElementById("pe-file-input")?.click()} role="button" tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); document.getElementById("pe-file-input")?.click(); } }}>
          <Upload size={32} className={`mx-auto mb-3 ${dragOver ? "text-[#F9FF00]" : "text-[#1a1a1a]/40"}`} />
          <p className="font-oswald text-sm font-bold uppercase tracking-wider mb-1">{dragOver ? "Drop PDF here" : "Drag & drop a PDF"}</p>
          <p className="font-inter text-xs text-[#1a1a1a]/50">or click to browse · PDF · max {fmt(MAX_FILE)}</p>
          <input id="pe-file-input" type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => pickFile(e.target.files?.[0] ?? null)} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border-[3px] border-[#FF0004] bg-red-50 p-4 flex items-start gap-3">
          <X size={18} className="text-[#FF0004] shrink-0 mt-0.5" />
          <div>
            <p className="font-oswald text-xs font-bold uppercase text-[#FF0004]">Error</p>
            <p className="font-inter text-sm text-[#FF0004]/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {status === "loading" && (
        <div className="border-[3px] border-black p-8 flex items-center justify-center gap-3 bg-white">
          <Loader2 size={20} className="animate-spin text-[#1a1a1a]/50" />
          <span className="font-inter text-sm text-[#1a1a1a]/60">Loading PDF engine & rendering pages…</span>
        </div>
      )}

      {/* Editor */}
      {status === "ready" && pages.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="border-[3px] border-black bg-[#fafafa] p-2 flex flex-wrap items-center gap-1">
            <TB id="text" icon={Type} label="Add text" />
            <TB id="draw" icon={Pen} label="Draw / Sign" />
            <TB id="highlight" icon={Highlighter} label="Highlight" />
            <TB id="image" icon={ImagePlus} label="Add image" />
            <div className="w-px h-8 bg-black/20 mx-1" />
            <button type="button" onClick={deletePage} disabled={pages.length <= 1} title="Delete page"
              className="p-2 border-[3px] border-black bg-white hover:bg-red-50 text-[#1a1a1a] disabled:opacity-30 transition-colors">
              <Trash2 size={16} />
            </button>
            <button type="button" onClick={() => void movePage(-1)} disabled={activePage === 0} title="Move page up"
              className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] disabled:opacity-30 transition-colors">
              <ChevronUp size={16} />
            </button>
            <button type="button" onClick={() => void movePage(1)} disabled={activePage >= pages.length - 1} title="Move page down"
              className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] disabled:opacity-30 transition-colors">
              <ChevronDown size={16} />
            </button>
            <div className="w-px h-8 bg-black/20 mx-1" />
            <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} title="Zoom out"
              className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] transition-colors">
              <ZoomOut size={16} />
            </button>
            <span className="font-oswald text-[10px] font-bold uppercase tracking-wider px-2 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.25))} title="Zoom in"
              className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] transition-colors">
              <ZoomIn size={16} />
            </button>
            <div className="flex-1" />
            <button type="button" onClick={reset} title="Reset"
              className="p-2 border-[3px] border-black bg-white hover:bg-red-50 text-[#1a1a1a] transition-colors">
              <RotateCcw size={16} />
            </button>
            <button type="button" onClick={() => void exportPdf()}
              className="btn-brutal btn-brutal-yellow inline-flex items-center gap-2 py-1 px-4 text-xs">
              <Download size={14} /> Export PDF
            </button>
          </div>

          {/* Tool options */}
          {tool === "text" && (
            <div className="border-[3px] border-black bg-white p-3 flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="font-oswald text-[10px] font-bold uppercase tracking-widest block mb-1">Text</label>
                <input className="input-brutal w-full text-sm" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Type here, then click on page…" />
              </div>
              <div className="w-20">
                <label className="font-oswald text-[10px] font-bold uppercase tracking-widest block mb-1">Size</label>
                <input type="number" className="input-brutal w-full text-sm" value={textSize} min={8} max={72} onChange={e => setTextSize(+e.target.value || 16)} />
              </div>
              <div className="w-16">
                <label className="font-oswald text-[10px] font-bold uppercase tracking-widest block mb-1">Color</label>
                <input type="color" className="w-full h-[38px] border-[3px] border-black cursor-pointer" value={drawColor} onChange={e => setDrawColor(e.target.value)} />
              </div>
            </div>
          )}
          {(tool === "draw") && (
            <div className="border-[3px] border-black bg-white p-3 flex flex-wrap items-end gap-3">
              <div className="w-16">
                <label className="font-oswald text-[10px] font-bold uppercase tracking-widest block mb-1">Color</label>
                <input type="color" className="w-full h-[38px] border-[3px] border-black cursor-pointer" value={drawColor} onChange={e => setDrawColor(e.target.value)} />
              </div>
              <button type="button" onClick={() => canvasRefs.current.get(activePage)?.clearStrokes()}
                className="btn-brutal btn-brutal-ghost text-xs py-1 px-3">Clear drawings</button>
              <p className="font-inter text-[10px] text-[#1a1a1a]/50">Draw or sign with mouse / touch</p>
            </div>
          )}
          {tool === "highlight" && (
            <div className="border-[3px] border-black bg-white p-3">
              <p className="font-inter text-[10px] text-[#1a1a1a]/50">Click and drag to highlight areas with yellow marker</p>
            </div>
          )}
          {tool === "image" && (
            <div className="border-[3px] border-black bg-white p-3">
              <p className="font-inter text-[10px] text-[#1a1a1a]/50">Click on the page where you want to place the image</p>
            </div>
          )}

          {/* Main area: thumbnails + preview */}
          <div className="flex gap-0 border-[3px] border-black" style={{ minHeight: 420 }}>
            {/* Thumbnail sidebar */}
            <div className="w-24 sm:w-32 shrink-0 border-r-[3px] border-black bg-[#f5f5f5] overflow-y-auto" style={{ maxHeight: "70vh" }}>
              {pages.map((pg, i) => (
                <button key={i} type="button" onClick={() => setActivePage(i)}
                  className={`block w-full p-2 border-b-[3px] border-black transition-colors ${i === activePage ? "bg-[#F9FF00]" : "bg-white hover:bg-[#F9FF00]/10"}`}>
                  <img src={pg.thumb} alt={`Page ${i + 1}`} className="w-full border border-black/20" />
                  <span className="font-oswald text-[9px] font-bold uppercase tracking-wider mt-1 block text-center">{i + 1}</span>
                </button>
              ))}
            </div>

            {/* Preview area */}
            <div className="flex-1 overflow-auto bg-[#e5e5e5] p-4 flex justify-center items-start" style={{ maxHeight: "70vh" }}>
              <div className="relative inline-block" style={{ maxWidth: "100%" }}>
                <canvas ref={previewRef} className="border-[3px] border-black bg-white shadow-lg" style={{ maxWidth: "100%", height: "auto" }}
                  onClick={handlePreviewClick} />
                {curPage && (
                  <AnnotationCanvas
                    ref={el => { if (el) canvasRefs.current.set(activePage, el); }}
                    width={Math.round(curPage.w / 0.3 * 1.5 * zoom)}
                    height={Math.round(curPage.h / 0.3 * 1.5 * zoom)}
                    mode={drawMode} color={drawColor} lineWidth={tool === "highlight" ? 20 : 3}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="border-[3px] border-black bg-white px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <span className="font-inter text-xs text-[#1a1a1a]/60">
              Page {activePage + 1} of {pages.length} · {file?.name} · {fmt(file?.size ?? 0)}
            </span>
            <span className="font-inter text-xs text-[#1a1a1a]/40">
              {textAnnotations.length} text · {imageAnnotations.length} images · {Array.from(canvasRefs.current.values()).filter(h => !h.isEmpty()).length} drawings
            </span>
          </div>
        </>
      )}

      {/* Exporting overlay */}
      {status === "exporting" && (
        <div className="border-[3px] border-black p-8 flex items-center justify-center gap-3 bg-[#F9FF00]">
          <Loader2 size={20} className="animate-spin" />
          <span className="font-oswald text-sm font-bold uppercase tracking-wider">Exporting PDF…</span>
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}
