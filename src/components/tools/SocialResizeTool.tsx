import { useState, useCallback, useEffect } from "react";
import { fileToImage, scaleCanvas, downloadDataUrl } from "@/lib/image-tool-helpers";
import { ToolResultPanel } from "@/components/tools/ToolResultPanel";
import { Loader2, Download } from "lucide-react";

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
        const img = await fileToImage(file);
        const c = scaleCanvas(img, preset.w, preset.h, mode);
        const url = c.toDataURL("image/png");
        if (!cancelled) setPreviewDataUrl(url);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, preset, mode]);

  const download = useCallback(() => {
    if (!previewDataUrl) return;
    downloadDataUrl(
      previewDataUrl,
      `${name || "social"}-${preset.id}.png`
    );
  }, [previewDataUrl, name, preset.id]);

  return (
    <div className="space-y-4">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        <strong>Cover</strong> fills the frame and crops. <strong>Contain</strong>{" "}
        letterboxes to fit. Preview matches download.
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

          <ToolResultPanel
            show
            title="Resize preview"
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
            auxiliary={
              <span>
                {preset.w}×{preset.h} px PNG — {mode === "cover" ? "cover" : "contain"}
              </span>
            }
            actions={
              <button
                type="button"
                onClick={download}
                disabled={!previewDataUrl || busy}
                className="inline-flex items-center gap-2 btn-brutal btn-brutal-yellow disabled:opacity-40"
              >
                <Download size={16} />
                Download {preset.w}×{preset.h} PNG
              </button>
            }
          />
        </>
      )}
    </div>
  );
}
