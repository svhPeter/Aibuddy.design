/**
 * Vercel Edge Function: AI Chat completion
 * 
 * Proxies chat requests to NVIDIA NIM API.
 * API key is server-side only — never exposed to client.
 * 
 * POST /api/ai/chat
 * Body: { modelId, system, messages, maxTokens, temperature }
 */

export const config = { runtime: "edge" };

const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "AI backend not configured. Set NVIDIA_API_KEY in environment.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { modelId, system, messages, maxTokens = 4096, temperature = 0.7 } = body;

    const nvidiaMessages = [];
    if (system) {
      nvidiaMessages.push({ role: "system", content: system });
    }
    nvidiaMessages.push(...(messages || []));

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId || "meta/llama-3.1-8b-instruct",
        messages: nvidiaMessages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `NVIDIA API error: ${response.status}`, details: errorText }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return new Response(
      JSON.stringify({
        content: choice?.message?.content || "",
        model: data.model || modelId,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
            }
          : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
