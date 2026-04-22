/**
 * Shared types for server-side AI providers (Gemini, Bytez).
 * Browser-side tools do not import this module.
 */

export type AiProviderName = "gemini" | "bytez";

export type AiInvokeMeta = {
  provider: AiProviderName;
  /** Optional model id for logs — never return to clients raw */
  model?: string;
};
