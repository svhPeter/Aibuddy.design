import { useMemo, useState, useCallback } from "react";
import { Copy } from "lucide-react";

const TONES: Record<string, (topic: string) => string> = {
  "Friendly + punchy": (t) =>
    `✨ ${t} — the upgrade you have been looking for. Tap in and let’s go.`,
  "Professional (LinkedIn)": (t) =>
    `Sharing our latest on ${t}: a focused, practical update for teams who care about outcomes.`,
  "Hook first (short video)": (t) =>
    `Stop scrolling — ${t} in 30 seconds. You will wish you had this earlier.`,
  "Minimal (X)": (t) => `${t}. That’s the tweet.`,
};

const CTA_BY: Record<keyof typeof TONES, string> = {
  "Friendly + punchy": 'CTA: Save this post. DM "READY" to start.',
  "Professional (LinkedIn)": 'CTA: Comment "GUIDE" and we will follow up.',
  "Hook first (short video)": "CTA: Link in bio — sound on.",
  "Minimal (X)": "CTA: aibuddy.design",
};

export function AiCaptionTool() {
  const [topic, setTopic] = useState("a new design workflow for product teams");
  const [platform, setPlatform] = useState<keyof typeof TONES>(
    "Friendly + punchy"
  );
  const lines = useMemo(() => {
    const tag = topic
      .replace(/[^\p{L}\p{N}]+/gu, "")
      .slice(0, 20)
      .toLowerCase();
    return [
      TONES[platform](topic),
      CTA_BY[platform],
      `#aibuddy #${tag || "build"} #design #buildinpublic`,
    ];
  }, [platform, topic]);

  const [msg, setMsg] = useState("");

  const copyAll = useCallback(() => {
    void navigator.clipboard.writeText(lines.join("\n\n")).then(
      () => {
        setMsg("Copied all.");
        setTimeout(() => setMsg(""), 2000);
      },
      () => setMsg("Copy failed")
    );
  }, [lines]);

  return (
    <div className="space-y-6">
      <p className="font-inter text-sm text-[#1a1a1a]/70">
        Quick captions for different tones. Choose a style, tweak the topic, then
        copy the full set.
      </p>
      <div>
        <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
          Topic
        </label>
        <input
          className="input-brutal"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
      <div>
        <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
          Style
        </label>
        <div className="space-y-0 border-[3px] border-black">
          {(Object.keys(TONES) as (keyof typeof TONES)[]).map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => setPlatform(k)}
              className={`w-full text-left px-3 py-2 font-inter text-xs border-b-[3px] border-black last:border-b-0 ${
                platform === k ? "bg-[#F9FF00]" : "bg-white hover:bg-[#fafafa]"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div className="border-[3px] border-black p-4 space-y-3">
        {lines.map((l, i) => (
          <p key={i} className="font-inter text-sm leading-relaxed">
            {l}
          </p>
        ))}
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex items-center gap-2 btn-brutal btn-brutal-black text-xs py-2"
        >
          <Copy size={14} />
          copy all
        </button>
        {msg ? (
          <p className="font-inter text-xs text-[#1a1a1a]/50">{msg}</p>
        ) : null}
      </div>
      <p className="font-inter text-[11px] text-[#1a1a1a]/50">
        Template-based captions in your browser. Tune the topic, copy, and edit
        before you post.
      </p>
    </div>
  );
}
