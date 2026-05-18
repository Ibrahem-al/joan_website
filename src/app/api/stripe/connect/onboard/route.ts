import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { stripe } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://joan-website.vercel.app'

/**
 * One-time endpoint: generates a Stripe Connect onboarding link for the business partner.
 * Admin-only. After the partner completes onboarding, add their account ID to
 * STRIPE_CONNECT_ACCOUNT_ID in Vercel environment variables.
 */
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

    const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    // Create a Connect Standard account for the partner
    const account = await stripe.accounts.create({
      type: 'standard',
    })

    // Generate the onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${APP_URL}/admin?connect=refresh`,
      return_url: `${APP_URL}/admin?connect=success&account_id=${account.id}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      url: accountLink.url,
      account_id: account.id,
      message: `Share this URL with your partner. After they complete onboarding, add STRIPE_CONNECT_ACCOUNT_ID=${account.id} to your Vercel environment variables.`,
    })
  } catch (error) {
    console.error('Connect onboard error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
