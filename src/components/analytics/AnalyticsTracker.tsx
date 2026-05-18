"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";

function getId(storage: Storage, key: string): string {
  let id = storage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    storage.setItem(key, id);
  }
  return id;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const supabase = createClient();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    if (pathname.startsWith("/admin")) return;

    const visitorId = getId(localStorage, "lapai_visitor_id");   // persists across sessions
    const sessionId = getId(sessionStorage, "lapai_session_id"); // resets when tab closes

    supabase.from("analytics_events").insert({
      visitor_id: visitorId,
      session_id: sessionId,
      event_type: "page_view",
      page: pathname,
      metadata: {
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      },
    }).then(({ error }) => {
      if (error) console.warn("[analytics]", error.message);
    });
  }, [pathname]);

  return null;
}
