/**
 * Bytez inference API — unified `POST /models/v2/{modelId}` on https://api.bytez.com
 *
 * HTTP reference (OpenAPI): https://docs.bytez.com/http-reference/model/run
 * Chat examples: https://docs.bytez.com/model-api/docs/task/chat
 *
 * Auth (per OpenAPI `apiKeyAuth`): send your Bytez API key as the raw
 * `Authorization` header value (same pattern as official curl examples — not
 * `Bearer …`).
 *
 * Env: BYTEZ_API_KEY (required), optional BYTEZ_API_BASE_URL, BYTEZ_MODEL.
 */

/** Aligns with Vercel route `maxDuration` so the client is not left hanging. */
const UPSTREAM_TIMEOUT_MS = 55_000;

export class BytezNotConfiguredError extends Error {
  constructor(message = "BYTEZ_API_KEY is not configured.") {
    super(message);
    this.name = "BytezNotConfiguredError";
  }
}

/** Kept for backwards compatibility; real errors use BytezApiError. */
export class BytezIntegrationPendingError extends Error {
  constructor(message = "Bytez integration incomplete.") {
    super(message);
    this.name = "BytezIntegrationPendingError";
  }
}

export class BytezApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "BytezApiError";
    this.status = status;
  }
}

export type BytezInvokeLlmInput = {
  system?: string;
  user: string;
  /** Optional model slug when Bytez supports multiple models */
  model?: string;
};

export type BytezInvokeLlmOutput = {
  text: string;
};

export type BytezChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type BytezInvokeChatInput = {
  messages: BytezChatMessage[];
  model?: string;
  temperature?: number;
  maxNewTokens?: number;
};

function requireBytezKey(): string {
  const key = process.env.BYTEZ_API_KEY?.trim();
  if (!key) throw new BytezNotConfiguredError();
  return key;
}

function defaultBaseUrl(): string {
  return (
    process.env.BYTEZ_API_BASE_URL?.replace(/\/$/, "") ?? "https://api.bytez.com"
  );
}

function defaultModel(): string {
  return (
    process.env.BYTEZ_MODEL?.trim() ??
    /** Default chat model from Bytez “Get started” chat docs (≤7B — free tier). */
    "Qwen/Qwen3-4B"
  );
}

/**
 * Health check — no network I/O.
 */
export function isBytezConfigured(): boolean {
  return Boolean(process.env.BYTEZ_API_KEY?.trim());
}

/**
 * Normalize `output` from `POST /models/v2/{modelId}`.
 * Per OpenAPI, `output` may be a string, object, or array. Chat models often
 * return an assistant message `{ role, content }` (see chat task examples).
 */
function bytezOutputToText(output: unknown): string {
  if (typeof output === "string") return output;
  if (output === null || output === undefined) return "";

  if (typeof output === "object" && output !== null && !Array.isArray(output)) {
    const o = output as Record<string, unknown>;
    if (typeof o.content === "string" && o.content.trim()) {
      return o.content;
    }
    if (Array.isArray(o.content)) {
      const textParts = o.content
        .map((block) => {
          if (
            typeof block === "object" &&
            block !== null &&
            "text" in block &&
            typeof (block as { text?: unknown }).text === "string"
          ) {
            return (block as { text: string }).text;
          }
          return "";
        })
        .filter(Boolean);
      if (textParts.length) return textParts.join("\n");
    }
  }

  if (Array.isArray(output)) {
    try {
      return JSON.stringify(output);
    } catch {
      return String(output);
    }
  }

  try {
    return JSON.stringify(output);
  } catch {
    return String(output);
  }
}

/**
 * Run a chat-style model on Bytez (messages array).
 */
export async function bytezInvokeChat(
  input: BytezInvokeChatInput,
): Promise<BytezInvokeLlmOutput> {
  const key = requireBytezKey();
  const base = defaultBaseUrl().replace(/\/$/, "");
  const modelId = input.model?.trim() || defaultModel();
  const url = `${base}/models/v2/${modelId}`;

  const body = {
    messages: input.messages,
    stream: false,
    params: {
      temperature: input.temperature ?? 0.65,
      max_new_tokens: input.maxNewTokens ?? 900,
    },
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      throw new BytezApiError(504, "Bytez request timed out.");
    }
    throw e;
  }

  const raw: unknown = await res.json().catch(() => null);
  const data = raw as {
    error?: string | null;
    message?: string | null;
    output?: unknown;
  } | null;

  if (!res.ok) {
    const msg =
      typeof data?.error === "string" && data.error
        ? data.error
        : typeof data?.message === "string" && data.message
          ? data.message
          : `Bytez request failed (${res.status})`;
    throw new BytezApiError(res.status, msg);
  }

  if (data?.error) {
    throw new BytezApiError(502, String(data.error));
  }

  const text = bytezOutputToText(data?.output);
  if (!text.trim()) {
    throw new BytezApiError(502, "Empty response from Bytez.");
  }

  return { text };
}

/**
 * Simple system + user turn → chat API.
 */
export async function bytezInvokeLlm(
  input: BytezInvokeLlmInput,
): Promise<BytezInvokeLlmOutput> {
  const messages: BytezChatMessage[] = [];
  if (input.system?.trim()) {
    messages.push({ role: "system", content: input.system.trim() });
  }
  messages.push({ role: "user", content: input.user });
  return bytezInvokeChat({
    messages,
    model: input.model,
    temperature: 0.65,
    maxNewTokens: 900,
  });
}
