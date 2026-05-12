import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// TODO: Install stripe package: npm install stripe
// import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    // const sig = request.headers.get('stripe-signature') || ''

    // TODO: Verify webhook signature
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   sig,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // )

    const event = JSON.parse(body)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    // Use service role for webhook operations
    const serviceRoleSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        // Update subscription in database
        await serviceRoleSupabase.from('subscriptions').upsert({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          status: subscription.status,
          tier: subscription.metadata?.tier || 'basic',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await serviceRoleSupabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        await serviceRoleSupabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', invoice.subscription)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const documentId = paymentIntent.metadata?.documentId

        if (documentId) {
          // Create document purchase record
          await serviceRoleSupabase.from('document_purchases').insert({
            document_id: documentId,
            buyer_email: paymentIntent.receipt_email || 'unknown@example.com',
            stripe_payment_intent_id: paymentIntent.id,
            amount_paid: paymentIntent.amount / 100,
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
