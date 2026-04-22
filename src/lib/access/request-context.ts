import { cookies } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { GUEST_COOKIE_NAME } from "./quotas";
import { resolveGuestKey } from "./usage";

/**
 * Auth user + stable guest key for quota enforcement (cookie or IP fallback).
 */
export async function getAuthAndGuestKey(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guestCookie = (await cookies()).get(GUEST_COOKIE_NAME)?.value;
  const guestKey = resolveGuestKey(guestCookie, request.headers);
  return { user, guestKey };
}
