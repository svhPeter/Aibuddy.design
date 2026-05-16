/**
 * PDF Editor & Signer — professional browser-based PDF annotation.
 * Phase A implementation.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { downloadBlob } from "@/lib/image-tool-helpers";
import type { PdfLibDoc, PdfJsDoc } from "@/lib/pdf-cdn-loader";
import { AnnotationCanvas, type AnnotationCanvasHandle, type DrawMode } from "./pdf/AnnotationCanvas";
import { EditorToolbar } from "./pdf/EditorToolbar";
import { ThumbnailSidebar } from "./pdf/ThumbnailSidebar";
import { PropertiesPanel } from "./pdf/PropertiesPanel";
import { useEditorHistory } from "./pdf/useEditorHistory";
import { nextId, type EditorTool, type PageData, type Annotation } from "./pdf/types";
import { Loader2, Upload, AlertTriangle, FileText } from "lucide-react";

const MAX = 100 * 1024 * 1024;
const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

type Status = "idle" | "loading" | "ready" | "exporting" | "error";

export function PdfEditorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [pages, setPages] = useState<PageData[]>([]);
  const [active, setActive] = useState(0);
  const [tool, setTool] = useState<EditorTool>("select");
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState(false);

  const [textVal, setTextVal] = useState("");
  const [textSz, setTextSz] = useState(16);
  const [color, setColor] = useState("#1a1a1a");

  const { annotations, push, undo, redo, reset: resetHistory, canUndo, canRedo } = useEditorHistory();

  const bytesRef = useRef<Uint8Array | null>(null);
  const docRef = useRef<PdfLibDoc | null>(null);
  const jsDocRef = useRef<PdfJsDoc | null>(null);
  const canvasMap = useRef<Map<number, AnnotationCanvasHandle>>(new Map());
  const prevRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => () => { jsDocRef.current?.destroy(); }, []);

  const renderPage = useCallback(async (idx: number) => {
    const d = jsDocRef.current, c = prevRef.current;
    const pgData = pages[idx];
    if (!d || !c || !pgData) return;
    const pg = await d.getPage(idx + 1);
    const vp = pg.getViewport({ scale: 1.5 * zoom, rotation: pgData.rotation });
    c.width = vp.width; c.height = vp.height;
    const ctx = c.getContext("2d");
    if (ctx) await pg.render({ canvasContext: ctx, viewport: vp }).promise;
  }, [pages, zoom]);

  useEffect(() => { if (status === "ready") void renderPage(active); }, [active, zoom, status, renderPage]);

  const loadPdf = useCallback(async (f: File) => {
    setError(""); setStatus("loading"); resetHistory(); canvasMap.current.clear();
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
        thumbs.push({ thumb: cv.toDataURL("image/jpeg", 0.5), w: vp.width, h: vp.height, rotation: 0 });
      }
      setPages(thumbs); setActive(0); setZoom(1); setTool("select"); setStatus("ready");
    } catch (e) {
      const msg = (e as Error).message || "";
      setError(msg.includes("password") ? "This PDF is encrypted. Please remove the password first."
        : msg.includes("Invalid") ? "This file appears to be corrupted or is not a valid PDF."
        : "Failed to load PDF. Please try a different file.");
      setStatus("error");
    }
  }, [resetHistory]);

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

  const rotatePg = useCallback(() => {
    setPages(ps => ps.map((p, i) => i === active ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  }, [active]);

  const mergePdf = useCallback(() => {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".pdf,application/pdf";
    inp.onchange = async () => {
      const mf = inp.files?.[0]; if (!mf) return;
      setStatus("loading");
      try {
        const { loadPdfLib } = await import("@/lib/pdf-cdn-loader");
        const lib = await loadPdfLib();
        const src1 = await lib.PDFDocument.load(bytesRef.current!);
        const src2 = await lib.PDFDocument.load(await mf.arrayBuffer());
        const cp = await src1.copyPages(src2, src2.getPageIndices());
        for (const p of cp) src1.addPage(p);
        const nb = await src1.save(); bytesRef.current = nb;
        const f2 = new File([new Uint8Array(nb)], file?.name ?? "doc.pdf", { type: "application/pdf" });
        setFile(f2); void loadPdf(f2);
      } catch (e) { setError("Failed to merge PDF."); setStatus("ready"); }
    };
    inp.click();
  }, [file, loadPdf]);

  const splitPdf = useCallback(async () => {
    if (!docRef.current || !bytesRef.current) return;
    setStatus("loading");
    try {
      const { loadPdfLib } = await import("@/lib/pdf-cdn-loader");
      const lib = await loadPdfLib();
      const src = await lib.PDFDocument.load(bytesRef.current);
      const nd = await lib.PDFDocument.create();
      const cp = await nd.copyPages(src, [active]);
      nd.addPage(cp[0]);
      const nb = await nd.save();
      downloadBlob(new Blob([new Uint8Array(nb)], { type: "application/pdf" }), `${(file?.name ?? "doc").replace(/\.pdf$/i, "")}-page-${active + 1}.pdf`);
      setStatus("ready");
    } catch (e) { setError("Failed to split PDF."); setStatus("ready"); }
  }, [active, file]);

  // Click handlers
  const onPreviewClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = prevRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const sx = c.width / r.width, sy = c.height / r.height;
    const x = (e.clientX - r.left) * sx, y = (e.clientY - r.top) * sy;

    let newAnn: Annotation | null = null;

    if (tool === "text" && textVal.trim()) {
      newAnn = { id: nextId(), type: "text", text: textVal, x, y, size: textSz, color, page: active };
    } else if (tool === "whiteout" || tool === "redact") {
      newAnn = {
        id: nextId(), type: tool, x, y, w: 100 * zoom, h: 20 * zoom, page: active,
        text: tool === "whiteout" ? textVal : undefined, textSize: textSz
      };
    } else if (tool === "image") {
      const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
      inp.onchange = () => {
        const imgF = inp.files?.[0]; if (!imgF) return;
        const url = URL.createObjectURL(imgF);
        const img = new Image();
        img.onload = () => {
          const w = Math.min(img.naturalWidth, 200), h = (w / img.naturalWidth) * img.naturalHeight;
          const tc = document.createElement("canvas");
          tc.width = img.naturalWidth; tc.height = img.naturalHeight;
          tc.getContext("2d")!.drawImage(img, 0, 0);
          push([...annotations, { id: nextId(), type: "image", dataUrl: tc.toDataURL("image/png"), x, y, w, h, page: active }]);
          URL.revokeObjectURL(url);
        };
        img.src = url;
      };
      inp.click();
    }

    if (newAnn) push([...annotations, newAnn]);
  }, [tool, textVal, textSz, color, active, zoom, annotations, push]);

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

      // Apply rotations
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].rotation !== 0) {
          const pg = doc.getPage(i);
          pg.setRotation(lib.degrees(pages[i].rotation));
        }
      }

      for (const a of annotations) {
        if (a.page >= doc.getPageCount()) continue;
        const pg = doc.getPage(a.page);
        const h = pg.getSize().height;

        if (a.type === "text") {
          pg.drawText(a.text, { x: a.x / scale, y: h - a.y / scale, size: a.size, font, color: lib.rgb(...hex(a.color)) });
        } else if (a.type === "image") {
          const resp = await fetch(a.dataUrl);
          const ib = new Uint8Array(await resp.arrayBuffer());
          const emb = a.dataUrl.includes("image/png") ? await doc.embedPng(ib) : await doc.embedJpg(ib);
          pg.drawImage(emb, { x: a.x / scale, y: h - a.y / scale - a.h / scale, width: a.w / scale, height: a.h / scale });
        } else if (a.type === "whiteout" || a.type === "redact") {
          pg.drawRectangle({
            x: a.x / scale, y: h - a.y / scale - a.h / scale, width: a.w / scale, height: a.h / scale,
            color: a.type === "redact" ? lib.rgb(0,0,0) : lib.rgb(1,1,1)
          });
          if (a.type === "whiteout" && a.text) {
            pg.drawText(a.text, { x: (a.x + 5) / scale, y: h - (a.y + a.h - 5) / scale, size: a.textSize || 12, font, color: lib.rgb(...hex(color)) });
          }
        }
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
  }, [annotations, file, zoom, color, pages]);

  const reset = useCallback(() => {
    jsDocRef.current?.destroy(); docRef.current = null; jsDocRef.current = null;
    bytesRef.current = null; canvasMap.current.clear();
    setFile(null); setPages([]); setActive(0); setTool("select");
    resetHistory(); setError(""); setStatus("idle"); setZoom(1);
  }, [resetHistory]);

  const undoAnn = useCallback(() => {
    const hdl = canvasMap.current.get(active);
    if (hdl && !hdl.isEmpty() && (tool === "draw" || tool === "highlight")) { hdl.undo(); return; }
    undo();
  }, [active, tool, undo]);

  // Keyboard shortcuts
  useEffect(() => {
    if (status !== "ready") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undoAnn();
      }
      if (e.key === "Escape") setTool("select");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, undoAnn, redo]);

  const dm: DrawMode = tool === "draw" ? "draw" : tool === "highlight" ? "highlight" : "none";
  const cur = pages[active];

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70 leading-relaxed">
        Edit, annotate, sign, and export PDFs <strong>in your browser</strong> — no uploads, no server. Max {fmt(MAX)}.
      </p>

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

      {status === "ready" && pages.length > 0 && (
        <div className="border-[3px] border-black flex flex-col bg-[#e0e0e0] shadow-xl" style={{ height: "80vh", minHeight: 600 }}>
          <EditorToolbar
            tool={tool} setTool={setTool} zoom={zoom} setZoom={setZoom}
            canUndo={canUndo} canRedo={canRedo} onUndo={undoAnn} onRedo={redo}
            onReset={reset} onExport={() => void exportPdf()} onMerge={mergePdf} onSplit={() => void splitPdf()}
            isProcessing={status === "exporting"}
          />
          
          <div className="flex flex-1 overflow-hidden">
            <ThumbnailSidebar
              pages={pages} active={active} setActive={setActive}
              onMoveUp={() => void movePg(-1)} onMoveDown={() => void movePg(1)}
              onDelete={() => void delPage()} onRotate={rotatePg}
            />

            <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-[#e0e0e0] relative">
              <div className="relative inline-block shadow-2xl transition-transform" style={{ maxWidth: "100%", transformOrigin: "top center" }}>
                <canvas ref={prevRef} className="bg-white border-[3px] border-black" 
                  style={{ maxWidth: "100%", height: "auto" }} onClick={onPreviewClick} />
                
                {/* Render Annotations Overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
                  {annotations.filter(a => a.page === active).map(a => {
                    if (a.type === "text") {
                      return <div key={a.id} style={{ position: "absolute", left: a.x / zoom, top: a.y / zoom, color: a.color, fontSize: a.size, fontFamily: "Inter, sans-serif", whiteSpace: "pre" }}>{a.text}</div>;
                    }
                    if (a.type === "image") {
                      return <img key={a.id} src={a.dataUrl} style={{ position: "absolute", left: a.x / zoom, top: a.y / zoom, width: a.w / zoom, height: a.h / zoom }} alt="ann" />;
                    }
                    if (a.type === "whiteout" || a.type === "redact") {
                      return (
                        <div key={a.id} style={{ position: "absolute", left: a.x / zoom, top: a.y / zoom, width: a.w / zoom, height: a.h / zoom, backgroundColor: a.type === "redact" ? "black" : "white", border: a.type === "whiteout" ? "1px solid #ccc" : "none", display: "flex", alignItems: "center", paddingLeft: 4, color: color, fontSize: a.textSize || 12 }}>
                          {a.type === "whiteout" && a.text}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                {cur && (
                  <AnnotationCanvas
                    ref={el => { if (el) canvasMap.current.set(active, el); }}
                    width={Math.round(cur.w / 0.25 * 1.5 * zoom)}
                    height={Math.round(cur.h / 0.25 * 1.5 * zoom)}
                    mode={dm} color={color} lineWidth={tool === "highlight" ? 20 : 3} />
                )}
              </div>
            </div>

            <PropertiesPanel
              tool={tool} textVal={textVal} setTextVal={setTextVal} textSz={textSz} setTextSz={setTextSz}
              color={color} setColor={setColor} onClearStrokes={() => canvasMap.current.get(active)?.clearStrokes()}
            />
          </div>

          <div className="border-t-[3px] border-black bg-[#1a1a1a] px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-20 relative">
            <div className="flex items-center gap-2">
              <FileText size={12} className="text-[#F9FF00]" />
              <span className="font-inter text-xs text-white/60">
                Page {active + 1} of {pages.length} · {file?.name} · {fmt(file?.size ?? 0)}
              </span>
            </div>
            <span className="font-inter text-[10px] text-white/30">
              {annotations.length} items
            </span>
          </div>
        </div>
      )}

      {status === "exporting" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="border-[3px] border-black p-8 flex flex-col items-center justify-center gap-4 bg-[#F9FF00] shadow-[16px_16px_0px_rgba(0,0,0,1)]">
            <Loader2 size={32} className="animate-spin text-[#1a1a1a]" />
            <span className="font-oswald text-xl font-bold uppercase tracking-wider text-[#1a1a1a]">Exporting PDF…</span>
          </div>
        </div>
      )}
    </div>
  );
}

function hex(h: string): [number, number, number] {
  const c = h.replace("#", "");
  return [parseInt(c.slice(0, 2), 16) / 255, parseInt(c.slice(2, 4), 16) / 255, parseInt(c.slice(4, 6), 16) / 255];
}
