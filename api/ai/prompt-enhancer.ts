/**
 * Vercel Edge Function: Prompt Enhancer
 * 
 * Takes a rough prompt and returns a refined, structured version.
 * POST /api/ai/prompt-enhancer
 * Body: { prompt, modelId? }
 */

export const config = { runtime: "edge" };

const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";

const SYSTEM_PROMPT = `You are an expert prompt engineer. The user will give you a rough idea or basic prompt. Your job is to:
1. Rewrite it as a clear, detailed prompt
2. Add relevant context and constraints
3. Suggest negative prompts if applicable (for image generation)
4. Add relevant tags/keywords

Format your response as:
**Enhanced Prompt:**
(the improved prompt)

**Negative Prompts:**
(if applicable)

**Tags:**
(comma-separated keywords)`;

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
      JSON.stringify({ error: "AI backend not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { prompt, modelId } = body;

    if (!prompt?.trim()) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId || "meta/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 2048,
        temperature: 0.7,
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

    return new Response(
      JSON.stringify({
        content: data.choices?.[0]?.message?.content || "",
        model: data.model || modelId,
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
