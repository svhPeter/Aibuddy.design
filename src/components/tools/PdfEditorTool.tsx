/**
 * PDF Editor & Signer — professional browser-based PDF annotation.
 * CDN-loaded pdf-lib + pdf.js with jsDelivr/unpkg fallback.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { downloadBlob } from "@/lib/image-tool-helpers";
import type { PdfLibDoc, PdfJsDoc } from "@/lib/pdf-cdn-loader";
import { AnnotationCanvas, type AnnotationCanvasHandle, type DrawMode } from "./pdf/AnnotationCanvas";
import {
  Download, Loader2, Upload, Type, Pen, Highlighter, ImagePlus,
  Trash2, ChevronUp, ChevronDown, RotateCcw, ZoomIn, ZoomOut,
  MousePointer2, Undo2, AlertTriangle, FileText,
} from "lucide-react";

const MAX = 100 * 1024 * 1024;
const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

type Tool = "select" | "text" | "draw" | "highlight" | "image";
type Status = "idle" | "loading" | "ready" | "exporting" | "error";
interface PageData { thumb: string; w: number; h: number }
interface TextAnn { text: string; x: number; y: number; size: number; color: string; page: number }
interface ImgAnn { dataUrl: string; x: number; y: number; w: number; h: number; page: number }

export function PdfEditorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [pages, setPages] = useState<PageData[]>([]);
  const [active, setActive] = useState(0);
  const [tool, setTool] = useState<Tool>("select");
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState(false);
  const [texts, setTexts] = useState<TextAnn[]>([]);
  const [imgs, setImgs] = useState<ImgAnn[]>([]);
  const [textVal, setTextVal] = useState("");
  const [textSz, setTextSz] = useState(16);
  const [color, setColor] = useState("#1a1a1a");

  const bytesRef = useRef<Uint8Array | null>(null);
  const docRef = useRef<PdfLibDoc | null>(null);
  const jsDocRef = useRef<PdfJsDoc | null>(null);
  const canvasMap = useRef<Map<number, AnnotationCanvasHandle>>(new Map());
  const prevRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => () => { jsDocRef.current?.destroy(); }, []);

  const renderPage = useCallback(async (idx: number) => {
    const d = jsDocRef.current, c = prevRef.current;
    if (!d || !c || idx >= pages.length) return;
    const pg = await d.getPage(idx + 1);
    const vp = pg.getViewport({ scale: 1.5 * zoom });
    c.width = vp.width; c.height = vp.height;
    const ctx = c.getContext("2d");
    if (ctx) await pg.render({ canvasContext: ctx, viewport: vp }).promise;
  }, [pages.length, zoom]);

  useEffect(() => { if (status === "ready") void renderPage(active); }, [active, zoom, status, renderPage]);

  const loadPdf = useCallback(async (f: File) => {
    setError(""); setStatus("loading"); setTexts([]); setImgs([]); canvasMap.current.clear();
    try {
      const { loadPdfLib, loadPdfJs } = await import("@/lib/pdf-cdn-loader");
      const [lib, js] = await Promise.all([loadPdfLib(), loadPdfJs()]);
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      bytesRef.current = bytes;
      docRef.current = await lib.PDFDocument.load(buf);
      jsDocRef.current?.destroy();
      const jsd = await js.getDocument({ data: bytes.slice() }).promise;
      jsDocRef.current = jsd;
      const thumbs: PageData[] = [];
      for (let i = 0; i < jsd.numPages; i++) {
        const pg = await jsd.getPage(i + 1);
        const vp = pg.getViewport({ scale: 0.25 });
        const cv = document.createElement("canvas");
        cv.width = vp.width; cv.height = vp.height;
        await pg.render({ canvasContext: cv.getContext("2d")!, viewport: vp }).promise;
        thumbs.push({ thumb: cv.toDataURL("image/jpeg", 0.5), w: vp.width, h: vp.height });
      }
      setPages(thumbs); setActive(0); setZoom(1); setTool("select"); setStatus("ready");
    } catch (e) {
      const msg = (e as Error).message || "";
      setError(msg.includes("password") ? "This PDF is encrypted. Please remove the password first."
        : msg.includes("Invalid") ? "This file appears to be corrupted or is not a valid PDF."
        : "Failed to load PDF. Please try a different file.");
      setStatus("error");
    }
  }, []);

  const pick = useCallback((f: File | null) => {
    if (!f) { setFile(null); return; }
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) { setError("Only PDF files are supported."); return; }
    if (f.size > MAX) { setError(`File exceeds ${fmt(MAX)} limit.`); return; }
    setFile(f); void loadPdf(f);
  }, [loadPdf]);

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0] ?? null); }, [pick]);

  // Page ops
  const delPage = useCallback(async () => {
    const d = docRef.current; if (!d || pages.length <= 1) return;
    d.removePage(active);
    const nb = await d.save(); bytesRef.current = nb;
    const f2 = new File([new Uint8Array(nb)], file?.name ?? "doc.pdf", { type: "application/pdf" });
    setFile(f2); setActive(Math.min(active, pages.length - 2)); void loadPdf(f2);
  }, [active, pages.length, file, loadPdf]);

  const movePg = useCallback(async (dir: -1 | 1) => {
    const tgt = active + dir;
    if (tgt < 0 || tgt >= pages.length) return;
    const { loadPdfLib } = await import("@/lib/pdf-cdn-loader");
    const lib = await loadPdfLib();
    const src = await lib.PDFDocument.load(bytesRef.current!);
    const nd = await lib.PDFDocument.create();
    const order = Array.from({ length: src.getPageCount() }, (_, i) => i);
    [order[active], order[tgt]] = [order[tgt], order[active]];
    const cp = await nd.copyPages(src, order);
    for (const p of cp) nd.addPage(p);
    const nb = await nd.save(); bytesRef.current = nb;
    const f2 = new File([new Uint8Array(nb)], file?.name ?? "doc.pdf", { type: "application/pdf" });
    setFile(f2); setActive(tgt); void loadPdf(f2);
  }, [active, pages.length, file, loadPdf]);

  // Click handlers
  const onPreviewClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = prevRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const sx = c.width / r.width, sy = c.height / r.height;
    const x = (e.clientX - r.left) * sx, y = (e.clientY - r.top) * sy;

    if (tool === "text" && textVal.trim()) {
      setTexts(p => [...p, { text: textVal, x, y, size: textSz, color, page: active }]);
      const ctx = c.getContext("2d");
      if (ctx) { ctx.font = `${textSz * 1.5 * zoom}px Inter, sans-serif`; ctx.fillStyle = color; ctx.fillText(textVal, x, y); }
    }
    if (tool === "image") {
      const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
      inp.onchange = () => {
        const imgF = inp.files?.[0]; if (!imgF) return;
        const url = URL.createObjectURL(imgF);
        const img = new Image();
        img.onload = () => {
          const w = Math.min(img.naturalWidth, 200), h = (w / img.naturalWidth) * img.naturalHeight;
          const ctx2 = c.getContext("2d"); if (ctx2) ctx2.drawImage(img, x, y, w, h);
          const tc = document.createElement("canvas");
          tc.width = img.naturalWidth; tc.height = img.naturalHeight;
          tc.getContext("2d")!.drawImage(img, 0, 0);
          setImgs(p => [...p, { dataUrl: tc.toDataURL("image/png"), x, y, w, h, page: active }]);
          URL.revokeObjectURL(url);
        };
        img.src = url;
      };
      inp.click();
    }
  }, [tool, textVal, textSz, color, active, zoom]);

  // Export
  const exportPdf = useCallback(async () => {
    if (!docRef.current || !bytesRef.current) return;
    setStatus("exporting");
    try {
      const { loadPdfLib } = await import("@/lib/pdf-cdn-loader");
      const lib = await loadPdfLib();
      const doc = await lib.PDFDocument.load(bytesRef.current);
      const font = await doc.embedFont(lib.StandardFonts.Helvetica);
      const scale = 1.5 * zoom;

      for (const a of texts) {
        if (a.page >= doc.getPageCount()) continue;
        const pg = doc.getPage(a.page);
        pg.drawText(a.text, { x: a.x / scale, y: pg.getSize().height - a.y / scale, size: a.size, font, color: lib.rgb(...hex(a.color)) });
      }
      for (const a of imgs) {
        if (a.page >= doc.getPageCount()) continue;
        const pg = doc.getPage(a.page);
        const h = pg.getSize().height;
        const resp = await fetch(a.dataUrl);
        const ib = new Uint8Array(await resp.arrayBuffer());
        const emb = a.dataUrl.includes("image/png") ? await doc.embedPng(ib) : await doc.embedJpg(ib);
        pg.drawImage(emb, { x: a.x / scale, y: h - a.y / scale - a.h / scale, width: a.w / scale, height: a.h / scale });
      }
      for (const [pi, hdl] of canvasMap.current.entries()) {
        if (hdl.isEmpty() || pi >= doc.getPageCount()) continue;
        const resp = await fetch(hdl.toDataURL());
        const emb = await doc.embedPng(new Uint8Array(await resp.arrayBuffer()));
        const pg = doc.getPage(pi);
        const { width: pw, height: ph } = pg.getSize();
        pg.drawImage(emb, { x: 0, y: 0, width: pw, height: ph });
      }
      const out = await doc.save();
      downloadBlob(new Blob([new Uint8Array(out)], { type: "application/pdf" }),
        `${(file?.name ?? "document").replace(/\.pdf$/i, "")}-edited.pdf`);
      setStatus("ready");
    } catch (e) { setError((e as Error).message || "Export failed."); setStatus("ready"); }
  }, [texts, imgs, file, zoom]);

  const reset = useCallback(() => {
    jsDocRef.current?.destroy(); docRef.current = null; jsDocRef.current = null;
    bytesRef.current = null; canvasMap.current.clear();
    setFile(null); setPages([]); setActive(0); setTool("select");
    setTexts([]); setImgs([]); setError(""); setStatus("idle"); setZoom(1);
  }, []);

  const undoAnn = useCallback(() => {
    const hdl = canvasMap.current.get(active);
    if (hdl && !hdl.isEmpty()) { hdl.undo(); return; }
    if (texts.length > 0 && texts[texts.length - 1].page === active) { setTexts(p => p.slice(0, -1)); void renderPage(active); return; }
    if (imgs.length > 0 && imgs[imgs.length - 1].page === active) { setImgs(p => p.slice(0, -1)); void renderPage(active); }
  }, [active, texts, imgs, renderPage]);

  const dm: DrawMode = tool === "draw" ? "draw" : tool === "highlight" ? "highlight" : "none";
  const cur = pages[active];
  const processing = status === "loading" || status === "exporting";

  // Toolbar button
  const Tb = ({ id, icon: Ic, label }: { id: Tool; icon: typeof Pen; label: string }) => (
    <button type="button" onClick={() => setTool(id)} title={label} aria-label={label}
      className={`p-2 border-[3px] border-black transition-colors ${tool === id ? "bg-[#F9FF00] text-[#1a1a1a] z-10" : "bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a]"}`}>
      <Ic size={15} />
    </button>
  );

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70 leading-relaxed">
        Edit, annotate, sign, and export PDFs <strong>in your browser</strong> — no uploads, no server. Max {fmt(MAX)}.
      </p>

      {/* Drop zone */}
      {status === "idle" && !file && (
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          className={`border-[3px] border-dashed p-12 text-center transition-all cursor-pointer ${drag ? "border-[#F9FF00] bg-[#F9FF00]/10 scale-[1.01]" : "border-black bg-[#fafafa] hover:bg-[#F9FF00]/5"}`}
          onClick={() => document.getElementById("pe-in")?.click()} role="button" tabIndex={0} aria-label="Upload PDF"
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); document.getElementById("pe-in")?.click(); } }}>
          <Upload size={36} className={`mx-auto mb-3 ${drag ? "text-[#F9FF00]" : "text-[#1a1a1a]/30"}`} />
          <p className="font-oswald text-sm font-bold uppercase tracking-wider mb-1">{drag ? "Drop PDF here" : "Drag & drop a PDF"}</p>
          <p className="font-inter text-xs text-[#1a1a1a]/40">or click to browse · max {fmt(MAX)}</p>
          <input id="pe-in" type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => pick(e.target.files?.[0] ?? null)} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border-[3px] border-[#FF0004] bg-red-50/80 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#FF0004] shrink-0 mt-0.5" />
          <div>
            <p className="font-oswald text-xs font-bold uppercase text-[#FF0004] tracking-wider">Something went wrong</p>
            <p className="font-inter text-sm text-[#1a1a1a]/70 mt-1">{error}</p>
            <button type="button" onClick={() => { setError(""); if (status === "error") reset(); }}
              className="font-oswald text-[10px] font-bold uppercase tracking-wider text-[#FF0004] hover:underline mt-2">Try again</button>
          </div>
        </div>
      )}

      {/* Loading */}
      {status === "loading" && (
        <div className="border-[3px] border-black bg-white">
          <div className="p-6 flex items-center justify-center gap-3">
            <Loader2 size={20} className="animate-spin text-[#1a1a1a]/50" />
            <span className="font-inter text-sm text-[#1a1a1a]/60">Loading PDF engine & rendering pages…</span>
          </div>
          <div className="h-2 bg-[#f5f5f5] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-[#F9FF00] to-transparent animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* ═══ EDITOR ═══ */}
      {status === "ready" && pages.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="border-[3px] border-black bg-[#1a1a1a] p-1.5 flex flex-wrap items-center gap-0.5">
            <Tb id="select" icon={MousePointer2} label="Select" />
            <Tb id="text" icon={Type} label="Add text" />
            <Tb id="draw" icon={Pen} label="Draw / Sign" />
            <Tb id="highlight" icon={Highlighter} label="Highlight" />
            <Tb id="image" icon={ImagePlus} label="Add image" />
            <div className="w-px h-7 bg-white/20 mx-1" />
            <button type="button" onClick={undoAnn} title="Undo" aria-label="Undo"
              className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] transition-colors">
              <Undo2 size={15} />
            </button>
            <div className="w-px h-7 bg-white/20 mx-1" />
            <button type="button" onClick={delPage} disabled={pages.length <= 1} title="Delete page" aria-label="Delete page"
              className="p-2 border-[3px] border-black bg-white hover:bg-red-50 text-[#1a1a1a] disabled:opacity-30 transition-colors">
              <Trash2 size={15} />
            </button>
            <button type="button" onClick={() => void movePg(-1)} disabled={active === 0} title="Move up" aria-label="Move page up"
              className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] disabled:opacity-30 transition-colors">
              <ChevronUp size={15} />
            </button>
            <button type="button" onClick={() => void movePg(1)} disabled={active >= pages.length - 1} title="Move down" aria-label="Move page down"
              className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] disabled:opacity-30 transition-colors">
              <ChevronDown size={15} />
            </button>
            <div className="w-px h-7 bg-white/20 mx-1" />
            <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} title="Zoom out" aria-label="Zoom out"
              className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] transition-colors"><ZoomOut size={15} /></button>
            <span className="font-oswald text-[10px] font-bold uppercase tracking-wider text-white px-2 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.25))} title="Zoom in" aria-label="Zoom in"
              className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] transition-colors"><ZoomIn size={15} /></button>
            <div className="flex-1" />
            <button type="button" onClick={reset} title="Reset project" aria-label="Reset"
              className="p-2 border-[3px] border-black bg-white hover:bg-red-50 text-[#1a1a1a] transition-colors"><RotateCcw size={15} /></button>
            <button type="button" onClick={() => void exportPdf()} disabled={processing}
              className="btn-brutal btn-brutal-yellow inline-flex items-center gap-1.5 py-1 px-4 text-xs disabled:opacity-50">
              <Download size={14} /> Export PDF
            </button>
          </div>

          {/* Tool options */}
          {tool === "text" && (
            <div className="border-[3px] border-black bg-white p-3 flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="font-oswald text-[10px] font-bold uppercase tracking-[0.15em] block mb-1">Text</label>
                <input className="input-brutal w-full text-sm" value={textVal} onChange={e => setTextVal(e.target.value)} placeholder="Type here, then click on page…" />
              </div>
              <div className="w-20">
                <label className="font-oswald text-[10px] font-bold uppercase tracking-[0.15em] block mb-1">Size</label>
                <input type="number" className="input-brutal w-full text-sm" value={textSz} min={8} max={72} onChange={e => setTextSz(+e.target.value || 16)} />
              </div>
              <div className="w-14">
                <label className="font-oswald text-[10px] font-bold uppercase tracking-[0.15em] block mb-1">Color</label>
                <input type="color" className="w-full h-[38px] border-[3px] border-black cursor-pointer" value={color} onChange={e => setColor(e.target.value)} />
              </div>
            </div>
          )}
          {tool === "draw" && (
            <div className="border-[3px] border-black bg-white p-3 flex flex-wrap items-end gap-3">
              <div className="w-14">
                <label className="font-oswald text-[10px] font-bold uppercase tracking-[0.15em] block mb-1">Color</label>
                <input type="color" className="w-full h-[38px] border-[3px] border-black cursor-pointer" value={color} onChange={e => setColor(e.target.value)} />
              </div>
              <button type="button" onClick={() => canvasMap.current.get(active)?.clearStrokes()}
                className="btn-brutal btn-brutal-ghost text-xs py-1 px-3">Clear strokes</button>
              <p className="font-inter text-[10px] text-[#1a1a1a]/40 ml-auto">Draw or sign with mouse / touch</p>
            </div>
          )}
          {tool === "highlight" && (
            <div className="border-[3px] border-black bg-white p-3">
              <p className="font-inter text-[10px] text-[#1a1a1a]/40">Click and drag to highlight areas with yellow marker</p>
            </div>
          )}
          {tool === "image" && (
            <div className="border-[3px] border-black bg-white p-3">
              <p className="font-inter text-[10px] text-[#1a1a1a]/40">Click on the page to place an image, logo, or signature</p>
            </div>
          )}

          {/* Workspace */}
          <div className="flex gap-0 border-[3px] border-black bg-[#e0e0e0]" style={{ minHeight: 460 }}>
            {/* Thumbnails */}
            <div className="w-20 sm:w-28 shrink-0 border-r-[3px] border-black bg-[#1a1a1a] overflow-y-auto" style={{ maxHeight: "72vh" }}>
              {pages.map((pg, i) => (
                <button key={i} type="button" onClick={() => setActive(i)}
                  className={`block w-full p-1.5 sm:p-2 transition-colors ${i === active ? "bg-[#F9FF00]" : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"}`}>
                  <img src={pg.thumb} alt={`Page ${i + 1}`} className="w-full border border-black/30 shadow-sm" />
                  <span className={`font-oswald text-[8px] sm:text-[9px] font-bold uppercase tracking-wider mt-1 block text-center ${i === active ? "text-[#1a1a1a]" : "text-white/60"}`}>
                    {i + 1}
                  </span>
                </button>
              ))}
            </div>

            {/* Canvas preview */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start" style={{ maxHeight: "72vh" }}>
              <div className="relative inline-block shadow-2xl" style={{ maxWidth: "100%" }}>
                <canvas ref={prevRef} className="border-[3px] border-black bg-white" style={{ maxWidth: "100%", height: "auto" }}
                  onClick={onPreviewClick} />
                {cur && (
                  <AnnotationCanvas
                    ref={el => { if (el) canvasMap.current.set(active, el); }}
                    width={Math.round(cur.w / 0.25 * 1.5 * zoom)}
                    height={Math.round(cur.h / 0.25 * 1.5 * zoom)}
                    mode={dm} color={color} lineWidth={tool === "highlight" ? 20 : 3} />
                )}
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="border-[3px] border-black bg-[#1a1a1a] px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText size={12} className="text-[#F9FF00]" />
              <span className="font-inter text-xs text-white/60">
                Page {active + 1} of {pages.length} · {file?.name} · {fmt(file?.size ?? 0)}
              </span>
            </div>
            <span className="font-inter text-[10px] text-white/30">
              {texts.length} text · {imgs.length} images · {[...canvasMap.current.values()].filter(h => !h.isEmpty()).length} drawings
            </span>
          </div>
        </>
      )}

      {/* Exporting */}
      {status === "exporting" && (
        <div className="border-[3px] border-black p-6 flex items-center justify-center gap-3 bg-[#F9FF00]">
          <Loader2 size={20} className="animate-spin" />
          <span className="font-oswald text-sm font-bold uppercase tracking-wider">Exporting PDF…</span>
        </div>
      )}
    </div>
  );
}

function hex(h: string): [number, number, number] {
  const c = h.replace("#", "");
  return [parseInt(c.slice(0, 2), 16) / 255, parseInt(c.slice(2, 4), 16) / 255, parseInt(c.slice(4, 6), 16) / 255];
}
