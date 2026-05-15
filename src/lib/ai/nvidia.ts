/**
 * NVIDIA AI client — handles communication with the /api/ai/* serverless endpoints.
 *
 * IMPORTANT: API keys are NEVER exposed to the client.
 * The client calls our own /api/ai/* routes, which proxy to NVIDIA.
 */

import { getModel, type AIModel } from "./models";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIRequestOptions = {
  /** Which model to use (defaults to default chat model) */
  modelId?: string;
  /** System prompt */
  system?: string;
  /** Chat messages */
  messages: ChatMessage[];
  /** Max tokens to generate */
  maxTokens?: number;
  /** Temperature 0–1 */
  temperature?: number;
  /** AbortController signal for cancellation */
  signal?: AbortSignal;
};

export type AIResponse = {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
};

export type AIStreamCallbacks = {
  onToken?: (token: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (error: Error) => void;
};

// ---------------------------------------------------------------------------
// API endpoints (these are our serverless functions, NOT direct NVIDIA calls)
// ---------------------------------------------------------------------------

const API_BASE = "/api/ai";

const ENDPOINTS = {
  chat: `${API_BASE}/chat`,
  promptEnhancer: `${API_BASE}/prompt-enhancer`,
  productDescription: `${API_BASE}/product-description`,
  caption: `${API_BASE}/caption`,
  imageAnalysis: `${API_BASE}/image-analysis`,
} as const;

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

async function aiRequest(
  endpoint: string,
  body: Record<string, unknown>,
  signal?: AbortSignal
): Promise<AIResponse> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(
      (error as { error?: string }).error ?? `AI request failed (${res.status})`
    );
  }

  return res.json() as Promise<AIResponse>;
}

// ---------------------------------------------------------------------------
// Public API — these are what components call
// ---------------------------------------------------------------------------

/**
 * General-purpose chat completion.
 */
export async function chat(opts: AIRequestOptions): Promise<AIResponse> {
  const model = getModel(opts.modelId);
  return aiRequest(
    ENDPOINTS.chat,
    {
      modelId: model.modelId,
      system: opts.system,
      messages: opts.messages,
      maxTokens: opts.maxTokens ?? model.maxTokens,
      temperature: opts.temperature ?? 0.7,
    },
    opts.signal
  );
}

/**
 * Enhance a rough prompt into a detailed, structured one.
 */
export async function enhancePrompt(
  roughPrompt: string,
  opts?: { modelId?: string; signal?: AbortSignal }
): Promise<AIResponse> {
  return aiRequest(
    ENDPOINTS.promptEnhancer,
    {
      prompt: roughPrompt,
      modelId: opts?.modelId,
    },
    opts?.signal
  );
}

/**
 * Generate product description from inputs.
 */
export async function generateProductDescription(
  input: {
    productName: string;
    category?: string;
    features?: string[];
    tone?: "professional" | "casual" | "luxury" | "technical";
  },
  opts?: { modelId?: string; signal?: AbortSignal }
): Promise<AIResponse> {
  return aiRequest(
    ENDPOINTS.productDescription,
    { ...input, modelId: opts?.modelId },
    opts?.signal
  );
}

/**
 * Generate social media captions.
 */
export async function generateCaption(
  input: {
    topic: string;
    platform: "instagram" | "tiktok" | "linkedin" | "x";
    tone?: string;
  },
  opts?: { modelId?: string; signal?: AbortSignal }
): Promise<AIResponse> {
  return aiRequest(
    ENDPOINTS.caption,
    { ...input, modelId: opts?.modelId },
    opts?.signal
  );
}

/**
 * Analyze an image (requires vision model).
 * Image should be base64 encoded.
 */
export async function analyzeImage(
  input: {
    imageBase64: string;
    task: "describe" | "caption" | "tags" | "ocr";
  },
  opts?: { modelId?: string; signal?: AbortSignal }
): Promise<AIResponse> {
  return aiRequest(
    ENDPOINTS.imageAnalysis,
    { ...input, modelId: opts?.modelId },
    opts?.signal
  );
}

/**
 * Check if the AI backend is configured and reachable.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
