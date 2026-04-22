/**
 * Gemini provider — premium / heavy vision + text (Google Gen AI SDK).
 * Image-to-prompt and similar routes call into this module.
 *
 * Secrets: `GEMINI_API_KEY` (server-only).
 */

export {
  GeminiImagePromptError,
  GeminiNotConfiguredError,
  generateImagePromptFromImage,
  type ImagePromptResult,
} from "@/lib/gemini-image-prompt";
