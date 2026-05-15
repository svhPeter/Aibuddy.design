import { useState, useCallback, useEffect } from "react";
import { fileToImage, imageToCanvas, downloadBlob } from "@/lib/image-tool-helpers";
import { useObjectUrl } from "@/hooks/use-object-url";
import { ToolResultPanel } from "@/components/tools/ToolResultPanel";
import { jsPDF } from "jspdf";
import { Download, Loader2, RefreshCw } from "lucide-react";

async function buildPdfBlob(
  list: File[],
  coverTitle: string,
  coverSubtitle: string,
  footerLine: string
): Promise<Blob | null> {
  if (!list.length) return null;

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const m = 10;
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const maxW = pageW - 2 * m;
  const maxH = pageH - 2 * m;

  const titleT = coverTitle.trim();
  const subT = coverSubtitle.trim();
  const hasCover = titleT.length > 0 || subT.length > 0;
  const footer = footerLine.trim();

  const drawFooterOnCurrentPage = () => {
    if (!footer) return;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(44, 44, 44);
    pdf.text(footer, pageW / 2, pageH - 7, { align: "center", maxWidth: maxW });
  };

  if (hasCover) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(26, 26, 26);
    if (titleT) {
      pdf.text(titleT, pageW / 2, pageH / 2 - 14, {
        align: "center",
        maxWidth: maxW,
      });
    }
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    if (subT) {
      pdf.text(subT, pageW / 2, pageH / 2 + 8, {
        align: "center",
        maxWidth: maxW,
      });
    }
  }

  for (let i = 0; i < list.length; i++) {
    if (hasCover || i > 0) {
      pdf.addPage();
    }

    const f = list[i];
    const imgEl = await fileToImage(f);
    const c = imageToCanvas(imgEl);
    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    const wPx = c.width;
    const hPx = c.height;
    const wMm0 = (wPx / 96) * 25.4;
    const hMm0 = (hPx / 96) * 25.4;
    const s = Math.min(maxW / wMm0, maxH / hMm0, 1);
    const wM = wMm0 * s;
    const hM = hMm0 * s;
    const x = m + (maxW - wM) / 2;
    const y = m + (maxH - hM) / 2;
    pdf.addImage(dataUrl, "JPEG", x, y, wM, hM, undefined, "MEDIUM", 0);
    drawFooterOnCurrentPage();
  }

  const out = pdf.output("blob");
  return out instanceof Blob ? out : null;
}

export function JpgPdfTool() {
  const [list, setList] = useState<File[]>([]);
  const [fileBase, setFileBase] = useState("aibuddy-export");
  const [coverTitle, setCoverTitle] = useState("");
  const [coverSubtitle, setCoverSubtitle] = useState("");
  const [footerLine, setFooterLine] = useState("");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const previewUrl = useObjectUrl(pdfBlob);

  const onFiles = (fs: FileList | null) => {
    if (!fs?.length) {
      setList([]);
      return;
    }
    setList(Array.from(fs).filter((f) => f.type.startsWith("image/")));
  };

  const refreshPreview = useCallback(async () => {
    if (!list.length) {
      setPdfBlob(null);
      return;
    }
    setPdfBusy(true);
    try {
      const blob = await buildPdfBlob(
        list,
        coverTitle,
        coverSubtitle,
        footerLine
      );
      setPdfBlob(blob);
    } finally {
      setPdfBusy(false);
    }
  }, [list, coverTitle, coverSubtitle, footerLine]);

  useEffect(() => {
    if (!list.length) {
      setPdfBlob(null);
      return;
    }
    const t = window.setTimeout(() => {
      void refreshPreview();
    }, 320);
    return () => window.clearTimeout(t);
  }, [list, coverTitle, coverSubtitle, footerLine, refreshPreview]);

  const downloadPdf = () => {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, `${(fileBase || "export").replace(/\.pdf$/i, "")}.pdf`);
  };

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        Merge <strong>images</strong> into an A4 PDF (one per page). Optional cover
        title and a footer on each image page. Preview updates after a short delay;
        then download.
      </p>
      <input
        type="file"
        accept="image/*"
        multiple
        className="input-brutal p-2 text-xs"
        onChange={(e) => onFiles(e.target.files)}
      />
      {list.length > 0 && (
        <>
          <ul className="font-inter text-xs space-y-1 list-disc pl-4">
            {list.map((f) => (
              <li key={f.name + f.size + f.lastModified}>
                {f.name} — {(f.size / 1024).toFixed(0)} KB
              </li>
            ))}
          </ul>
          <div>
            <label className="font-oswald text-xs font-bold uppercase block mb-1">
              File name (download)
            </label>
            <input
              className="input-brutal"
              value={fileBase}
              onChange={(e) => setFileBase(e.target.value)}
              placeholder="my-document"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-oswald text-xs font-bold uppercase block mb-1">
                Cover title (optional)
              </label>
              <input
                className="input-brutal"
                value={coverTitle}
                onChange={(e) => setCoverTitle(e.target.value)}
                placeholder="e.g. Project handoff"
              />
            </div>
            <div>
              <label className="font-oswald text-xs font-bold uppercase block mb-1">
                Cover subtitle (optional)
              </label>
              <input
                className="input-brutal"
                value={coverSubtitle}
                onChange={(e) => setCoverSubtitle(e.target.value)}
                placeholder="e.g. Screens — March 2026"
              />
            </div>
          </div>
          <div>
            <label className="font-oswald text-xs font-bold uppercase block mb-1">
              Footer on image pages (optional)
            </label>
            <input
              className="input-brutal"
              value={footerLine}
              onChange={(e) => setFooterLine(e.target.value)}
              placeholder="e.g. © Your company — Confidential"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refreshPreview()}
              disabled={pdfBusy || !list.length}
              className="inline-flex items-center gap-2 btn-brutal btn-brutal-ghost"
            >
              {pdfBusy ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <RefreshCw size={16} />
              )}
              Update preview now
            </button>
          </div>

          <ToolResultPanel
            show={true}
            title="PDF preview"
            preview={
              <div className="relative w-full max-w-3xl">
                {pdfBusy ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 border-[3px] border-black">
                    <Loader2 className="animate-spin" size={28} />
                  </div>
                ) : null}
                {previewUrl ? (
                  <iframe
                    title="PDF preview"
                    src={previewUrl}
                    className="w-full min-h-[360px] h-[420px] max-w-full border-[3px] border-black bg-white"
                  />
                ) : (
                  <div className="font-inter text-xs text-[#1a1a1a]/60 py-16 text-center border-[3px] border-dashed border-black bg-white">
                    Generating preview…
                  </div>
                )}
              </div>
            }
            auxiliary={
              pdfBlob ? (
                <span>
                  {pdfBusy
                    ? "Updating preview…"
                    : `Ready to download (~${(pdfBlob.size / 1024).toFixed(0)} KB).`}
                </span>
              ) : pdfBusy ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> Building PDF…
                </span>
              ) : null
            }
            actions={
              <button
                type="button"
                onClick={downloadPdf}
                disabled={!pdfBlob || pdfBusy}
                className="inline-flex items-center gap-2 btn-brutal btn-brutal-yellow disabled:opacity-40"
              >
                <Download size={16} />
                Download PDF
              </button>
            }
          />
        </>
      )}
    </div>
  );
}
