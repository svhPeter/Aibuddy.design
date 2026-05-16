import { ChevronUp, ChevronDown, Trash2, RotateCw } from "lucide-react";
import type { PageData } from "./types";

interface Props {
  pages: PageData[];
  active: number;
  setActive: (i: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onRotate: () => void;
}

export function ThumbnailSidebar({
  pages,
  active,
  setActive,
  onMoveUp,
  onMoveDown,
  onDelete,
  onRotate,
}: Props) {
  return (
    <div className="w-24 sm:w-32 shrink-0 border-r-[3px] border-black bg-[#1a1a1a] flex flex-col h-full">
      <div className="p-2 border-b-[3px] border-black flex flex-wrap gap-1 justify-center bg-[#2a2a2a]">
        <button type="button" onClick={onMoveUp} disabled={active === 0} title="Move up"
          className="p-1.5 hover:bg-[#F9FF00]/20 text-white disabled:opacity-30 rounded transition-colors">
          <ChevronUp size={14} />
        </button>
        <button type="button" onClick={onMoveDown} disabled={active >= pages.length - 1} title="Move down"
          className="p-1.5 hover:bg-[#F9FF00]/20 text-white disabled:opacity-30 rounded transition-colors">
          <ChevronDown size={14} />
        </button>
        <button type="button" onClick={onRotate} title="Rotate 90°"
          className="p-1.5 hover:bg-[#F9FF00]/20 text-white rounded transition-colors">
          <RotateCw size={14} />
        </button>
        <button type="button" onClick={onDelete} disabled={pages.length <= 1} title="Delete page"
          className="p-1.5 hover:bg-red-500/20 text-white disabled:opacity-30 rounded transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {pages.map((pg, i) => (
          <button key={i} type="button" onClick={() => setActive(i)}
            className={`block w-full p-1.5 transition-all outline-none focus:ring-2 focus:ring-[#F9FF00] ${i === active ? "bg-[#F9FF00] scale-105 shadow-lg z-10 relative" : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"}`}>
            <img src={pg.thumb} alt={`Page ${i + 1}`} 
                 className="w-full border border-black/30 bg-white"
                 style={{ transform: `rotate(${pg.rotation || 0}deg)` }} />
            <span className={`font-oswald text-[9px] font-bold uppercase tracking-wider mt-1.5 block text-center ${i === active ? "text-[#1a1a1a]" : "text-white/60"}`}>
              {i + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
