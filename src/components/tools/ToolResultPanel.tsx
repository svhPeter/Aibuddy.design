import type { ReactNode } from "react";

type ToolResultPanelProps = {
  /** When false, panel is not rendered. */
  show: boolean;
  title?: string;
  preview: ReactNode;
  auxiliary?: ReactNode;
  actions?: ReactNode;
};

/**
 * iloveimg-style result strip: preview region + optional meta + download row.
 * Uses existing brutal borders; no new tokens.
 */
export function ToolResultPanel({
  show,
  title = "Preview",
  preview,
  auxiliary,
  actions,
}: ToolResultPanelProps) {
  if (!show) return null;

  return (
    <div className="border-[3px] border-black mt-6">
      <div className="flex items-center justify-between border-b-[3px] border-black px-4 py-2 bg-[#fafafa]">
        <span className="font-oswald text-xs font-bold uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="max-h-[min(70vh,520px)] overflow-auto bg-[#f5f5f5] p-4 flex justify-center items-start min-h-[120px]">
        {preview}
      </div>
      {auxiliary ? (
        <div className="border-t-[3px] border-black px-4 py-3 bg-white font-inter text-xs text-[#1a1a1a]/80">
          {auxiliary}
        </div>
      ) : null}
      {actions ? (
        <div className="border-t-[3px] border-black px-4 py-3 bg-white flex flex-wrap items-center gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
