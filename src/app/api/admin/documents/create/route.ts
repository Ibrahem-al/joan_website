import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { stripe } from '@/lib/stripe'

function makeDb(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
}

async function verifyAdmin(db: ReturnType<typeof makeDb>, request: NextRequest) {
  const token = (request.headers.get('authorization') || '').replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await db.auth.getUser(token)
  if (!user) return null
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function POST(request: NextRequest) {
  try {
    const db = makeDb(request)
    const admin = await verifyAdmin(db, request)
    if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const { title, description, category, price, preview_pages, full_file_path } = await request.json()

    // 1. Create Stripe product
    const stripeProduct = await stripe.products.create({
      name: title,
      description: description || undefined,
      metadata: { category },
    })

    // 2. Create Stripe one-time price
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100),
      currency: 'usd',
    })

    // 3. Insert document record with Stripe IDs
    const { data: doc, error } = await db
      .from('documents')
      .insert({
        title,
        description,
        category,
        price,
        preview_pages,
        full_file_path,
        is_published: true,
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
      })
      .select()
      .single()

    if (error) {
      // Clean up Stripe product if DB insert failed
      await stripe.products.update(stripeProduct.id, { active: false })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('Document create error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
