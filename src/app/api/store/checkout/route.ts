import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { stripe, transferOptions } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://joan-website.vercel.app'

export async function POST(request: NextRequest) {
  try {
    const { documentId, buyerEmail } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: 'Missing documentId' }, { status: 400 })
    }

    const db = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    // Fetch document details from DB
    const { data: doc, error } = await db
      .from('documents')
      .select('id, title, description, price, stripe_price_id')
      .eq('id', documentId)
      .eq('is_published', true)
      .single()

    if (error || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Build line item — use Stripe price if linked, otherwise use price_data
    const lineItem = doc.stripe_price_id
      ? { price: doc.stripe_price_id, quantity: 1 }
      : {
          price_data: {
            currency: 'usd',
            product_data: { name: doc.title, description: doc.description || undefined },
            unit_amount: Math.round(doc.price * 100),
          },
          quantity: 1,
        }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [lineItem],
      customer_email: buyerEmail || undefined,
      metadata: {
        documentId: doc.id,
        buyerEmail: buyerEmail || '',
      },
      success_url: `${APP_URL}/store/success?session_id={CHECKOUT_SESSION_ID}&docId=${doc.id}&title=${encodeURIComponent(doc.title)}`,
      cancel_url: `${APP_URL}/store`,
      payment_intent_data: {
        metadata: { documentId: doc.id },
        ...transferOptions(),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
