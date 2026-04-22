/**
 * Server-side AI facades — use for API routes and server actions only.
 *
 * - Gemini: `@/lib/ai/providers/gemini` (vision + structured JSON for Image to Prompt).
 * - Bytez: `@/lib/ai/providers/bytez` (unified `POST /models/v2/{modelId}` — text/chat).
 *
 * Do not import these from client components ("use client") — keys stay on the server.
 */

export type { AiInvokeMeta, AiProviderName } from "@/lib/ai/types";

export {
  GeminiImagePromptError,
  GeminiNotConfiguredError,
  generateImagePromptFromImage,
  type ImagePromptResult,
} from "@/lib/ai/providers/gemini";

export {
  BytezApiError,
  BytezIntegrationPendingError,
  BytezNotConfiguredError,
  bytezInvokeChat,
  bytezInvokeLlm,
  isBytezConfigured,
  type BytezChatMessage,
  type BytezInvokeChatInput,
  type BytezInvokeLlmInput,
  type BytezInvokeLlmOutput,
} from "@/lib/ai/providers/bytez";
