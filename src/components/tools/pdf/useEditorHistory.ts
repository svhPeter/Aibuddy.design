/**
 * Undo/redo history hook for the PDF Editor.
 * Tracks annotation changes as discrete actions.
 */
import { useCallback, useRef, useState } from "react";
import type { Annotation } from "./types";

interface HistoryState {
  annotations: Annotation[];
}

export function useEditorHistory(initial: Annotation[] = []) {
  const stack = useRef<HistoryState[]>([{ annotations: initial }]);
  const pointer = useRef(0);
  const [annotations, setAnnotations] = useState<Annotation[]>(initial);

  const push = useCallback((next: Annotation[]) => {
    // Truncate any future states (we're branching)
    stack.current = stack.current.slice(0, pointer.current + 1);
    stack.current.push({ annotations: next });
    pointer.current = stack.current.length - 1;
    setAnnotations(next);
  }, []);

  const undo = useCallback(() => {
    if (pointer.current <= 0) return;
    pointer.current -= 1;
    const state = stack.current[pointer.current];
    setAnnotations(state.annotations);
  }, []);

  const redo = useCallback(() => {
    if (pointer.current >= stack.current.length - 1) return;
    pointer.current += 1;
    const state = stack.current[pointer.current];
    setAnnotations(state.annotations);
  }, []);

  const reset = useCallback((fresh: Annotation[] = []) => {
    stack.current = [{ annotations: fresh }];
    pointer.current = 0;
    setAnnotations(fresh);
  }, []);

  const canUndo = pointer.current > 0;
  const canRedo = pointer.current < stack.current.length - 1;

  return { annotations, push, undo, redo, reset, canUndo, canRedo };
}
