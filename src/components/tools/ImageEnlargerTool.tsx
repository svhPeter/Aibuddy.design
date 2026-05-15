import { useState, useCallback, useEffect } from "react";
import { fileToImage, downloadDataUrl } from "@/lib/image-tool-helpers";
import { ToolResultPanel } from "@/components/tools/ToolResultPanel";
import { Loader2, Download } from "lucide-react";

export function ImageEnlargerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [w, setW] = useState(1600);
  const [h, setH] = useState(900);
  const [name, setName] = useState("export");
  const [busy, setBusy] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const apply = useCallback(
    (scale: number) => {
      if (!file) return;
      void (async () => {
        const img = await fileToImage(file);
        setW(Math.round(img.naturalWidth * scale));
        setH(Math.round(img.naturalHeight * scale));
      })();
    },
    [file]
  );

  useEffect(() => {
    if (!file) {
      setPreviewDataUrl(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const img = await fileToImage(file);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, w, h);
        const url = c.toDataURL("image/png");
        if (!cancelled) setPreviewDataUrl(url);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, w, h]);

  const download = useCallback(() => {
    if (!previewDataUrl) return;
    downloadDataUrl(previewDataUrl, `${name || "enlarged"}.png`);
  }, [previewDataUrl, name]);

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        Scales the image in-browser (bilinear). Preview shows the target size; then
        download PNG.
      </p>
      <input
        type="file"
        accept="image/*"
        className="input-brutal p-2 text-xs"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setFile(f);
          if (f) {
            setName(f.name.replace(/\.[^.]+$/, "") || "export");
            void (async () => {
              const i = await fileToImage(f);
              setW(i.naturalWidth);
              setH(i.naturalHeight);
            })();
          }
        }}
      />
      {file && (
        <>
          <div className="flex flex-wrap gap-2">
            <span className="font-oswald text-xs uppercase">Presets</span>
            {([1.5, 2, 2.5, 3] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => apply(s)}
                className="btn-brutal btn-brutal-ghost px-2 py-1 text-xs font-oswald"
              >
                {s}×
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-oswald text-[10px] font-bold uppercase block">
                width px
              </label>
              <input
                type="number"
                min={1}
                className="input-brutal"
                value={w}
                onChange={(e) => setW(parseInt(e.target.value, 10) || 1)}
              />
            </div>
            <div>
              <label className="font-oswald text-[10px] font-bold uppercase block">
                height px
              </label>
              <input
                type="number"
                min={1}
                className="input-brutal"
                value={h}
                onChange={(e) => setH(parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>

          <ToolResultPanel
            show
            title="Scaled preview"
            preview={
              <div className="relative">
                {busy ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                    <Loader2 className="animate-spin" size={24} />
                  </div>
                ) : null}
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt=""
                    className="max-h-[420px] w-auto max-w-full border-[3px] border-black object-contain"
                  />
                ) : (
                  <span className="font-inter text-xs text-[#1a1a1a]/50 py-8">
                    Building preview…
                  </span>
                )}
              </div>
            }
            auxiliary={<span>Output size {w}×{h} px (PNG)</span>}
            actions={
              <button
                type="button"
                onClick={download}
                disabled={!previewDataUrl || busy}
                className="inline-flex items-center gap-2 btn-brutal btn-brutal-yellow disabled:opacity-40"
              >
                <Download size={16} />
                Download PNG
              </button>
            }
          />
        </>
      )}
    </div>
  );
}
