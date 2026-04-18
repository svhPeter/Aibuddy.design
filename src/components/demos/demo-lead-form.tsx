"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Field = {
  id: string;
  label: string;
  type: "text" | "tel" | "email" | "textarea";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
};

type DemoLeadFormProps = {
  id: string;
  title: string;
  description: string;
  fields: readonly Field[];
  submitLabel: string;
  /** Shown after submit — demo only */
  successMessage: string;
  className?: string;
};

export function DemoLeadForm({
  id,
  title,
  description,
  fields,
  submitLabel,
  successMessage,
  className,
}: DemoLeadFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-border/80 bg-background/90 px-3 py-2.5 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring/50";

  return (
    <section
      id={id}
      className={cn(
        "rounded-2xl border border-border/70 bg-gradient-to-b from-card to-muted/15 p-6 shadow-sm sm:p-8 dark:to-muted/10",
        className,
      )}
      aria-labelledby={`${id}-heading`}
    >
      <h2
        id={`${id}-heading`}
        className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
      >
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {submitted ? (
        <p
          className="mt-6 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          {successMessage}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {fields.map((field) => (
            <div key={field.id}>
              <label
                htmlFor={`${id}-${field.id}`}
                className="text-sm font-medium text-foreground"
              >
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={`${id}-${field.id}`}
                  name={field.id}
                  required={field.required !== false}
                  rows={4}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  className={cn(fieldClass, "min-h-[100px] resize-y")}
                />
              ) : (
                <input
                  id={`${id}-${field.id}`}
                  name={field.id}
                  type={field.type}
                  required={field.required !== false}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  className={fieldClass}
                />
              )}
            </div>
          ))}
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            {submitLabel}
          </Button>
          <p className="text-xs text-muted-foreground">
            Demonstration only — nothing is stored or sent to a server.
          </p>
        </form>
      )}
    </section>
  );
}
