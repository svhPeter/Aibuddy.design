/**
 * Video Compressor Tool — client-side video compression via ffmpeg.wasm.
 *
 * FFmpeg is loaded 100% from CDN at runtime using a <script> tag injection.
 * This means:
 *   - ZERO npm dependency on @ffmpeg/ffmpeg at build time
 *   - ZERO bytes added to the initial JS bundle
 *   - The ~25 MB WASM core is only fetched when the user clicks "Compress"
 *
 * Supports MP4 and WebM input/output up to 500 MB.
 * Three compression modes: High Quality, Balanced, Maximum Compression.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { downloadBlob } from "@/lib/image-tool-helpers";
import { useObjectUrl } from "@/hooks/use-object-url";
import { ToolResultPanel } from "@/components/tools/ToolResultPanel";
import {
  Download,
  Loader2,
  Upload,
  X,
  Film,
  Zap,
  Shield,
  Minimize2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CompressionMode = "high-quality" | "balanced" | "max-compression";

type CompressState =
  | "idle"
  | "loading-ffmpeg"
  | "compressing"
  | "done"
  | "error";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

const MODES: {
  id: CompressionMode;
  label: string;
  description: string;
  icon: typeof Zap;
}[] = [
  {
    id: "high-quality",
    label: "High Quality",
    description: "Minimal visual loss, moderate file reduction",
    icon: Shield,
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Good quality with strong compression",
    icon: Zap,
  },
  {
    id: "max-compression",
    label: "Maximum Compression",
    description: "Smallest file size, visible quality loss",
    icon: Minimize2,
  },
];

function getCrfArgs(mode: CompressionMode): string[] {
  switch (mode) {
    case "high-quality":
      return ["-crf", "23", "-preset", "slow"];
    case "balanced":
      return ["-crf", "28", "-preset", "medium"];
    case "max-compression":
      return ["-crf", "35", "-preset", "fast"];
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// FFmpeg loader — pure CDN, zero npm dependency at build time
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

const FFMPEG_CDN = "https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/umd/ffmpeg.js";
const UTIL_CDN = "https://unpkg.com/@ffmpeg/util@0.12.2/dist/umd/util.js";
const CORE_CDN = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

interface FFmpegInstance {
  on(event: string, callback: (e: any) => void): void;
  load(config?: Record<string, any>): Promise<void>;
  writeFile(name: string, data: Uint8Array | string): Promise<void>;
  readFile(name: string): Promise<Uint8Array>;
  deleteFile(name: string): Promise<void>;
  exec(args: string[]): Promise<number>;
  terminate(): void;
}

async function loadFFmpeg(
  onProgress: (p: { progress: number; time: number }) => void,
): Promise<FFmpegInstance> {
  // Load UMD bundles from CDN
  await loadScript(UTIL_CDN);
  await loadScript(FFMPEG_CDN);

  const FFmpegWASM = (window as any).FFmpegWASM;
  const FFmpegUtil = (window as any).FFmpegUtil;

  if (!FFmpegWASM?.FFmpeg) {
    throw new Error(
      "FFmpeg failed to load. Check your internet connection and try again.",
    );
  }

  const ffmpeg = new FFmpegWASM.FFmpeg();
  ffmpeg.on("progress", onProgress);

  // Load WASM core from CDN
  const coreURL = `${CORE_CDN}/ffmpeg-core.js`;
  const wasmURL = `${CORE_CDN}/ffmpeg-core.wasm`;

  if (FFmpegUtil?.toBlobURL) {
    await ffmpeg.load({
      coreURL: await FFmpegUtil.toBlobURL(coreURL, "text/javascript"),
      wasmURL: await FFmpegUtil.toBlobURL(wasmURL, "application/wasm"),
    });
  } else {
    // Fallback: direct URL loading
    await ffmpeg.load({ coreURL, wasmURL });
  }

  return ffmpeg as FFmpegInstance;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VideoCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<CompressionMode>("balanced");
  const [outputFormat, setOutputFormat] = useState<"mp4" | "webm">("mp4");
  const [state, setState] = useState<CompressState>("idle");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const ffmpegRef = useRef<FFmpegInstance | null>(null);
  const abortRef = useRef(false);

  const previewUrl = useObjectUrl(outputBlob);

  // Get video duration when file changes
  useEffect(() => {
    if (!file) {
      setVideoDuration(0);
      return;
    }
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration);
      URL.revokeObjectURL(url);
    };
    video.onerror = () => URL.revokeObjectURL(url);
    video.src = url;
  }, [file]);

  // ── File handlers ──────────────────────────────────────────────────────

  const validateAndSetFile = useCallback((f: File | null) => {
    setOutputBlob(null);
    setErrorMsg("");
    setState("idle");
    setProgress(0);

    if (!f) {
      setFile(null);
      return;
    }

    const validTypes = ["video/mp4", "video/webm", "video/x-matroska"];
    if (!validTypes.includes(f.type) && !f.name.match(/\.(mp4|webm|mkv)$/i)) {
      setErrorMsg("Unsupported format. Use MP4 or WebM.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setErrorMsg(`File too large. Maximum is ${formatBytes(MAX_FILE_SIZE)}.`);
      return;
    }

    setFile(f);
    if (f.name.endsWith(".webm")) {
      setOutputFormat("webm");
    } else {
      setOutputFormat("mp4");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) validateAndSetFile(f);
    },
    [validateAndSetFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  // ── Compression ────────────────────────────────────────────────────────

  const compress = useCallback(async () => {
    if (!file) return;
    abortRef.current = false;
    setErrorMsg("");
    setOutputBlob(null);
    setProgress(0);

    try {
      setState("loading-ffmpeg");
      setProgressText("Loading FFmpeg engine…");

      if (!ffmpegRef.current) {
        ffmpegRef.current = await loadFFmpeg((ev) => {
          if (abortRef.current) return;
          const pct = Math.min(Math.round(ev.progress * 100), 100);
          setProgress(pct);
          const timeSec = Math.max(0, ev.time / 1_000_000);
          setProgressText(
            `Compressing… ${pct}%${timeSec > 0 ? ` (${formatDuration(timeSec)} processed)` : ""}`,
          );
        });
      }

      if (abortRef.current) return;

      setState("compressing");
      setProgressText("Reading file…");

      const ffmpeg = ffmpegRef.current;
      const inputExt = file.name.split(".").pop() || "mp4";
      const inputName = `input.${inputExt}`;
      const outputName = `output.${outputFormat}`;

      const arrayBuf = await file.arrayBuffer();
      if (abortRef.current) return;

      await ffmpeg.writeFile(inputName, new Uint8Array(arrayBuf));
      if (abortRef.current) return;

      // Build ffmpeg arguments
      const args = ["-i", inputName];

      if (outputFormat === "webm") {
        const crfMap = {
          "high-quality": "30",
          balanced: "35",
          "max-compression": "45",
        } as const;
        args.push(
          "-c:v", "libvpx-vp9",
          "-crf", crfMap[mode],
          "-b:v", "0",
          "-c:a", "libopus",
          "-b:a", mode === "max-compression" ? "64k" : "128k",
        );
      } else {
        args.push(
          "-c:v", "libx264",
          ...getCrfArgs(mode),
          "-c:a", "aac",
          "-b:a", mode === "max-compression" ? "64k" : "128k",
          "-movflags", "+faststart",
        );
      }

      args.push("-y", outputName);

      setProgressText("Compressing…");
      const exitCode = await ffmpeg.exec(args);

      if (abortRef.current) return;
      if (exitCode !== 0) {
        throw new Error(`FFmpeg exited with code ${exitCode}`);
      }

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([new Uint8Array(data)], {
        type: outputFormat === "webm" ? "video/webm" : "video/mp4",
      });

      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});

      setOutputBlob(blob);
      setState("done");
      setProgressText("");
    } catch (err) {
      if (abortRef.current) {
        setState("idle");
        return;
      }
      setState("error");
      const msg = (err as Error).message || "Compression failed.";
      setErrorMsg(
        msg.includes("SharedArrayBuffer")
          ? "Your browser requires Cross-Origin Isolation headers to run FFmpeg. This works on Vercel with the production headers configured."
          : msg,
      );
    }
  }, [file, mode, outputFormat]);

  const cancel = useCallback(() => {
    abortRef.current = true;
    setState("idle");
    setProgress(0);
    setProgressText("");
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setOutputBlob(null);
    setState("idle");
    setProgress(0);
    setProgressText("");
    setErrorMsg("");
  }, []);

  const downloadOutput = useCallback(() => {
    if (!outputBlob || !file) return;
    const baseName = file.name.replace(/\.[^.]+$/, "") || "video";
    downloadBlob(outputBlob, `${baseName}-compressed.${outputFormat}`);
  }, [outputBlob, file, outputFormat]);

  const isProcessing = state === "loading-ffmpeg" || state === "compressing";
  const reduction =
    file && outputBlob
      ? Math.round((1 - outputBlob.size / file.size) * 100)
      : 0;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <p className="font-inter text-sm text-[#1a1a1a]/70 leading-relaxed">
        Compress MP4 and WebM videos <strong>entirely in your browser</strong>{" "}
        using FFmpeg — no uploads, no server, your files stay private. Max{" "}
        {formatBytes(MAX_FILE_SIZE)}.
      </p>

      {/* ── Drop zone ────────────────────────────────────────────────── */}
      {!file && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`border-[3px] border-dashed p-10 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-[#F9FF00] bg-[#F9FF00]/10"
              : "border-black bg-[#fafafa] hover:bg-[#F9FF00]/5"
          }`}
          onClick={() => document.getElementById("vc-file-input")?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById("vc-file-input")?.click();
            }
          }}
        >
          <Upload
            size={32}
            className={`mx-auto mb-3 ${
              dragOver ? "text-[#F9FF00]" : "text-[#1a1a1a]/40"
            }`}
          />
          <p className="font-oswald text-sm font-bold uppercase tracking-wider mb-1">
            {dragOver ? "Drop video here" : "Drag & drop a video"}
          </p>
          <p className="font-inter text-xs text-[#1a1a1a]/50">
            or click to browse · MP4, WebM · max {formatBytes(MAX_FILE_SIZE)}
          </p>
          <input
            id="vc-file-input"
            type="file"
            accept="video/mp4,video/webm,.mp4,.webm"
            className="hidden"
            onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
          />
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="border-[3px] border-[#FF0004] bg-red-50 p-4 flex items-start gap-3">
          <X size={18} className="text-[#FF0004] shrink-0 mt-0.5" />
          <div>
            <p className="font-oswald text-xs font-bold uppercase text-[#FF0004]">
              Error
            </p>
            <p className="font-inter text-sm text-[#FF0004]/80 mt-1">
              {errorMsg}
            </p>
          </div>
        </div>
      )}

      {/* ── File loaded ──────────────────────────────────────────────── */}
      {file && (
        <>
          {/* File info bar */}
          <div className="border-[3px] border-black bg-[#fafafa] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Film size={20} className="text-[#1a1a1a]/60 shrink-0" />
                <div className="min-w-0">
                  <p className="font-oswald text-sm font-bold uppercase tracking-tight truncate">
                    {file.name}
                  </p>
                  <p className="font-inter text-xs text-[#1a1a1a]/50">
                    {formatBytes(file.size)}
                    {videoDuration > 0 && ` · ${formatDuration(videoDuration)}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                disabled={isProcessing}
                className="btn-brutal btn-brutal-ghost px-3 py-1 text-xs disabled:opacity-30"
                aria-label="Remove file"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            {/* Compression mode */}
            <div>
              <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-3">
                Compression mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      disabled={isProcessing}
                      className={`border-[3px] border-black p-4 text-left transition-colors m-[-1.5px] relative disabled:opacity-50 ${
                        isActive
                          ? "bg-[#F9FF00] text-[#1a1a1a]"
                          : "bg-white hover:bg-[#F9FF00]/10 text-[#1a1a1a]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon
                          size={16}
                          className={
                            isActive ? "text-[#1a1a1a]" : "text-[#1a1a1a]/50"
                          }
                        />
                        <span className="font-oswald text-xs font-bold uppercase tracking-wider">
                          {m.label}
                        </span>
                      </div>
                      <p className="font-inter text-[10px] text-[#1a1a1a]/60 leading-snug">
                        {m.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Output format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Output format
                </label>
                <select
                  className="input-brutal w-full"
                  value={outputFormat}
                  onChange={(e) =>
                    setOutputFormat(e.target.value as "mp4" | "webm")
                  }
                  disabled={isProcessing}
                >
                  <option value="mp4">MP4 (H.264 + AAC)</option>
                  <option value="webm">WebM (VP9 + Opus)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Progress ───────────────────────────────────────────────── */}
          {isProcessing && (
            <div className="border-[3px] border-black p-5 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Loader2
                    size={16}
                    className="animate-spin text-[#1a1a1a]/50"
                  />
                  <span className="font-inter text-sm text-[#1a1a1a]/70">
                    {progressText}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={cancel}
                  className="font-oswald text-[10px] font-bold uppercase tracking-wider text-[#FF0004] hover:text-[#FF0004]/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
              {/* Progress bar */}
              <div className="h-4 border-[3px] border-black bg-[#fafafa] relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-[#F9FF00] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-oswald text-[10px] font-bold uppercase tracking-widest z-10">
                  {progress}%
                </span>
              </div>
              {state === "loading-ffmpeg" && (
                <p className="font-inter text-[10px] text-[#1a1a1a]/40 mt-2">
                  First use downloads the FFmpeg engine (~25 MB). It's cached
                  for subsequent uses.
                </p>
              )}
            </div>
          )}

          {/* ── Compress button ─────────────────────────────────────────── */}
          {state !== "done" && !isProcessing && (
            <button
              type="button"
              onClick={() => void compress()}
              className="btn-brutal btn-brutal-yellow w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8"
            >
              <Zap size={16} />
              Compress video
            </button>
          )}

          {/* ── Result ──────────────────────────────────────────────────── */}
          <ToolResultPanel
            show={state === "done" && !!outputBlob}
            title="Compressed result"
            preview={
              <div className="w-full max-w-2xl">
                {previewUrl ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-h-[420px] border-[3px] border-black bg-black"
                    preload="metadata"
                  />
                ) : (
                  <span className="font-inter text-xs text-[#1a1a1a]/50 py-8">
                    Preview unavailable
                  </span>
                )}
              </div>
            }
            auxiliary={
              file && outputBlob ? (
                <div className="flex flex-wrap items-center gap-4">
                  <p>
                    <strong>Original:</strong> {formatBytes(file.size)}
                  </p>
                  <p>
                    <strong>Compressed:</strong> {formatBytes(outputBlob.size)}
                  </p>
                  <p
                    className={`font-oswald font-bold uppercase text-sm ${
                      reduction > 0 ? "text-green-700" : "text-[#FF0004]"
                    }`}
                  >
                    {reduction > 0
                      ? `↓ ${reduction}% smaller`
                      : "No reduction"}
                  </p>
                </div>
              ) : null
            }
            actions={
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={downloadOutput}
                  disabled={!outputBlob}
                  className="inline-flex items-center gap-2 btn-brutal btn-brutal-yellow disabled:opacity-40"
                >
                  <Download size={16} />
                  Download .{outputFormat}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="btn-brutal btn-brutal-ghost"
                >
                  Compress another
                </button>
              </div>
            }
          />
        </>
      )}
    </div>
  );
}
