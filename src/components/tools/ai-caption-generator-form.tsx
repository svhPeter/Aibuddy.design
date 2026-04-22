"use client";

import { useCallback, useId, useState } from "react";
import { Check, Copy, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  CaptionPlatform,
  CaptionResultPayload,
  CaptionTone,
} from "@/lib/tools/ai-caption-server";

type ApiSuccess = { ok: true; result: CaptionResultPayload };
type ApiErrorBody = { ok: false; error: string; code?: string };

const TONES: { value: CaptionTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "viral", label: "Viral" },
  { value: "luxury", label: "Luxury" },
  { value: "funny", label: "Funny" },
  { value: "minimal", label: "Minimal" },
];

const PLATFORMS: { value: CaptionPlatform; label: string }[] = [
  { value: "Instagram", label: "Instagram" },
  { value: "TikTok", label: "TikTok" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "X", label: "X" },
];

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyRow({
  label,
  text,
  copiedKey,
  onCopied,
  copyId,
}: {
  label: string;
  text: string;
  copiedKey: string | null;
  onCopied: (key: string) => void;
  copyId: string;
}) {
  const isCopied = copiedKey === copyId;
  return (
    <div className="min-w-0 rounded-md border border-border bg-background/60 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 rounded-none px-2 text-xs"
          onClick={() => {
            void copyText(text).then((ok) => {
              if (ok) onCopied(copyId);
            });
          }}
        >
          {isCopied ? (
            <>
              <Check className="mr-1 size-3.5" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 size-3.5" aria-hidden />
              Copy
            </>
          )}
        </Button>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-pretty text-sm text-foreground">{text}</p>
    </div>
  );
}

export function AiCaptionGeneratorForm() {
  const baseId = useId();
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState<CaptionTone>("professional");
  const [platform, setPlatform] = useState<CaptionPlatform>("Instagram");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CaptionResultPayload | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const runGenerate = useCallback(async () => {
    setError(null);
    setCopiedKey(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/tools/ai-caption-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim(),
          tone,
          platform,
          ...(keywords.trim() ? { keywords: keywords.trim() } : {}),
        }),
      });
      const data: ApiSuccess | ApiErrorBody = await res.json().catch(() => ({
        ok: false as const,
        error: "Invalid response from server.",
      }));

      if (!res.ok || !data.ok) {
        const msg =
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Generation failed.";
        setError(msg);
        return;
      }
      setResult(data.result);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [niche, tone, platform, keywords]);

  const onCopied = useCallback((key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
  }, []);

  const hashtagsLine = result
    ? result.hashtags.map((h) => `#${h.replace(/^#+/, "")}`).join(" ")
    : "";

  return (
    <div className="min-w-0 space-y-8">
      <div className="min-w-0 space-y-6 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
        <div>
          <label
            htmlFor={`${baseId}-niche`}
            className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
          >
            Niche or topic
          </label>
          <textarea
            id={`${baseId}-niche`}
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="e.g. sustainable skincare for busy parents"
            className="mt-3 block w-full resize-y rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
          />
          <p className="mt-1 text-xs text-muted-foreground">2–500 characters.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${baseId}-tone`}
              className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
            >
              Tone
            </label>
            <select
              id={`${baseId}-tone`}
              value={tone}
              onChange={(e) => setTone(e.target.value as CaptionTone)}
              className="mt-3 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={`${baseId}-platform`}
              className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
            >
              Platform
            </label>
            <select
              id={`${baseId}-platform`}
              value={platform}
              onChange={(e) => setPlatform(e.target.value as CaptionPlatform)}
              className="mt-3 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor={`${baseId}-kw`}
            className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
          >
            Optional keywords
          </label>
          <input
            id={`${baseId}-kw`}
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            maxLength={500}
            placeholder="e.g. launch week, free shipping, summer drop"
            className="mt-3 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            size="lg"
            disabled={loading || niche.trim().length < 2}
            className="w-full justify-center rounded-none bg-[#cafd00] px-6 font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca] sm:w-auto sm:px-8"
            onClick={() => void runGenerate()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Generating…
              </>
            ) : (
              "Generate captions"
            )}
          </Button>
          {result ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={loading || niche.trim().length < 2}
              className="w-full justify-center rounded-none sm:w-auto"
              onClick={() => void runGenerate()}
            >
              <RefreshCw className="mr-2 size-4" aria-hidden />
              Regenerate
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border-2 border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div
          className={cn(
            "min-w-0 space-y-4 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6",
            loading && "opacity-60",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
              Your captions
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={loading}
              onClick={() => {
                const all = [
                  ...result.captions.map((c, i) => `Option ${i + 1}\n${c}`),
                  "",
                  `CTA\n${result.cta}`,
                  "",
                  `Hashtags\n${hashtagsLine}`,
                ].join("\n\n");
                void copyText(all).then((ok) => {
                  if (ok) onCopied("all");
                });
              }}
            >
              {copiedKey === "all" ? (
                <>
                  <Check className="mr-1 size-3.5" aria-hidden />
                  Copied all
                </>
              ) : (
                <>
                  <Copy className="mr-1 size-3.5" aria-hidden />
                  Copy all
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {result.captions.map((c, i) => (
              <CopyRow
                key={i}
                label={`Caption ${i + 1}`}
                text={c}
                copiedKey={copiedKey}
                onCopied={onCopied}
                copyId={`cap-${i}`}
              />
            ))}
          </div>

          <CopyRow
            label="Short CTA"
            text={result.cta}
            copiedKey={copiedKey}
            onCopied={onCopied}
            copyId="cta"
          />

          <div className="min-w-0 rounded-md border border-border bg-background/60 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Hashtag suggestions
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 rounded-none px-2 text-xs"
                onClick={() => {
                  void copyText(hashtagsLine).then((ok) => {
                    if (ok) onCopied("tags");
                  });
                }}
              >
                {copiedKey === "tags" ? (
                  <>
                    <Check className="mr-1 size-3.5" aria-hidden />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 size-3.5" aria-hidden />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">
              {hashtagsLine}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Results are AI-generated. Edit before posting — brand voice and compliance are
            your responsibility.
          </p>
        </div>
      ) : null}
    </div>
  );
}
