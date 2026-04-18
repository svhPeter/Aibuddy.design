"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FieldState = {
  name: string;
  email: string;
  message: string;
};

const initial: FieldState = { name: "", email: "", message: "" };

const fieldClass =
  "mt-2 w-full rounded-lg border border-border bg-background/90 px-4 py-3 text-sm text-foreground shadow-inner outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40";

function buildMailtoHref(
  to: string,
  fields: FieldState,
): string {
  const subject = `AIBuddy inquiry from ${fields.name}`;
  const body = [
    `From: ${fields.name}`,
    `Reply-to: ${fields.email}`,
    "",
    fields.message,
  ].join("\n");
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString()}`;
}

type ContactFormProps = {
  className?: string;
  whatsappHref: string | null;
  studioEmail: string;
};

export function ContactForm({
  className,
  whatsappHref,
  studioEmail,
}: ContactFormProps) {
  const [fields, setFields] = useState<FieldState>(initial);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const href = buildMailtoHref(studioEmail, fields);
    window.location.href = href;
  }

  return (
    <div
      id="message-form"
      className={cn(
        "relative overflow-hidden rounded-lg border-2 border-border bg-card p-8 shadow-sm sm:p-10",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.72_0.18_195/0.1),transparent_65%)]"
      />
      <div className="relative">
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Send a message
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Draft in your own email app — nothing is sent from this website.
          {whatsappHref ? (
            <>
              {" "}
              For the fastest reply, use WhatsApp; otherwise continue below.
            </>
          ) : (
            <> Fill in the fields, then open your mail client with one click.</>
          )}
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              value={fields.name}
              onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
              className={fieldClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={fields.email}
              onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
              className={fieldClass}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="text-sm font-medium text-foreground"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={fields.message}
              onChange={(e) =>
                setFields((f) => ({ ...f, message: e.target.value }))
              }
              className={cn(fieldClass, "min-h-[140px] resize-y")}
              placeholder="Project context, timeline, links, or questions…"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto" size="lg">
            Continue in email app
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Opens <span className="font-mono text-[0.8125rem]">{studioEmail}</span>{" "}
            with your message pre-filled. If nothing opens, copy that address or{" "}
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                use WhatsApp
              </a>
            ) : (
              "copy the address and email manually"
            )}
            .
          </p>
        </form>
      </div>
    </div>
  );
}
