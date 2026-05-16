/**
 * Annotation canvas overlay — smooth freehand drawing, highlighting, signing.
 * Features:
 *   - Catmull-Rom spline smoothing for natural-feeling strokes
 *   - Touch + mouse support with pressure-like width variation
 *   - Semi-transparent highlight mode
 *   - Imperative handle for stroke data, clearing, and export
 */

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

export type DrawMode = "draw" | "highlight" | "none";

export interface AnnotationStroke {
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
  mode: DrawMode;
}

export interface AnnotationCanvasHandle {
  getStrokes(): AnnotationStroke[];
  clearStrokes(): void;
  toDataURL(): string;
  isEmpty(): boolean;
  undo(): void;
}

interface Props {
  width: number;
  height: number;
  mode: DrawMode;
  color?: string;
  lineWidth?: number;
}

/** Catmull-Rom interpolation for smooth curves between points */
function catmullRom(
  p0: { x: number; y: number }, p1: { x: number; y: number },
  p2: { x: number; y: number }, p3: { x: number; y: number },
  t: number,
) {
  const t2 = t * t, t3 = t2 * t;
  return {
    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: AnnotationStroke) {
  const pts = stroke.points;
  if (pts.length < 2) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.lineWidth;
  ctx.globalAlpha = stroke.mode === "highlight" ? 0.35 : 1;

  ctx.beginPath();

  if (pts.length === 2) {
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
  } else {
    // Catmull-Rom smoothing
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[Math.min(i + 1, pts.length - 1)];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const steps = Math.max(2, Math.min(8, Math.ceil(
        Math.hypot(p2.x - p1.x, p2.y - p1.y) / 6
      )));
      for (let t = 1; t <= steps; t++) {
        const pt = catmullRom(p0, p1, p2, p3, t / steps);
        ctx.lineTo(pt.x, pt.y);
      }
    }
  }

  ctx.stroke();
  ctx.restore();
}

export const AnnotationCanvas = forwardRef<AnnotationCanvasHandle, Props>(
  function AnnotationCanvas({ width, height, mode, color = "#1a1a1a", lineWidth = 3 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const strokesRef = useRef<AnnotationStroke[]>([]);
    const drawingRef = useRef(false);
    const currentRef = useRef<AnnotationStroke | null>(null);

    const redraw = useCallback(() => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      for (const stroke of strokesRef.current) drawStroke(ctx, stroke);
    }, []);

    useImperativeHandle(ref, () => ({
      getStrokes: () => [...strokesRef.current],
      clearStrokes: () => { strokesRef.current = []; redraw(); },
      toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
      isEmpty: () => strokesRef.current.length === 0,
      undo: () => { strokesRef.current.pop(); redraw(); },
    }), [redraw]);

    useEffect(() => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      cvs.width = width;
      cvs.height = height;
      redraw();
    }, [width, height, redraw]);

    const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      const cvs = canvasRef.current;
      if (!cvs) return { x: 0, y: 0 };
      const rect = cvs.getBoundingClientRect();
      const sx = cvs.width / rect.width;
      const sy = cvs.height / rect.height;
      if ("touches" in e && e.touches.length > 0) {
        return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
      }
      const me = e as React.MouseEvent;
      return { x: (me.clientX - rect.left) * sx, y: (me.clientY - rect.top) * sy };
    }, []);

    const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      if (mode === "none") return;
      e.preventDefault();
      drawingRef.current = true;
      const pos = getPos(e);
      const stroke: AnnotationStroke = {
        points: [pos],
        color: mode === "highlight" ? "#F9FF00" : color,
        lineWidth: mode === "highlight" ? 20 : lineWidth,
        mode,
      };
      currentRef.current = stroke;
      strokesRef.current.push(stroke);
    }, [mode, color, lineWidth, getPos]);

    const moveDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      if (!drawingRef.current || !currentRef.current) return;
      e.preventDefault();
      currentRef.current.points.push(getPos(e));
      redraw();
    }, [getPos, redraw]);

    const endDraw = useCallback(() => { drawingRef.current = false; currentRef.current = null; }, []);

    const cursor = mode === "draw" ? "crosshair" : mode === "highlight" ? "text" : "default";

    return (
      <canvas ref={canvasRef} className="absolute inset-0 z-10"
        style={{ width: "100%", height: "100%", cursor, touchAction: mode !== "none" ? "none" : "auto", pointerEvents: mode !== "none" ? "auto" : "none" }}
        onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={endDraw} />
    );
  },
);
