"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Copy, ImagePlus, Loader2 } from "lucide-react";

import type { UsageStatusPayload } from "@/lib/access/usage";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResultPayload = {
  shortPrompt: string;
  detailedUniversalPrompt: string;
  negativePrompt: string | null;
  quickTags: string[];
};

type Phase = "idle" | "loading" | "done";

/** Client-side ceiling for a generate request, in ms. */
const GENERATE_TIMEOUT_MS = 45_000;

function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error("Clipboard unavailable"));
}

type CopyBlockProps = {
  label: string;
  text: string;
  mono?: boolean;
};

function CopyBlock({ label, text, mono }: CopyBlockProps) {
  const [done, setDone] = useState(false);
  const disabled = !text.trim();

  async function onCopy() {
    if (disabled) return;
    try {
      await copyText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-w-0 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
          {label}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={onCopy}
          className="shrink-0 rounded-none border-border"
        >
          {done ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          <span className="ml-1.5">{done ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <p
        className={cn(
          "mt-4 min-w-0 break-words text-sm leading-relaxed text-foreground/95",
          mono &&
            "max-h-64 overflow-x-auto overflow-y-auto whitespace-pre-wrap font-mono text-[0.8125rem] leading-relaxed [overflow-wrap:anywhere]",
        )}
      >
        {text.trim() || "—"}
      </p>
    </div>
  );
}

type ImageToPromptFormProps = {
  whatsappHref: string | null;
  contactEmail: string;
  isAuthenticated: boolean;
  usage: UsageStatusPayload | null;
};

function isAtAiLimit(usage: UsageStatusPayload | null): boolean {
  if (!usage) return false;
  if (usage.tier === "guest") return false;
  return usage.ai.used >= usage.ai.limit;
}

function formatUsageLine(usage: UsageStatusPayload | null): string | null {
  if (!usage || usage.tier === "guest") return null;
  if (usage.tier === "free") {
    return `AI uses this month: ${usage.ai.used} / ${usage.ai.limit}`;
  }
  return `Pro · AI uses: ${usage.ai.used} / ${usage.ai.limit}`;
}

export function ImageToPromptForm({
  whatsappHref,
  contactEmail,
  isAuthenticated,
  usage,
}: ImageToPromptFormProps) {
  const inputId = useId();
  const pathname = usePathname();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultPayload | null>(null);

  const canGenerate = isAuthenticated && !isAtAiLimit(usage);

  // Revoke the blob: URL when it is replaced or when the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPick = useCallback((f: File | null) => {
    setResult(null);
    setError(null);
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const generate = useCallback(async (source: File) => {
    setPhase("loading");
    setError(null);
    setResult(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      GENERATE_TIMEOUT_MS,
    );

    const body = new FormData();
    body.set("file", source);

    try {
      const res = await fetch("/api/tools/image-to-prompt", {
        method: "POST",
        body,
        signal: controller.signal,
      });
      const data: unknown = await res.json().catch(() => null);
      const payload = data as {
        ok?: boolean;
        error?: string;
        code?: string;
        result?: ResultPayload;
      };

      if (!res.ok || !payload.ok) {
        setError(
          typeof payload.error === "string"
            ? payload.error
            : "Something went wrong.",
        );
        setPhase("idle");
        return;
      }

      if (payload.result) {
        setResult(payload.result);
        setPhase("done");
      } else {
        setError("Unexpected response.");
        setPhase("idle");
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("This is taking longer than usual. Please try again.");
      } else {
        setError("Network error. Check your connection and try again.");
      }
      setPhase("idle");
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    await generate(file);
  }

  // Signed-out gate — browse is fine, generation requires sign-in.
  if (!isAuthenticated) {
    const next = pathname || "/tools/image-to-prompt";
    return (
      <div className="min-w-0 space-y-8">
        <div className="rounded-lg border-2 border-border bg-card p-5 shadow-sm sm:p-8">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Sign in to generate
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in for a free account with monthly AI usage for this tool.
          </p>
          <div className="mt-5">
            <Link
              href={`/sign-in?next=${encodeURIComponent(next)}`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex w-full justify-center rounded-none bg-[#cafd00] px-6 font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca] sm:w-auto sm:px-8",
              )}
            >
              Sign in with Google
            </Link>
          </div>
        </div>
        <ContactFooter
          whatsappHref={whatsappHref}
          contactEmail={contactEmail}
        />
      </div>
    );
  }

  if (isAuthenticated && isAtAiLimit(usage)) {
    return (
      <div className="min-w-0 space-y-8">
        <div className="rounded-lg border-2 border-border bg-card p-5 shadow-sm sm:p-8">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Monthly AI limit reached
          </h2>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            You&apos;ve used your monthly allowance. Upgrade to Pro coming
            soon.
          </p>
          <div className="mt-5 flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="button"
              size="lg"
              disabled
              className="w-full rounded-none bg-[#cafd00]/40 font-heading text-xs font-bold uppercase tracking-widest text-[#516700]/60 sm:w-auto"
            >
              Upgrade (coming soon)
            </Button>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "inline-flex w-full justify-center rounded-none sm:w-auto",
              )}
            >
              Pricing
            </Link>
            <Link
              href="/account"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "inline-flex w-full justify-center rounded-none sm:w-auto",
              )}
            >
              Account
            </Link>
          </div>
        </div>
        <ContactFooter
          whatsappHref={whatsappHref}
          contactEmail={contactEmail}
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-10">
      <form onSubmit={onSubmit} className="space-y-6">
        <div
          className={cn(
            "relative min-h-[10.5rem] cursor-pointer rounded-lg border-2 border-dashed border-[#777575] bg-[#131313] px-4 py-6 text-center transition-colors hover:border-[#cafd00]/45 sm:min-h-0 sm:p-8",
            phase === "loading" && "pointer-events-none opacity-60",
          )}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          <ImagePlus
            className="mx-auto size-10 text-[#cafd00]"
            strokeWidth={1.25}
            aria-hidden
          />
          <p className="mt-3 font-heading text-sm font-bold uppercase tracking-widest text-white">
            Upload image
          </p>
          <p className="mt-2 text-xs text-stitch-muted">
            JPG, PNG, or WebP · max 4 MB · one file
          </p>
        </div>

        {previewUrl && file ? (
          <div className="min-w-0 overflow-hidden rounded-lg border-2 border-border bg-black/40 p-3 sm:p-4">
            <div className="relative mx-auto max-h-[min(50vh,18rem)] w-full max-w-lg sm:max-h-72">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview URL */}
              <img
                src={previewUrl}
                alt="Selected upload preview"
                className="mx-auto max-h-[min(50vh,18rem)] w-auto max-w-full object-contain sm:max-h-72"
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onPick(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            type="submit"
            disabled={!file || phase === "loading" || !canGenerate}
            size="lg"
            className="w-full justify-center rounded-none bg-[#cafd00] px-6 font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca] sm:w-auto sm:px-8"
          >
            {phase === "loading" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Generating…
              </>
            ) : (
              "Generate prompts"
            )}
          </Button>
          {formatUsageLine(usage) ? (
            <p className="text-balance text-center text-xs text-muted-foreground sm:text-left">
              {formatUsageLine(usage)}
            </p>
          ) : null}
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-lg border-2 border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <p className="font-medium">{error}</p>
          </div>
        ) : null}
      </form>

      {result && phase === "done" ? (
        <div className="min-w-0 space-y-6">
          <CopyBlock label="Short prompt" text={result.shortPrompt} />
          <CopyBlock
            label="Detailed prompt"
            text={result.detailedUniversalPrompt}
          />
          {result.negativePrompt ? (
            <CopyBlock
              label="Negative prompt"
              text={result.negativePrompt}
              mono
            />
          ) : null}
          <div className="min-w-0 rounded-lg border-2 border-border bg-card p-4 shadow-sm sm:p-6">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
              Tags
            </h3>
            <div className="mt-4 flex min-w-0 flex-wrap gap-2">
              {result.quickTags.map((tag) => (
                <span
                  key={tag}
                  className="max-w-full break-words rounded-none border border-border bg-background/80 px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 rounded-none"
              onClick={() => {
                copyText(result.quickTags.join(", ")).catch(() => {});
              }}
            >
              <Copy className="size-4" aria-hidden />
              <span className="ml-1.5">Copy tags</span>
            </Button>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={!file || !canGenerate}
              onClick={() => {
                if (file && canGenerate) void generate(file);
              }}
            >
              Generate again
            </Button>
          </div>
        </div>
      ) : null}

      <ContactFooter whatsappHref={whatsappHref} contactEmail={contactEmail} />
    </div>
  );
}

type ContactFooterProps = {
  whatsappHref: string | null;
  contactEmail: string;
};

function ContactFooter({ whatsappHref, contactEmail }: ContactFooterProps) {
  return (
    <div className="min-w-0 border-t border-border pt-8">
      <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
        Need something custom-built?{" "}
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#cafd00] underline-offset-4 hover:underline"
          >
            WhatsApp
          </a>
        ) : (
          <Link
            href="/contact"
            className="font-medium text-[#cafd00] underline-offset-4 hover:underline"
          >
            Contact
          </Link>
        )}{" "}
        or{" "}
        <a
          href={`mailto:${contactEmail}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          email
        </a>{" "}
        ·{" "}
        <Link
          href="/services"
          className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}
        >
          Services
        </Link>
      </p>
    </div>
  );
}
