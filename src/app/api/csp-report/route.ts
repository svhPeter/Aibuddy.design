import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    // Log in a structured way so operators can grep production logs.
    console.warn("[csp-report]", JSON.stringify(body));
  } catch (e) {
    console.warn("[csp-report] failed to parse report", e);
  }
  return new NextResponse(null, { status: 204 });
}

