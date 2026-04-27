import { useState, useCallback } from "react";
import { fileToImage, imageToCanvas } from "@/lib/image-tool-helpers";
import { jsPDF } from "jspdf";
import { FileUp } from "lucide-react";

export function JpgPdfTool() {
  const [list, setList] = useState<File[]>([]);
  const [title, setTitle] = useState("aibuddy-export");

  const onFiles = (fs: FileList | null) => {
    if (!fs?.length) {
      setList([]);
      return;
    }
    setList(Array.from(fs).filter((f) => f.type.startsWith("image/")));
  };

  const makePdf = useCallback(() => {
    if (!list.length) return;
    void (async () => {
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const m = 10;
      const maxW = pdf.internal.pageSize.getWidth() - 2 * m;
      const maxH = pdf.internal.pageSize.getHeight() - 2 * m;
      for (let i = 0; i < list.length; i++) {
        const f = list[i];
        const img = await fileToImage(f);
        const c = imageToCanvas(img);
        const dataUrl = c.toDataURL("image/jpeg", 0.9);
        const wPx = c.width;
        const hPx = c.height;
        // Convert px to mm: assume 96px per inch, 1 inch = 25.4 mm
        const wMm0 = (wPx / 96) * 25.4;
        const hMm0 = (hPx / 96) * 25.4;
        const s = Math.min(maxW / wMm0, maxH / hMm0, 1);
        const wM = wMm0 * s;
        const hM = hMm0 * s;
        if (i > 0) pdf.addPage();
        const x = m + (maxW - wM) / 2;
        const y = m + (maxH - hM) / 2;
        pdf.addImage(dataUrl, "JPEG", x, y, wM, hM, undefined, "MEDIUM", 0);
      }
      pdf.save(`${title || "images"}.pdf`);
    })();
  }, [list, title]);

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        Merges multiple <strong>images</strong> into a single A4 PDF — one image per
        page, fit inside the printable area. Processing stays in your browser.
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
              file name
            </label>
            <input
              className="input-brutal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={makePdf}
            className="inline-flex items-center gap-2 btn-brutal btn-brutal-yellow"
          >
            <FileUp size={16} />
            download PDF
          </button>
        </>
      )}
    </div>
  );
}
