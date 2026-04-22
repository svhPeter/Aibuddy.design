import { NextResponse } from "next/server";

import { getUsageStatus } from "@/lib/access/usage";
import { getAuthAndGuestKey } from "@/lib/access/request-context";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { user, guestKey } = await getAuthAndGuestKey(request);
  const status = await getUsageStatus({ user, guestKey });
  return NextResponse.json({ ok: true, status });
}
