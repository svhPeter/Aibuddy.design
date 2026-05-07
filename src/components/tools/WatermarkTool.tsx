import { useState, useCallback, useEffect } from "react";
import {
  fileToImage,
  imageToCanvas,
  downloadDataUrl,
} from "@/lib/image-tool-helpers";
import { ToolResultPanel } from "@/components/tools/ToolResultPanel";
import { Loader2, Download } from "lucide-react";

const POS: Record<
  string,
  (cw: number, ch: number, m: number) => [number, number]
> = {
  tl: (_w, _h, m) => [m, m + 18],
  tr: (w, _h, m) => [w - m - 10, m + 18],
  c: (w, h, _m) => [w / 2, h / 2],
  bl: (_w, h, m) => [m, h - m - 6],
  br: (w, h, m) => [w - m - 10, h - m - 6],
};

function applyWatermarkToCanvas(
  file: File,
  text: string,
  pos: keyof typeof POS,
  opacity: number,
  size: number
): Promise<HTMLCanvasElement> {
  return (async () => {
    const img = await fileToImage(file);
    const c = imageToCanvas(img);
    const ctx = c.getContext("2d");
    if (!ctx) return c;
    const m = 20;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = "#111";
    ctx.font = `bold ${size}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = "middle";
    if (pos === "c") {
      ctx.textAlign = "center";
      ctx.fillText(text, POS.c(c.width, c.height, 0)[0], POS.c(c.width, c.height, 0)[1]);
    } else {
      ctx.textAlign = "left";
      const [x, y] = POS[pos](c.width, c.height, m);
      ctx.fillText(text, x, y);
    }
    ctx.restore();
    return c;
  })();
}

export function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("© aibuddy.design");
  const [pos, setPos] = useState<keyof typeof POS>("br");
  const [opacity, setOpacity] = useState(0.5);
  const [size, setSize] = useState(20);
  const [name, setName] = useState("watermarked");
  const [busy, setBusy] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewDataUrl(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const c = await applyWatermarkToCanvas(file, text, pos, opacity, size);
        const url = c.toDataURL("image/png");
        if (!cancelled) setPreviewDataUrl(url);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, text, pos, opacity, size]);

  const download = useCallback(async () => {
    if (!file) return;
    const c = await applyWatermarkToCanvas(file, text, pos, opacity, size);
    downloadDataUrl(c.toDataURL("image/png"), `${name || "watermark"}.png`);
  }, [file, text, pos, opacity, size, name]);

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        Add text on top — preview matches the PNG you download.
      </p>
      <input
        type="file"
        accept="image/*"
        className="input-brutal p-2 text-xs"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setFile(f);
          if (f) setName(f.name.replace(/\.[^.]+$/, "") || "watermarked");
        }}
      />
      {file && (
        <>
          <input
            className="input-brutal"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Watermark text"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-oswald text-[10px] uppercase">Position</label>
              <select
                className="input-brutal w-full"
                value={pos}
                onChange={(e) => setPos(e.target.value as keyof typeof POS)}
              >
                {Object.keys(POS).map((k) => (
                  <option key={k} value={k}>
                    {k.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-oswald text-[10px] uppercase">
                Opacity {Math.round(opacity * 100)}%
              </label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="font-oswald text-[10px] uppercase">Font px</label>
              <input
                type="number"
                className="input-brutal"
                min={8}
                max={120}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value, 10) || 20)}
              />
            </div>
          </div>

          <ToolResultPanel
            show
            title="Watermark preview"
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
            actions={
              <button
                type="button"
                onClick={() => void download()}
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
