/**
 * Vercel Edge Function: Product Description Generator
 * 
 * POST /api/ai/product-description
 * Body: { productName, category?, features?, tone?, modelId? }
 */

export const config = { runtime: "edge" };

const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";

const SYSTEM_PROMPT = `You are an expert copywriter. Generate product descriptions in multiple formats:

**Short Description** (1-2 sentences)
**Long Description** (1 paragraph)
**Bullet Points** (5 key features)
**CTA** (call to action, 1 line)

Match the requested tone. Be specific and benefit-driven.`;

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
    const { productName, category, features, tone, modelId } = body;

    if (!productName?.trim()) {
      return new Response(
        JSON.stringify({ error: "Product name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userPrompt = [
      `Product: ${productName}`,
      category && `Category: ${category}`,
      features?.length && `Features: ${features.join(", ")}`,
      tone && `Tone: ${tone}`,
    ]
      .filter(Boolean)
      .join("\n");

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
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `NVIDIA API error: ${response.status}` }),
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
