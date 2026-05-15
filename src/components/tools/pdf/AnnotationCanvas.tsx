/**
 * Transparent canvas overlay for freehand drawing, highlighting, and signing.
 * Positioned absolutely over the PDF page preview.
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
}

interface Props {
  width: number;
  height: number;
  mode: DrawMode;
  color?: string;
  lineWidth?: number;
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

      for (const stroke of strokesRef.current) {
        if (stroke.points.length < 2) continue;
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (stroke.mode === "highlight") {
          ctx.globalAlpha = 0.35;
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.lineWidth;
        } else {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.lineWidth;
        }

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }, []);

    useImperativeHandle(ref, () => ({
      getStrokes: () => [...strokesRef.current],
      clearStrokes: () => { strokesRef.current = []; redraw(); },
      toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
      isEmpty: () => strokesRef.current.length === 0,
    }), [redraw]);

    // Resize canvas
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
      const scaleX = cvs.width / rect.width;
      const scaleY = cvs.height / rect.height;

      if ("touches" in e && e.touches.length > 0) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        };
      }
      const me = e as React.MouseEvent;
      return {
        x: (me.clientX - rect.left) * scaleX,
        y: (me.clientY - rect.top) * scaleY,
      };
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
      const pos = getPos(e);
      currentRef.current.points.push(pos);
      redraw();
    }, [getPos, redraw]);

    const endDraw = useCallback(() => {
      drawingRef.current = false;
      currentRef.current = null;
    }, []);

    const cursor = mode === "draw" ? "crosshair" : mode === "highlight" ? "text" : "default";

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10"
        style={{
          width: "100%",
          height: "100%",
          cursor,
          touchAction: mode !== "none" ? "none" : "auto",
          pointerEvents: mode !== "none" ? "auto" : "none",
        }}
        onMouseDown={startDraw}
        onMouseMove={moveDraw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={moveDraw}
        onTouchEnd={endDraw}
      />
    );
  },
);
