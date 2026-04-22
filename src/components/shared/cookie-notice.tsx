"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

const LS_KEY = "aibuddy_cookie_notice_dismissed_v1";

export function CookieNotice() {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LS_KEY) === "1";
    } catch {
      return false;
    }
  });

  const onDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const body = useMemo(
    () =>
      "AIBuddy uses necessary cookies for sign-in and to enforce usage limits (including the guest usage cookie).",
    [],
  );

  if (dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 md:px-10">
      <div className="mx-auto max-w-6xl rounded-lg border-2 border-[#262626] bg-[#0e0e0e]/95 p-4 shadow-2xl backdrop-blur-xl backdrop-saturate-150">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-pretty text-xs leading-relaxed text-[#c9c9c9]">
            {body}{" "}
            <Link href="/privacy" className="text-[#cafd00] hover:underline">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/cookies" className="text-[#cafd00] hover:underline">
              Cookies
            </Link>
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/cookies"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full justify-center rounded-none sm:w-auto",
              )}
            >
              Learn more
            </Link>
            <Button
              type="button"
              size="sm"
              onClick={onDismiss}
              className="w-full rounded-none bg-[#cafd00] font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca] sm:w-auto"
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

