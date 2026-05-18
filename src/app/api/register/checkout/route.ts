import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { stripe, STRIPE_PRICES, transferOptions } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://joan-website.vercel.app'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const db = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user }, error: userError } = await db.auth.getUser(token)
    if (!user || userError) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { tier, businessId } = await request.json()

    if (!['standard', 'premium'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const priceId = STRIPE_PRICES[tier as 'standard' | 'premium']
    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price not configured for ${tier}. Set STRIPE_${tier.toUpperCase()}_PRICE_ID in env.` },
        { status: 500 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email || undefined,
      metadata: {
        user_id: user.id,
        tier,
        business_id: businessId || '',
      },
      subscription_data: {
        metadata: { user_id: user.id, tier },
        ...transferOptions(),
      },
      success_url: `${APP_URL}/dashboard?subscription=success`,
      cancel_url: `${APP_URL}/register`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Subscription checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
