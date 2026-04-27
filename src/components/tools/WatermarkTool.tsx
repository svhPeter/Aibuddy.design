import { useState, useCallback } from "react";
import { fileToImage, imageToCanvas, downloadDataUrl } from "@/lib/image-tool-helpers";
import { Download } from "lucide-react";

const POS: Record<string, (cw: number, ch: number, m: number) => [number, number]> = {
  tl: (_w, _h, m) => [m, m + 18],
  tr: (w, _h, m) => [w - m - 10, m + 18],
  c: (w, h, _m) => [w / 2, h / 2],
  bl: (_w, h, m) => [m, h - m - 6],
  br: (w, h, m) => [w - m - 10, h - m - 6],
};

export function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("© aibuddy.design");
  const [pos, setPos] = useState<keyof typeof POS>("br");
  const [opacity, setOpacity] = useState(0.5);
  const [size, setSize] = useState(20);
  const [name, setName] = useState("watermarked");

  const run = useCallback(() => {
    if (!file) return;
    void (async () => {
      const img = await fileToImage(file);
      const c = imageToCanvas(img);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const m = 20;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = "#111";
      ctx.font = `bold ${size}px Inter, system-ui, sans-serif`;
      ctx.textBaseline = "middle";
      if (pos === "c") {
        ctx.textAlign = "center";
        ctx.fillText(
          text,
          POS.c(c.width, c.height, 0)[0],
          POS.c(c.width, c.height, 0)[1]
        );
      } else {
        ctx.textAlign = "left";
        const [x, y] = POS[pos](c.width, c.height, m);
        ctx.fillText(text, x, y);
      }
      ctx.restore();
      downloadDataUrl(
        c.toDataURL("image/png"),
        `${name || "watermark"}.png`
      );
    })();
  }, [file, text, pos, opacity, size, name]);

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        Add text on top. Use your own mark; for logos as image, we can add that in
        a later pass.
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
