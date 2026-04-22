"use client";

import { useEffect } from "react";

import { GUEST_COOKIE_NAME } from "@/lib/access/quotas";

const LS_KEY = "aibuddy_guest_id";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

/**
 * Mirrors the middleware-set guest cookie into localStorage for client-side
 * continuity across tabs; enforcement remains server-side.
 */
export function GuestIdSync() {
  useEffect(() => {
    const fromCookie = readCookie(GUEST_COOKIE_NAME)?.trim();
    if (fromCookie && fromCookie.length >= 8) {
      try {
        localStorage.setItem(LS_KEY, fromCookie);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      const fromLs = localStorage.getItem(LS_KEY)?.trim();
      if (fromLs && fromLs.length >= 8) {
        document.cookie = `${GUEST_COOKIE_NAME}=${encodeURIComponent(fromLs)}; path=/; max-age=${60 * 60 * 24 * 400}; SameSite=Lax`;
      }
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
