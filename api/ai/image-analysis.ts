/**
 * Vercel Edge Function: Image Analysis (vision model)
 * 
 * POST /api/ai/image-analysis
 * Body: { imageBase64, task: "describe"|"caption"|"tags"|"ocr", modelId? }
 */

export const config = { runtime: "edge" };

const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";

const TASK_PROMPTS: Record<string, string> = {
  describe: "Describe this image in detail. Include objects, colors, composition, mood, and any text visible.",
  caption: "Write a concise, engaging caption for this image suitable for social media.",
  tags: "List relevant tags/keywords for this image, comma-separated. Include subject, style, mood, colors.",
  ocr: "Extract all text visible in this image. Preserve formatting where possible.",
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
    const { imageBase64, task = "describe", modelId } = body;

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = TASK_PROMPTS[task] || TASK_PROMPTS.describe;
    const visionModel = modelId || "liuhaotian/llava-v1.6-mistral-7b";

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: visionModel,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        max_tokens: 2048,
        temperature: 0.3,
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
        model: data.model || visionModel,
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
