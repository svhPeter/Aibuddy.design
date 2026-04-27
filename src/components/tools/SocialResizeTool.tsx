import { useState, useCallback } from "react";
import { fileToImage, scaleCanvas, downloadDataUrl } from "@/lib/image-tool-helpers";
import { Download } from "lucide-react";

const PRESETS = [
  { id: "ig", label: "IG square 1080", w: 1080, h: 1080 },
  { id: "igstory", label: "Story 1080×1920", w: 1080, h: 1920 },
  { id: "li", label: "Link / X card 1200×628", w: 1200, h: 628 },
  { id: "hd", label: "HD 1920×1080", w: 1920, h: 1080 },
] as const;

export function SocialResizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>(PRESETS[0]);
  const [mode, setMode] = useState<"cover" | "contain">("cover");
  const [name, setName] = useState("social");

  const run = useCallback(() => {
    if (!file) return;
    void (async () => {
      const img = await fileToImage(file);
      const c = scaleCanvas(img, preset.w, preset.h, mode);
      downloadDataUrl(
        c.toDataURL("image/png"),
        `${name || "social"}-${preset.id}.png`
      );
    })();
  }, [file, preset, mode, name]);

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        <strong>Cover</strong> fills the frame and crops. <strong>Contain</strong>{" "}
        letterboxes to fit.
      </p>
      <input
        type="file"
        accept="image/*"
        className="input-brutal p-2 text-xs"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setFile(f);
          if (f) setName(f.name.replace(/\.[^.]+$/, "") || "social");
        }}
      />
      {file && (
        <>
          <div className="space-y-0 border-[3px] border-black">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p)}
                className={`w-full text-left px-3 py-2 font-inter text-xs border-b border-black last:border-b-0 ${
                  preset.id === p.id ? "bg-[#F9FF00]" : "hover:bg-[#fafafa]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div>
            <label className="font-oswald text-xs font-bold uppercase block mb-1">
              Fit
            </label>
            <select
              className="input-brutal"
              value={mode}
              onChange={(e) => setMode(e.target.value as "cover" | "contain")}
            >
              <option value="cover">Cover (fill + crop)</option>
              <option value="contain">Contain (no crop, white padding)</option>
            </select>
          </div>
          <button
            type="button"
            onClick={run}
            className="inline-flex items-center gap-2 btn-brutal btn-brutal-yellow"
          >
            <Download size={16} />
            download {preset.w}×{preset.h} png
          </button>
        </>
      )}
    </div>
  );
}
