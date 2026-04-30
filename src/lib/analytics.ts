// Analytics helper — replace supabase.from(...) calls once Supabase is connected
// TODO: Connect to real Supabase analytics_events table

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("jn_session_id");
  if (!id) {
    id = `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem("jn_session_id", id);
  }
  return id;
}

export async function trackEvent(
  event_type: string,
  page: string,
  metadata?: Record<string, unknown>,
  session_id?: string
): Promise<void> {
  // Mock implementation — logs to console in demo mode
  // TODO: Replace with supabase.from('analytics_events').insert({...}) once connected
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", { event_type, page, metadata, session_id: session_id ?? getSessionId() });
  }

  // In production with Supabase:
  // await supabase.from('analytics_events').insert({
  //   event_type,
  //   page,
  //   metadata,
  //   session_id: session_id ?? getSessionId(),
  //   created_at: new Date().toISOString(),
  // });
}
