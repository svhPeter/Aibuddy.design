/**
 * Vercel Edge Function: Caption Generator
 * 
 * POST /api/ai/caption
 * Body: { topic, platform, tone?, modelId? }
 */

export const config = { runtime: "edge" };

const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";

const PLATFORM_GUIDES: Record<string, string> = {
  instagram: "Instagram: engaging, emoji-friendly, 2-3 hashtag suggestions, max 150 words",
  tiktok: "TikTok: trendy, hook-first, casual, max 100 words",
  linkedin: "LinkedIn: professional, thought-leadership angle, max 200 words",
  x: "X (Twitter): punchy, max 280 characters, optional thread suggestion",
};

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
    const { topic, platform, tone, modelId } = body;

    if (!topic?.trim() || !platform) {
      return new Response(
        JSON.stringify({ error: "Topic and platform are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const guide = PLATFORM_GUIDES[platform] || PLATFORM_GUIDES.instagram;

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId || "meta/llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: `You are a social media copywriter. Generate 3 caption options for the platform. ${guide}${tone ? `. Tone: ${tone}` : ""}`,
          },
          { role: "user", content: `Topic: ${topic}` },
        ],
        max_tokens: 1024,
        temperature: 0.8,
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
