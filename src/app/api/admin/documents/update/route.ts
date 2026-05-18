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

    const { documentId, title, description, category, price, preview_pages } = await request.json()

    // Fetch current document to get Stripe IDs
    const { data: currentDoc } = await db
      .from('documents')
      .select('stripe_product_id, stripe_price_id, price')
      .eq('id', documentId)
      .single()

    let newPriceId = currentDoc?.stripe_price_id || null

    if (currentDoc?.stripe_product_id) {
      // Update the Stripe product name/description
      await stripe.products.update(currentDoc.stripe_product_id, {
        name: title,
        description: description || undefined,
      })

      // If price changed: archive old price, create new one
      // Stripe prices are immutable — you can never edit unit_amount
      if (price !== currentDoc.price && currentDoc.stripe_price_id) {
        // Archive the old price
        await stripe.prices.update(currentDoc.stripe_price_id, { active: false })

        // Create new price on the same product
        const newPrice = await stripe.prices.create({
          product: currentDoc.stripe_product_id,
          unit_amount: Math.round(price * 100),
          currency: 'usd',
        })
        newPriceId = newPrice.id
      }
    }

    // Update document in DB
    const updatePayload: Record<string, unknown> = {
      title,
      description,
      category,
      price,
      preview_pages,
    }
    if (newPriceId !== currentDoc?.stripe_price_id) {
      updatePayload.stripe_price_id = newPriceId
    }

    const { error } = await db
      .from('documents')
      .update(updatePayload)
      .eq('id', documentId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Document update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
