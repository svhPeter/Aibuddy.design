import { cn } from "@/lib/utils";

type FaqItem = { q: string; a: string };

type ToolFaqProps = {
  items: FaqItem[];
  className?: string;
};

export function ToolFaq({ items, className }: ToolFaqProps) {
  if (items.length === 0) return null;
  return (
    <div
      className={cn(
        "rounded-lg border-2 border-border bg-card/40 p-4 shadow-sm sm:p-6",
        className,
      )}
    >
      <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
        Help &amp; FAQ
      </h2>
      <dl className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.q}>
            <dt className="text-sm font-medium text-foreground">{item.q}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
