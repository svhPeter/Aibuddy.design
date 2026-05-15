/**
 * NVIDIA AI model configuration and abstractions.
 * Supports multiple models — never lock UI to a single model.
 */

export type AIModel = {
  id: string;
  name: string;
  provider: "nvidia";
  /** Model identifier for the API, e.g. "meta/llama-3.1-8b-instruct" */
  modelId: string;
  /** What this model is good at */
  capabilities: ModelCapability[];
  /** Max tokens for completion */
  maxTokens: number;
  /** Whether this model supports vision/image inputs */
  supportsVision: boolean;
};

export type ModelCapability =
  | "chat"
  | "code"
  | "caption"
  | "product-description"
  | "prompt-enhance"
  | "image-analysis"
  | "ocr";

/**
 * Model registry — add or swap models here without touching UI code.
 * Model IDs reference NVIDIA NIM / NGC catalog entries.
 */
export const AI_MODELS: Record<string, AIModel> = {
  "llama-3.1-8b": {
    id: "llama-3.1-8b",
    name: "Llama 3.1 8B",
    provider: "nvidia",
    modelId: "meta/llama-3.1-8b-instruct",
    capabilities: ["chat", "code", "caption", "product-description", "prompt-enhance"],
    maxTokens: 4096,
    supportsVision: false,
  },
  "llama-3.1-70b": {
    id: "llama-3.1-70b",
    name: "Llama 3.1 70B",
    provider: "nvidia",
    modelId: "meta/llama-3.1-70b-instruct",
    capabilities: ["chat", "code", "caption", "product-description", "prompt-enhance"],
    maxTokens: 4096,
    supportsVision: false,
  },
  "llava-v1.6": {
    id: "llava-v1.6",
    name: "LLaVA v1.6 (Vision)",
    provider: "nvidia",
    modelId: "liuhaotian/llava-v1.6-mistral-7b",
    capabilities: ["image-analysis", "caption", "ocr"],
    maxTokens: 2048,
    supportsVision: true,
  },
  "mistral-7b": {
    id: "mistral-7b",
    name: "Mistral 7B",
    provider: "nvidia",
    modelId: "mistralai/mistral-7b-instruct-v0.3",
    capabilities: ["chat", "code", "prompt-enhance"],
    maxTokens: 4096,
    supportsVision: false,
  },
};

/** Default model for general chat */
export const DEFAULT_CHAT_MODEL = "llama-3.1-8b";

/** Default model for vision tasks */
export const DEFAULT_VISION_MODEL = "llava-v1.6";

/**
 * Get models that support a specific capability.
 */
export function getModelsForCapability(capability: ModelCapability): AIModel[] {
  return Object.values(AI_MODELS).filter((m) =>
    m.capabilities.includes(capability)
  );
}

/**
 * Get a model by ID, falling back to the default chat model.
 */
export function getModel(id?: string): AIModel {
  return AI_MODELS[id ?? DEFAULT_CHAT_MODEL] ?? AI_MODELS[DEFAULT_CHAT_MODEL];
}
