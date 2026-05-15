/**
 * Health check for AI backend.
 * GET /api/ai/health
 */

export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const configured = !!process.env.NVIDIA_API_KEY;

  return new Response(
    JSON.stringify({
      ok: configured,
      provider: "nvidia",
      baseUrl: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
      configured,
    }),
    {
      status: configured ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}
