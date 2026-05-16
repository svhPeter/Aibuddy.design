import {
  MousePointer2, Type, Pen, Highlighter, ImagePlus, Eraser, AlertOctagon,
  Undo2, Redo2, ZoomIn, ZoomOut, Download, RotateCcw, Plus, Scissors
} from "lucide-react";
import type { EditorTool } from "./types";

interface Props {
  tool: EditorTool;
  setTool: (t: EditorTool) => void;
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onExport: () => void;
  onMerge: () => void;
  onSplit: () => void;
  isProcessing: boolean;
}

export function EditorToolbar({
  tool, setTool, zoom, setZoom,
  canUndo, canRedo, onUndo, onRedo,
  onReset, onExport, onMerge, onSplit, isProcessing
}: Props) {
  const Tb = ({ id, icon: Ic, label }: { id: EditorTool; icon: typeof Pen; label: string }) => (
    <button type="button" onClick={() => setTool(id)} title={label} aria-label={label}
      className={`p-2 border-[3px] border-black transition-colors ${tool === id ? "bg-[#F9FF00] text-[#1a1a1a] z-10" : "bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a]"}`}>
      <Ic size={15} />
    </button>
  );

  return (
    <div className="border-[3px] border-black bg-[#1a1a1a] p-1.5 flex flex-wrap items-center gap-0.5 shadow-md z-20 relative">
      <Tb id="select" icon={MousePointer2} label="Select/Move" />
      <Tb id="text" icon={Type} label="Add text" />
      <Tb id="draw" icon={Pen} label="Draw / Sign" />
      <Tb id="highlight" icon={Highlighter} label="Highlight" />
      <Tb id="image" icon={ImagePlus} label="Add image" />
      <Tb id="whiteout" icon={Eraser} label="Whiteout" />
      <Tb id="redact" icon={AlertOctagon} label="Redact (Blackout)" />
      
      <div className="w-px h-7 bg-white/20 mx-1" />
      
      <button type="button" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)"
        className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] disabled:opacity-30 transition-colors">
        <Undo2 size={15} />
      </button>
      <button type="button" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)"
        className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] disabled:opacity-30 transition-colors">
        <Redo2 size={15} />
      </button>

      <div className="w-px h-7 bg-white/20 mx-1" />
      
      <button type="button" onClick={onMerge} title="Merge PDF"
        className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] transition-colors">
        <Plus size={15} />
      </button>
      <button type="button" onClick={onSplit} title="Split/Extract"
        className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] transition-colors">
        <Scissors size={15} />
      </button>

      <div className="w-px h-7 bg-white/20 mx-1" />

      <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} title="Zoom out"
        className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] transition-colors">
        <ZoomOut size={15} />
      </button>
      <span className="font-oswald text-[10px] font-bold uppercase tracking-wider text-white px-2 min-w-[3rem] text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.25))} title="Zoom in"
        className="p-2 border-[3px] border-black bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a] transition-colors">
        <ZoomIn size={15} />
      </button>

      <div className="flex-1" />

      <button type="button" onClick={onReset} title="Reset project"
        className="p-2 border-[3px] border-black bg-white hover:bg-red-50 text-[#1a1a1a] transition-colors mr-2">
        <RotateCcw size={15} />
      </button>
      <button type="button" onClick={onExport} disabled={isProcessing}
        className="btn-brutal btn-brutal-yellow inline-flex items-center gap-1.5 py-1 px-4 text-xs disabled:opacity-50">
        <Download size={14} /> Export PDF
      </button>
    </div>
  );
}
