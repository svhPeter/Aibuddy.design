/** Shared annotation types for the PDF Editor */

export type EditorTool = "select" | "text" | "draw" | "highlight" | "image" | "whiteout" | "redact";

export interface TextAnn {
  id: string;
  type: "text";
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  page: number;
}

export interface ImgAnn {
  id: string;
  type: "image";
  dataUrl: string;
  x: number;
  y: number;
  w: number;
  h: number;
  page: number;
}

export interface RectAnn {
  id: string;
  type: "whiteout" | "redact";
  x: number;
  y: number;
  w: number;
  h: number;
  page: number;
  /** For whiteout, optional replacement text */
  text?: string;
  textSize?: number;
}

export type Annotation = TextAnn | ImgAnn | RectAnn;

export interface PageData {
  thumb: string;
  w: number;
  h: number;
  rotation: number;
}

let _nextId = 0;
export function nextId(): string { return `ann_${++_nextId}_${Date.now()}`; }
