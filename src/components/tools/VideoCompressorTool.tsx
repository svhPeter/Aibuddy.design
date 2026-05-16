/**
 * Video Compressor — production-grade browser-based video compression.
 *
 * Architecture:
 *   - @ffmpeg/util is NO LONGER used (the broken CDN dependency)
 *   - toBlobURL is implemented locally in cdn-loader.ts
 *   - @ffmpeg/ffmpeg loaded via jsDelivr (primary) + unpkg (fallback)
 *   - @ffmpeg/core WASM loaded via jsDelivr (primary) + unpkg (fallback)
 *   - Automatic retry with user-friendly error messages
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { downloadBlob } from "@/lib/image-tool-helpers";
import { useObjectUrl } from "@/hooks/use-object-url";
import { ToolResultPanel } from "@/components/tools/ToolResultPanel";
import {
  Download, Loader2, Upload, X, Film, Zap, Shield, Minimize2,
  CheckCircle2, AlertTriangle, Info,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Constants ────────────────────────────────────────────────────────────

type Mode = "high-quality" | "balanced" | "max-compression";
type State = "idle" | "stage-engine" | "stage-wasm" | "compressing" | "done" | "error";

const MAX_FILE = 500 * 1024 * 1024;

const MODES: { id: Mode; label: string; desc: string; icon: typeof Zap; crf: string; preset: string; vpxCrf: string }[] = [
  { id: "high-quality",    label: "High Quality",         desc: "Minimal loss, moderate reduction",    icon: Shield,   crf: "23", preset: "slow",   vpxCrf: "30" },
  { id: "balanced",        label: "Balanced",             desc: "Good quality, strong compression",    icon: Zap,      crf: "28", preset: "medium", vpxCrf: "35" },
  { id: "max-compression", label: "Maximum Compression",  desc: "Smallest file, visible quality loss", icon: Minimize2, crf: "35", preset: "fast",   vpxCrf: "45" },
];

const fmt = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// CDN URLs with fallback
const FFMPEG_URLS = [
  "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/umd/ffmpeg.js",
  "https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/umd/ffmpeg.js",
];
const CORE_JS_URLS = [
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
];
const CORE_WASM_URLS = [
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
];

// ── FFmpeg Loader ────────────────────────────────────────────────────────

interface FFmpegInstance {
  on(event: string, cb: (e: any) => void): void;
  load(cfg?: Record<string, any>): Promise<void>;
  writeFile(name: string, data: Uint8Array | string): Promise<void>;
  readFile(name: string): Promise<Uint8Array>;
  deleteFile(name: string): Promise<void>;
  exec(args: string[]): Promise<number>;
  terminate(): void;
}

async function initFFmpeg(
  onStage: (stage: string) => void,
  onProgress: (p: { progress: number; time: number }) => void,
): Promise<FFmpegInstance> {
  const { loadScriptWithFallback, toBlobURL } = await import("@/lib/cdn-loader");

  // Stage 1: Load FFmpeg library
  onStage("Loading FFmpeg engine…");
  await loadScriptWithFallback(FFMPEG_URLS, "FFmpeg engine");

  const FFmpegWASM = (window as any).FFmpegWASM;
  if (!FFmpegWASM?.FFmpeg) throw new Error("FFmpeg library failed to initialize.");

  const ffmpeg = new FFmpegWASM.FFmpeg();
  ffmpeg.on("progress", onProgress);

  // Stage 2: Load WASM core
  onStage("Downloading compression engine (≈25 MB)…");

  let coreURL: string | undefined;
  let wasmURL: string | undefined;

  // Try each core JS URL
  for (const url of CORE_JS_URLS) {
    try { coreURL = await toBlobURL(url, "text/javascript"); break; } catch { /* next */ }
  }
  if (!coreURL) throw new Error("Unable to download FFmpeg core. Check your connection.");

  // Try each WASM URL
  for (const url of CORE_WASM_URLS) {
    try { wasmURL = await toBlobURL(url, "application/wasm"); break; } catch { /* next */ }
  }
  if (!wasmURL) throw new Error("Unable to download WASM binary. Check your connection.");

  onStage("Initializing compression engine…");
  await ffmpeg.load({ coreURL, wasmURL });

  return ffmpeg as FFmpegInstance;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Component ────────────────────────────────────────────────────────────

export function VideoCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("balanced");
  const [outputFmt, setOutputFmt] = useState<"mp4" | "webm">("mp4");
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState("");
  const [error, setError] = useState("");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [resolution, setResolution] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [compressTime, setCompressTime] = useState(0);

  const ffRef = useRef<FFmpegInstance | null>(null);
  const abortRef = useRef(false);
  const startTimeRef = useRef(0);

  const previewUrl = useObjectUrl(outputBlob);

  // Get video metadata
  useEffect(() => {
    if (!file) { setDuration(0); setResolution(""); return; }
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      setDuration(v.duration);
      setResolution(`${v.videoWidth}×${v.videoHeight}`);
      URL.revokeObjectURL(url);
    };
    v.onerror = () => URL.revokeObjectURL(url);
    v.src = url;
  }, [file]);

  const pickFile = useCallback((f: File | null) => {
    setOutputBlob(null); setError(""); setState("idle"); setProgress(0);
    if (!f) { setFile(null); return; }
    if (!f.type.startsWith("video/") && !f.name.match(/\.(mp4|webm|mkv)$/i)) {
      setError("Unsupported format. Please use MP4 or WebM."); return;
    }
    if (f.size > MAX_FILE) { setError(`File exceeds ${fmt(MAX_FILE)} limit.`); return; }
    setFile(f);
    setOutputFmt(f.name.endsWith(".webm") ? "webm" : "mp4");
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    pickFile(e.dataTransfer.files[0] ?? null);
  }, [pickFile]);

  // ── Compress ───────────────────────────────────────────────────────────

  const compress = useCallback(async () => {
    if (!file) return;
    abortRef.current = false;
    setError(""); setOutputBlob(null); setProgress(0);
    startTimeRef.current = Date.now();

    try {
      // Load FFmpeg if needed
      if (!ffRef.current) {
        setState("stage-engine");
        ffRef.current = await initFFmpeg(
          (stage) => setStageText(stage),
          (ev) => {
            if (abortRef.current) return;
            setProgress(Math.min(Math.round(ev.progress * 100), 100));
          },
        );
      }
      if (abortRef.current) return;

      setState("compressing");
      setStageText("Reading file…");
      setProgress(0);

      const ff = ffRef.current;
      const ext = file.name.split(".").pop() || "mp4";
      const inName = `in.${ext}`;
      const outName = `out.${outputFmt}`;

      const buf = await file.arrayBuffer();
      if (abortRef.current) return;
      await ff.writeFile(inName, new Uint8Array(buf));
      if (abortRef.current) return;

      // Build args
      const m = MODES.find((x) => x.id === mode)!;
      const args = ["-i", inName];

      if (outputFmt === "webm") {
        args.push("-c:v", "libvpx-vp9", "-crf", m.vpxCrf, "-b:v", "0",
                  "-c:a", "libopus", "-b:a", mode === "max-compression" ? "64k" : "128k");
      } else {
        args.push("-c:v", "libx264", "-crf", m.crf, "-preset", m.preset,
                  "-c:a", "aac", "-b:a", mode === "max-compression" ? "64k" : "128k",
                  "-movflags", "+faststart");
      }
      args.push("-y", outName);

      setStageText("Compressing video…");
      const code = await ff.exec(args);
      if (abortRef.current) return;
      if (code !== 0) throw new Error("Compression failed. The video format may be unsupported.");

      const data = await ff.readFile(outName);
      const blob = new Blob([new Uint8Array(data)], {
        type: outputFmt === "webm" ? "video/webm" : "video/mp4",
      });

      // Cleanup temp files
      await ff.deleteFile(inName).catch(() => {});
      await ff.deleteFile(outName).catch(() => {});

      setCompressTime(Math.round((Date.now() - startTimeRef.current) / 1000));
      setOutputBlob(blob);
      setState("done");
    } catch (err) {
      if (abortRef.current) { setState("idle"); return; }
      setState("error");
      setError((err as Error).message || "An unexpected error occurred.");
    }
  }, [file, mode, outputFmt]);

  const cancel = useCallback(() => {
    abortRef.current = true;
    setState("idle"); setProgress(0); setStageText("");
  }, []);

  const reset = useCallback(() => {
    setFile(null); setOutputBlob(null); setState("idle");
    setProgress(0); setStageText(""); setError(""); setCompressTime(0);
  }, []);

  const dl = useCallback(() => {
    if (!outputBlob || !file) return;
    downloadBlob(outputBlob, `${file.name.replace(/\.[^.]+$/, "")}-compressed.${outputFmt}`);
  }, [outputBlob, file, outputFmt]);

  const isProcessing = state === "stage-engine" || state === "stage-wasm" || state === "compressing";
  const reduction = file && outputBlob ? Math.round((1 - outputBlob.size / file.size) * 100) : 0;
  const estimatedSize = file ? fmt(Math.round(file.size * (mode === "high-quality" ? 0.6 : mode === "balanced" ? 0.4 : 0.2))) : "";

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <p className="font-inter text-sm text-[#1a1a1a]/70 leading-relaxed">
        Compress MP4 and WebM videos <strong>entirely in your browser</strong> using FFmpeg.
        No uploads, no server — your files stay private. Max {fmt(MAX_FILE)}.
      </p>

      {/* Drop zone */}
      {!file && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`border-[3px] border-dashed p-12 text-center transition-all cursor-pointer ${
            dragOver ? "border-[#F9FF00] bg-[#F9FF00]/10 scale-[1.01]" : "border-black bg-[#fafafa] hover:bg-[#F9FF00]/5 hover:border-[#1a1a1a]/60"
          }`}
          onClick={() => document.getElementById("vc-input")?.click()}
          role="button" tabIndex={0} aria-label="Upload a video file"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); document.getElementById("vc-input")?.click(); } }}
        >
          <Upload size={36} className={`mx-auto mb-3 transition-colors ${dragOver ? "text-[#F9FF00]" : "text-[#1a1a1a]/30"}`} />
          <p className="font-oswald text-sm font-bold uppercase tracking-wider mb-1">
            {dragOver ? "Drop video here" : "Drag & drop a video"}
          </p>
          <p className="font-inter text-xs text-[#1a1a1a]/40">or click to browse · MP4, WebM · max {fmt(MAX_FILE)}</p>
          <input id="vc-input" type="file" accept="video/mp4,video/webm,.mp4,.webm,.mkv" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border-[3px] border-[#FF0004] bg-red-50/80 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#FF0004] shrink-0 mt-0.5" />
          <div>
            <p className="font-oswald text-xs font-bold uppercase text-[#FF0004] tracking-wider">Something went wrong</p>
            <p className="font-inter text-sm text-[#1a1a1a]/70 mt-1">{error}</p>
            <button type="button" onClick={() => { setError(""); setState("idle"); }}
              className="font-oswald text-[10px] font-bold uppercase tracking-wider text-[#FF0004] hover:underline mt-2">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* File loaded */}
      {file && (
        <>
          {/* File info card */}
          <div className="border-[3px] border-black bg-white">
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 border-[3px] border-black bg-[#1a1a1a] flex items-center justify-center shrink-0">
                  <Film size={18} className="text-[#F9FF00]" />
                </div>
                <div className="min-w-0">
                  <p className="font-oswald text-sm font-bold uppercase tracking-tight truncate">{file.name}</p>
                  <p className="font-inter text-xs text-[#1a1a1a]/50">
                    {fmt(file.size)}{resolution && ` · ${resolution}`}{duration > 0 && ` · ${fmtDur(duration)}`}
                  </p>
                </div>
              </div>
              <button type="button" onClick={reset} disabled={isProcessing} aria-label="Remove file"
                className="p-2 border-[3px] border-black bg-white hover:bg-red-50 transition-colors disabled:opacity-30">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Settings */}
          {!isProcessing && state !== "done" && (
            <div className="space-y-4">
              {/* Mode selector */}
              <div>
                <label className="font-oswald text-[10px] font-bold uppercase tracking-[0.15em] block mb-2">Compression mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
                  {MODES.map((m) => {
                    const Ic = m.icon;
                    const active = mode === m.id;
                    return (
                      <button key={m.id} type="button" onClick={() => setMode(m.id)}
                        className={`border-[3px] border-black p-3 text-left transition-colors m-[-1.5px] relative ${
                          active ? "bg-[#F9FF00] text-[#1a1a1a] z-10" : "bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a]"
                        }`}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <Ic size={14} className={active ? "text-[#1a1a1a]" : "text-[#1a1a1a]/40"} />
                          <span className="font-oswald text-xs font-bold uppercase tracking-wider">{m.label}</span>
                        </div>
                        <p className="font-inter text-[10px] text-[#1a1a1a]/60 leading-snug">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format + estimate row */}
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-56">
                  <label className="font-oswald text-[10px] font-bold uppercase tracking-[0.15em] block mb-2">Output format</label>
                  <select className="input-brutal w-full" value={outputFmt} onChange={(e) => setOutputFmt(e.target.value as "mp4" | "webm")}>
                    <option value="mp4">MP4 (H.264 + AAC)</option>
                    <option value="webm">WebM (VP9 + Opus)</option>
                  </select>
                </div>
                {estimatedSize && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#fafafa] border-[3px] border-black">
                    <Info size={12} className="text-[#1a1a1a]/40" />
                    <span className="font-inter text-[10px] text-[#1a1a1a]/60">Estimated output: ~{estimatedSize}</span>
                  </div>
                )}
              </div>

              {/* Compress button */}
              <button type="button" onClick={() => void compress()}
                className="btn-brutal btn-brutal-yellow w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-10 text-sm">
                <Zap size={16} /> Compress video
              </button>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="border-[3px] border-black bg-white">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#1a1a1a]/50" />
                    <span className="font-inter text-sm text-[#1a1a1a]/70">{stageText}</span>
                  </div>
                  <button type="button" onClick={cancel}
                    className="font-oswald text-[10px] font-bold uppercase tracking-wider text-[#FF0004] hover:underline">
                    Cancel
                  </button>
                </div>
                {/* Progress bar */}
                <div className="h-3 border-[3px] border-black bg-[#f5f5f5] relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-[#F9FF00] transition-all duration-300 ease-out"
                    style={{ width: `${state === "compressing" ? progress : 0}%` }} />
                  {state !== "compressing" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F9FF00]/40 to-transparent animate-pulse" />
                  )}
                </div>
                {state === "compressing" && progress > 0 && (
                  <p className="font-oswald text-[10px] font-bold uppercase tracking-widest text-right mt-1">{progress}%</p>
                )}
              </div>
              {(state === "stage-engine" || state === "stage-wasm") && (
                <div className="border-t-[3px] border-black px-4 py-2 bg-[#fafafa]">
                  <p className="font-inter text-[10px] text-[#1a1a1a]/40">
                    First use downloads the compression engine (~25 MB). It's cached for future use.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Result */}
          <ToolResultPanel
            show={state === "done" && !!outputBlob}
            title="Compression complete"
            preview={
              <div className="w-full max-w-2xl">
                {previewUrl ? (
                  <video src={previewUrl} controls preload="metadata"
                    className="w-full max-h-[420px] border-[3px] border-black bg-black" />
                ) : (
                  <span className="font-inter text-xs text-[#1a1a1a]/50 py-8">Preview unavailable</span>
                )}
              </div>
            }
            auxiliary={
              file && outputBlob ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="font-oswald text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]/40">Original</p>
                    <p className="font-inter text-sm font-medium">{fmt(file.size)}</p>
                  </div>
                  <div>
                    <p className="font-oswald text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]/40">Compressed</p>
                    <p className="font-inter text-sm font-medium">{fmt(outputBlob.size)}</p>
                  </div>
                  <div>
                    <p className="font-oswald text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]/40">Reduction</p>
                    <p className={`font-oswald text-sm font-bold ${reduction > 0 ? "text-green-700" : "text-[#FF0004]"}`}>
                      {reduction > 0 ? `↓ ${reduction}%` : "None"}
                    </p>
                  </div>
                  <div>
                    <p className="font-oswald text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]/40">Time</p>
                    <p className="font-inter text-sm">{compressTime}s</p>
                  </div>
                </div>
              ) : null
            }
            actions={
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={dl} disabled={!outputBlob}
                  className="inline-flex items-center gap-2 btn-brutal btn-brutal-yellow disabled:opacity-40">
                  <Download size={16} /> Download .{outputFmt}
                </button>
                <button type="button" onClick={reset} className="btn-brutal btn-brutal-ghost">
                  <CheckCircle2 size={14} /> Compress another
                </button>
              </div>
            }
          />
        </>
      )}
    </div>
  );
}
