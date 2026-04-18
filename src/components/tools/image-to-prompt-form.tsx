"use client";

import { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, ImagePlus, Loader2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResultPayload = {
  shortPrompt: string;
  detailedUniversalPrompt: string;
  negativePrompt: string | null;
  quickTags: string[];
};

type Phase = "idle" | "loading" | "done";

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
    <div className="rounded-lg border-2 border-border bg-card p-5 shadow-sm sm:p-6">
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
          "mt-4 text-sm leading-relaxed text-foreground/95",
          mono && "font-mono text-[0.8125rem] leading-relaxed",
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
};

export function ImageToPromptForm({
  whatsappHref,
  contactEmail,
}: ImageToPromptFormProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [result, setResult] = useState<ResultPayload | null>(null);

  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const onPick = useCallback(
    (f: File | null) => {
      clearPreview();
      setResult(null);
      setError(null);
      setCode(null);
      if (!f) {
        setFile(null);
        setPreviewUrl(null);
        return;
      }
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    },
    [clearPreview],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    setPhase("loading");
    setError(null);
    setCode(null);
    setResult(null);

    const body = new FormData();
    body.set("file", file);

    try {
      const res = await fetch("/api/tools/image-to-prompt", {
        method: "POST",
        body,
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
        setCode(typeof payload.code === "string" ? payload.code : null);
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
    } catch {
      setError("Network error. Check your connection and try again.");
      setPhase("idle");
    }
  }

  return (
    <div className="space-y-10">
      <form onSubmit={onSubmit} className="space-y-6">
        <div
          className={cn(
            "relative cursor-pointer rounded-lg border-2 border-dashed border-[#777575] bg-[#131313] p-8 text-center transition-colors hover:border-[#cafd00]/45",
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
          <div className="overflow-hidden rounded-lg border-2 border-border bg-black/40 p-4">
            <div className="relative mx-auto max-h-72 w-full max-w-lg">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview URL */}
              <img
                src={previewUrl}
                alt="Selected upload preview"
                className="mx-auto max-h-72 w-auto object-contain"
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button
            type="submit"
            disabled={!file || phase === "loading"}
            size="lg"
            className="rounded-none bg-[#cafd00] px-8 font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca]"
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
          <p className="text-xs text-muted-foreground">
            Runs on the server with Gemini — your API key stays private.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-lg border-2 border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <p className="font-medium">{error}</p>
            {code === "RATE_LIMIT" ? (
              <p className="mt-2 text-xs text-destructive/80">
                Free tier: limited generations per day per connection.
              </p>
            ) : null}
            {code === "NOT_CONFIGURED" ? (
              <p className="mt-2 text-xs text-destructive/80">
                The deployment needs GEMINI_API_KEY set on the server.
              </p>
            ) : null}
          </div>
        ) : null}
      </form>

      {result && phase === "done" ? (
        <div className="space-y-6">
          <CopyBlock label="Short prompt" text={result.shortPrompt} />
          <CopyBlock
            label="Detailed universal prompt"
            text={result.detailedUniversalPrompt}
          />
          {result.negativePrompt ? (
            <CopyBlock
              label="Optional negative prompt"
              text={result.negativePrompt}
              mono
            />
          ) : null}
          <div className="rounded-lg border-2 border-border bg-card p-5 shadow-sm sm:p-6">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
              Quick tags
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {result.quickTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-none border border-border bg-background/80 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground"
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
        </div>
      ) : null}

      <div className="border-t border-border pt-8">
        <p className="text-sm text-muted-foreground">
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
          <Link href="/services" className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}>
            Services
          </Link>
        </p>
      </div>
    </div>
  );
}
