import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Not needed for this response
          },
        },
      }
    )

    const { documentId, amount } = await request.json()

    if (!documentId || !amount) {
      return NextResponse.json(
        { error: 'Missing documentId or amount' },
        { status: 400 }
      )
    }

    // TODO: Create Stripe PaymentIntent
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount,
    //   currency: 'usd',
    //   metadata: { documentId },
    // })

    // For now, return a mock client secret
    const clientSecret = `pi_mock_${Date.now()}`

    return NextResponse.json({
      clientSecret,
      message: 'Stripe integration coming soon',
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
