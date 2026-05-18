import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const token = (request.headers.get('authorization') || '').replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (!user || userError) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Check user doesn't already have a pending/approved business
    const { data: existing } = await supabase
      .from('businesses')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a business listing.' },
        { status: 409 }
      )
    }

    const slug = (body.name as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString(36)

    const { data, error } = await supabase.from('businesses').insert({
      user_id: user.id,
      slug,
      name: body.name,
      category_slug: body.category_slug,
      state: body.state,
      description: body.description,
      long_description: body.description,
      email: body.email,
      phone: body.phone,
      website: body.website || null,
      social: body.social || null,
      tier: body.tier || 'basic',
      logo_url: body.logo_url || null,
      images: body.images || [],
      status: 'pending',
      is_featured: false,
      rating: 0,
      review_count: 0,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, business: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
