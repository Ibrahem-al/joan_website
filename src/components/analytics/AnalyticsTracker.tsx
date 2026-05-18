"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";

function getSessionId(): string {
  const key = "lapai_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const supabase = createClient();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Don't double-track the same path (React strict mode / remounts)
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Skip admin pages — internal traffic shouldn't skew stats
    if (pathname.startsWith("/admin")) return;

    const sessionId = getSessionId();

    supabase.from("analytics_events").insert({
      session_id: sessionId,
      event_type: "page_view",
      page: pathname,
      metadata: {
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      },
    }).then(({ error }) => {
      if (error) console.warn("[analytics]", error.message);
    });
  }, [pathname]);

  return null;
}
