import { useState, useCallback } from "react";
import { Wand2, Copy } from "lucide-react";

function buildEnhanced(raw: string) {
  const t = raw.trim() || "your subject here";
  const main = `High-quality ${t}, sharp focus, clean composition, professional lighting, balanced color, detailed textures, coherent design, 8k, masterpiece, best quality`;
  const negative = `low quality, worst quality, jpeg artifacts, blurry, cropped, deformed, watermark, text overlay, disfigured, out of frame, duplicate, mutilated, kitsch, oversaturated`;
  const tags = `masterpiece, best quality, highly detailed, 8k uhd, photorealistic, ${t
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 8)
    .join(", ")}`.trim();
  return { main, negative, tags };
}

export function PromptEnhancerTool() {
  const [rough, setRough] = useState(
    "a product hero for a fintech app, clean and minimal, glass UI"
  );
  const { main, negative, tags } = buildEnhanced(rough);
  const [msg, setMsg] = useState("");

  const copy = useCallback((text: string) => {
    void navigator.clipboard.writeText(text).then(
      () => {
        setMsg("Copied.");
        setTimeout(() => setMsg(""), 2000);
      },
      () => setMsg("Copy failed")
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
          Your rough idea
        </label>
        <textarea
          className="input-brutal min-h-[100px] resize-y"
          value={rough}
          onChange={(e) => setRough(e.target.value)}
        />
        <p className="font-inter text-[11px] text-[#1a1a1a]/50 mt-1">
          Runs in your browser. Copy any block below into your model (SD, Midjourney,
          etc.).
        </p>
      </div>

      <div className="space-y-4">
        {[
          { k: "Polished main prompt", v: main },
          { k: "Negative / avoid", v: negative },
          { k: "Tag line", v: tags },
        ].map(({ k, v }) => (
          <div key={k} className="border-[3px] border-black p-3 bg-white">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-oswald text-xs font-bold uppercase">
                {k}
              </span>
              <button
                type="button"
                onClick={() => copy(v)}
                className="inline-flex items-center gap-1 font-oswald text-[10px] uppercase font-bold border-[2px] border-black px-2 py-1 bg-[#F9FF00] hover:opacity-90"
              >
                <Copy size={12} />
                copy
              </button>
            </div>
            <p className="font-inter text-xs leading-relaxed whitespace-pre-wrap break-words">
              {v}
            </p>
          </div>
        ))}
      </div>

      <p className="font-inter text-xs text-[#1a1a1a]/60 flex items-center gap-2">
        <Wand2 size={16} className="shrink-0" />
        {msg}
      </p>
    </div>
  );
}
