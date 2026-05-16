import type { EditorTool } from "./types";

interface Props {
  tool: EditorTool;
  textVal: string;
  setTextVal: (v: string) => void;
  textSz: number;
  setTextSz: (s: number) => void;
  color: string;
  setColor: (c: string) => void;
  onClearStrokes: () => void;
}

export function PropertiesPanel({
  tool, textVal, setTextVal, textSz, setTextSz, color, setColor, onClearStrokes
}: Props) {
  if (tool === "select") {
    return (
      <div className="w-48 shrink-0 border-l-[3px] border-black bg-white p-3">
        <h3 className="font-oswald text-[10px] font-bold uppercase tracking-wider mb-2">Properties</h3>
        <p className="font-inter text-[10px] text-[#1a1a1a]/50">Select an object to edit its properties.</p>
      </div>
    );
  }

  return (
    <div className="w-48 shrink-0 border-l-[3px] border-black bg-[#fafafa] p-3 flex flex-col gap-4">
      <h3 className="font-oswald text-[10px] font-bold uppercase tracking-wider">
        {tool.toUpperCase()} Options
      </h3>

      {(tool === "text" || tool === "whiteout") && (
        <div>
          <label className="font-oswald text-[9px] font-bold uppercase tracking-[0.1em] block mb-1">Text Overlay</label>
          <input className="input-brutal w-full text-xs" value={textVal} onChange={e => setTextVal(e.target.value)} 
                 placeholder={tool === "whiteout" ? "Optional replacement text..." : "Type text..."} />
        </div>
      )}

      {(tool === "text" || tool === "whiteout") && (
        <div>
          <label className="font-oswald text-[9px] font-bold uppercase tracking-[0.1em] block mb-1">Size</label>
          <input type="number" className="input-brutal w-full text-xs" value={textSz} min={8} max={72} 
                 onChange={e => setTextSz(+e.target.value || 16)} />
        </div>
      )}

      {(tool === "text" || tool === "draw" || tool === "whiteout") && (
        <div>
          <label className="font-oswald text-[9px] font-bold uppercase tracking-[0.1em] block mb-1">Color</label>
          <input type="color" className="w-full h-[30px] border-[3px] border-black cursor-pointer" 
                 value={color} onChange={e => setColor(e.target.value)} />
        </div>
      )}

      {tool === "draw" && (
        <button type="button" onClick={onClearStrokes}
          className="btn-brutal btn-brutal-ghost text-[10px] py-1 px-2 mt-2 w-full">
          Clear Page Strokes
        </button>
      )}

      {tool === "whiteout" && (
        <p className="font-inter text-[9px] text-[#1a1a1a]/50 mt-2">
          Click and drag over the PDF to draw a white cover. If text is entered above, it will be placed over the whiteout block.
        </p>
      )}

      {tool === "redact" && (
        <p className="font-inter text-[9px] text-[#1a1a1a]/50 mt-2">
          Click and drag over sensitive areas to place a permanent black redaction block.
        </p>
      )}

      {tool === "highlight" && (
        <p className="font-inter text-[9px] text-[#1a1a1a]/50 mt-2">
          Click and drag to highlight areas with a yellow marker.
        </p>
      )}

      {tool === "image" && (
        <p className="font-inter text-[9px] text-[#1a1a1a]/50 mt-2">
          Click anywhere on the page to insert an image or signature.
        </p>
      )}
    </div>
  );
}
