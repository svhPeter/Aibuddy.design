import { useState, useCallback } from "react";
import { fileToImage, downloadDataUrl } from "@/lib/image-tool-helpers";
import { Download } from "lucide-react";

export function ImageEnlargerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [w, setW] = useState(1600);
  const [h, setH] = useState(900);
  const [name, setName] = useState("export");

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

  const run = useCallback(() => {
    if (!file) return;
    void (async () => {
      const img = await fileToImage(file);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      downloadDataUrl(c.toDataURL("image/png"), `${name || "enlarged"}.png`);
    })();
  }, [file, w, h, name]);

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        Scales the image in-browser (bilinear). Very large files may feel slow — that
        is your device doing the work, not a server.
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
                className="btn-brutal border px-2 py-1 text-xs font-oswald"
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
          <button
            type="button"
            onClick={run}
            className="inline-flex items-center gap-2 btn-brutal btn-brutal-yellow"
          >
            <Download size={16} />
            download png
          </button>
        </>
      )}
    </div>
  );
}
