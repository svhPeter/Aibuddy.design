"use client";

import { useCallback, useId, useState } from "react";
import { Check, Copy, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  ProductDescriptionResult,
  ProductTone,
} from "@/lib/tools/product-description-server";

type ApiSuccess = { ok: true; result: ProductDescriptionResult };
type ApiErrorBody = { ok: false; error: string; code?: string };

const TONES: { value: ProductTone; label: string }[] = [
  { value: "luxury", label: "Luxury" },
  { value: "persuasive", label: "Persuasive" },
  { value: "clean", label: "Clean" },
  { value: "playful", label: "Playful" },
  { value: "premium", label: "Premium" },
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
  multiline,
}: {
  label: string;
  text: string;
  copiedKey: string | null;
  onCopied: (key: string) => void;
  copyId: string;
  multiline?: boolean;
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
      <p
        className={cn(
          "mt-2 text-pretty text-sm text-foreground",
          multiline ? "whitespace-pre-wrap" : "",
        )}
      >
        {text}
      </p>
    </div>
  );
}

export function ProductDescriptionForm() {
  const baseId = useId();
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState<ProductTone>("clean");
  const [keywords, setKeywords] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductDescriptionResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const runGenerate = useCallback(async () => {
    setError(null);
    setCopiedKey(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/tools/product-description-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName.trim(),
          category: category.trim(),
          tone,
          ...(keywords.trim() ? { keywords: keywords.trim() } : {}),
          ...(audience.trim() ? { audience: audience.trim() } : {}),
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
  }, [productName, category, tone, keywords, audience]);

  const onCopied = useCallback((key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
  }, []);

  const canRun = productName.trim().length >= 2 && category.trim().length >= 2;

  return (
    <div className="min-w-0 space-y-8">
      <div className="min-w-0 space-y-6 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
        <div>
          <label
            htmlFor={`${baseId}-name`}
            className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
          >
            Product name
          </label>
          <input
            id={`${baseId}-name`}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            maxLength={120}
            className="mt-3 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
          />
        </div>
        <div>
          <label
            htmlFor={`${baseId}-cat`}
            className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
          >
            Category / niche
          </label>
          <input
            id={`${baseId}-cat`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxLength={200}
            className="mt-3 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
          />
        </div>
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
            onChange={(e) => setTone(e.target.value as ProductTone)}
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
            htmlFor={`${baseId}-kw`}
            className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
          >
            Keywords (optional)
          </label>
          <input
            id={`${baseId}-kw`}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            maxLength={500}
            className="mt-3 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
          />
        </div>
        <div>
          <label
            htmlFor={`${baseId}-aud`}
            className="font-heading text-xs font-bold uppercase tracking-wide text-[#cafd00]"
          >
            Target audience (optional)
          </label>
          <input
            id={`${baseId}-aud`}
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            maxLength={300}
            className="mt-3 block w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cafd00]/50"
          />
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
                Generating…
              </>
            ) : (
              "Generate copy"
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
              Your product copy
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={loading}
              onClick={() => {
                const all = [
                  `Short\n${result.shortDescription}`,
                  "",
                  `Long\n${result.longDescription}`,
                  "",
                  `Bullets\n${result.bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}`,
                  "",
                  `CTA\n${result.cta}`,
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
          <CopyRow
            label="Short description"
            text={result.shortDescription}
            copiedKey={copiedKey}
            onCopied={onCopied}
            copyId="short"
          />
          <CopyRow
            label="Long description"
            text={result.longDescription}
            copiedKey={copiedKey}
            onCopied={onCopied}
            copyId="long"
            multiline
          />
          <div className="rounded-md border border-border bg-background/60 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Feature bullets
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
              {result.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 rounded-none"
              onClick={() => {
                void copyText(result.bullets.join("\n")).then((ok) => {
                  if (ok) onCopied("bullets");
                });
              }}
            >
              {copiedKey === "bullets" ? (
                <>
                  <Check className="mr-1 size-3.5" aria-hidden />
                  Copied bullets
                </>
              ) : (
                <>
                  <Copy className="mr-1 size-3.5" aria-hidden />
                  Copy bullets
                </>
              )}
            </Button>
          </div>
          <CopyRow
            label="CTA line"
            text={result.cta}
            copiedKey={copiedKey}
            onCopied={onCopied}
            copyId="cta"
          />
          <p className="text-xs text-muted-foreground">
            AI-generated copy — review for accuracy and compliance before publishing.
          </p>
        </div>
      ) : null}
    </div>
  );
}
