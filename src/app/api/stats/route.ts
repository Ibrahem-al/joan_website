import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const revalidate = 300; // cache for 5 minutes

export async function GET() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const [bizResult, visitorsResult, statesResult] = await Promise.all([
    supabase
      .from('businesses')
      .select('state', { count: 'exact' })
      .eq('status', 'approved'),
    supabase
      .from('analytics_events')
      .select('visitor_id', { count: 'exact', head: false })
      .eq('event_type', 'page_view')
      .not('visitor_id', 'is', null),
    supabase
      .from('businesses')
      .select('state')
      .eq('status', 'approved'),
  ])

  const businesses = bizResult.count ?? 0
  const uniqueVisitors = new Set((visitorsResult.data ?? []).map((r: { visitor_id: string }) => r.visitor_id)).size
  const states = new Set((statesResult.data ?? []).map((r: { state: string }) => r.state)).size

  return NextResponse.json({ businesses, visitors: uniqueVisitors, states })
}
