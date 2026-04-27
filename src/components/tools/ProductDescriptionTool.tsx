import { useMemo, useState, useCallback } from "react";
import { Copy } from "lucide-react";

export function ProductDescriptionTool() {
  const [name, setName] = useState("AIBuddy Project Hub");
  const [audience, setAudience] = useState("founder-led teams and indie studios");
  const [feats, setFeats] = useState("Fast scoping, honest delivery, design + code in one place");

  const { shortL, longL, bullets, cta } = useMemo(() => {
    const bl = feats
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      shortL: `Meet ${name} — for ${audience}. ${bl.slice(0, 2).join("; ")}. Built to ship.`,
      longL: `${name} is built for ${audience} who need clarity and speed. We combine product thinking with execution: ${bl.join(
        "; "
      )}. The goal is a calm build process and outcomes you can hand to users with confidence.`,
      bullets: bl.map((b) => `• ${b}.`),
      cta: `Ready to talk about ${name}? Open the inquiry on aibuddy.design and we will reply with next steps.`,
    };
  }, [name, audience, feats]);

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
          Product / offer name
        </label>
        <input
          className="input-brutal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
          Who it is for
        </label>
        <input
          className="input-brutal"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        />
      </div>
      <div>
        <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
          Key points (commas or new lines)
        </label>
        <textarea
          className="input-brutal min-h-[90px] resize-y"
          value={feats}
          onChange={(e) => setFeats(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {[
          { t: "Short (hero / ad)", body: shortL },
          { t: "Long (page / market)", body: longL },
          { t: "Feature bullets", body: bullets.join("\n") },
          { t: "CTA", body: cta },
        ].map((block) => (
          <div
            key={block.t}
            className="border-[3px] border-black p-3 bg-white flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-oswald text-xs font-bold uppercase">
                {block.t}
              </span>
              <button
                type="button"
                onClick={() => copy(block.body)}
                className="inline-flex items-center gap-1 text-[10px] font-oswald uppercase font-bold"
              >
                <Copy size={12} />
                copy
              </button>
            </div>
            <p className="font-inter text-sm leading-relaxed whitespace-pre-wrap">
              {block.body}
            </p>
          </div>
        ))}
      </div>
      {msg ? <p className="font-inter text-xs text-[#1a1a1a]/50">{msg}</p> : null}
    </div>
  );
}
