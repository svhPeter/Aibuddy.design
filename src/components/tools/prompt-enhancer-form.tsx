"use client";

import { useCallback, useId, useState } from "react";
import { Check, Copy, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  PromptCreativity,
  PromptEnhancerResult,
  PromptStyleTarget,
} from "@/lib/tools/prompt-enhancer-server";

type ApiSuccess = { ok: true; result: PromptEnhancerResult };
type ApiErrorBody = { ok: false; error: string; code?: string };

const STYLES: { value: PromptStyleTarget; label: string }[] = [
  { value: "Midjourney", label: "Midjourney" },
  { value: "Flux", label: "Flux" },
  { value: "SDXL", label: "SDXL" },
  { value: "Realistic Photo", label: "Realistic Photo" },
  { value: "Cinematic", label: "Cinematic" },
  { value: "Ecommerce Product", label: "Ecommerce Product" },
];

const CREATIVITY: { value: PromptCreativity; label: string }[] = [
  { value: "conservative", label: "Conservative" },
  { value: "balanced", label: "Balanced" },
  { value: "bold", label: "Bold" },
];

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function PromptEnhancerForm() {
  const baseId = useId();
  const [rawPrompt, setRawPrompt] = useState("");
  const [styleTarget, setStyleTarget] =
    useState<PromptStyleTarget>("Midjourney");
  const [creativity, setCreativity] = useState<PromptCreativity>("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PromptEnhancerResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const runGenerate = useCallback(async () => {
    setError(null);
    setCopiedKey(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/tools/prompt-enhancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawPrompt: rawPrompt.trim(),
          styleTarget,
          creativity,
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
  }, [rawPrompt, styleTarget, creativity]);

  const onCopied = useCallback((key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
  }, []);

  const tagsLine = result?.tags.join(", ") ?? "";
  const canRun = rawPrompt.trim().length >= 10;

  return (
    <div className="min-w-0 space-y-8">
      <div className="min-w-0 space-y-6 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
        <div>
          <label
            htmlFor={`${baseId}-raw`}
            className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
          >
            Your prompt
          </label>
          <textarea
            id={`${baseId}-raw`}
            value={rawPrompt}
            onChange={(e) => setRawPrompt(e.target.value)}
            rows={6}
            maxLength={8000}
            placeholder="Describe the scene, subject, lighting, or style you want…"
            className="mt-3 block w-full resize-y rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
          />
          <p className="mt-1 text-xs text-muted-foreground">10–8000 characters.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${baseId}-style`}
              className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
            >
              Style target
            </label>
            <select
              id={`${baseId}-style`}
              value={styleTarget}
              onChange={(e) =>
                setStyleTarget(e.target.value as PromptStyleTarget)
              }
              className="mt-3 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
            >
              {STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={`${baseId}-cr`}
              className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
            >
              Creativity
            </label>
            <select
              id={`${baseId}-cr`}
              value={creativity}
              onChange={(e) =>
                setCreativity(e.target.value as PromptCreativity)
              }
              className="mt-3 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
            >
              {CREATIVITY.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            size="lg"
            disabled={loading || !canRun}
            className="w-full justify-center rounded-none bg-[#cafd00] px-6 font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca] sm:w-auto sm:px-8"
            onClick={() => void runGenerate()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Enhancing…
              </>
            ) : (
              "Enhance prompt"
            )}
          </Button>
          {result ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={loading || !canRun}
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
              Enhanced output
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={loading}
              onClick={() => {
                const all = [
                  `Prompt\n${result.prompt}`,
                  "",
                  `Negative\n${result.negativePrompt || "(none)"}`,
                  "",
                  `Tags\n${tagsLine}`,
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
          <div className="min-w-0 rounded-md border border-border bg-background/60 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Improved prompt
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-none px-2 text-xs"
                onClick={() => {
                  void copyText(result.prompt).then((ok) => {
                    if (ok) onCopied("p");
                  });
                }}
              >
                {copiedKey === "p" ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <Copy className="size-3.5" aria-hidden />
                )}
              </Button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-pretty text-sm text-foreground">
              {result.prompt}
            </p>
          </div>
          <div className="min-w-0 rounded-md border border-border bg-background/60 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Negative prompt
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-none px-2 text-xs"
                onClick={() => {
                  void copyText(result.negativePrompt).then((ok) => {
                    if (ok) onCopied("n");
                  });
                }}
              >
                {copiedKey === "n" ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <Copy className="size-3.5" aria-hidden />
                )}
              </Button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
              {result.negativePrompt ? (
                result.negativePrompt
              ) : (
                <span className="text-muted-foreground">— None suggested —</span>
              )}
            </p>
          </div>
          <div className="min-w-0 rounded-md border border-border bg-background/60 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Tags
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-none px-2 text-xs"
                onClick={() => {
                  void copyText(tagsLine).then((ok) => {
                    if (ok) onCopied("t");
                  });
                }}
              >
                {copiedKey === "t" ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <Copy className="size-3.5" aria-hidden />
                )}
              </Button>
            </div>
            <p className="mt-2 text-sm text-foreground">{tagsLine}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Outputs are suggestions — verify against your generator’s best practices.
          </p>
        </div>
      ) : null}
    </div>
  );
}
