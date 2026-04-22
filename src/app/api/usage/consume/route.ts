import { NextResponse } from "next/server";

import {
  consumeToolUse,
  httpStatusForDenied,
} from "@/lib/access/usage";
import { getAuthAndGuestKey } from "@/lib/access/request-context";

export const runtime = "nodejs";

type Body = { toolId?: string };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected JSON body.", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const toolId = typeof body.toolId === "string" ? body.toolId.trim() : "";
  if (!toolId) {
    return NextResponse.json(
      { ok: false, error: "Missing toolId.", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const { user, guestKey } = await getAuthAndGuestKey(request);
  const result = await consumeToolUse({ toolId, user, guestKey });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.message,
        code: result.code,
      },
      { status: httpStatusForDenied(result.code) },
    );
  }

  return NextResponse.json({
    ok: true,
    snapshot: result.snapshot,
  });
}
