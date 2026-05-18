import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'
import nodemailer from 'nodemailer'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://joan-website.vercel.app'

function makeTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

function makeSupabase(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') || ''

  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = makeSupabase(request)

  try {
    switch (event.type) {

      // ── Subscription created / updated ──────────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription & { current_period_end: number }
        const tier = (sub.metadata?.tier || 'basic') as string
        const userId = sub.metadata?.user_id

        await db.from('subscriptions').upsert({
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          user_id: userId || null,
          status: sub.status,
          tier,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }, { onConflict: 'stripe_subscription_id' })

        // Link subscription to business record
        if (userId) {
          await db
            .from('businesses')
            .update({ tier })
            .eq('user_id', userId)
            .in('status', ['pending', 'approved'])
        }
        break
      }

      // ── Subscription cancelled ──────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await db
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ── Payment failed ──────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string }
        if (invoice.subscription) {
          await db
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription)
        }
        break
      }

      // ── Checkout session completed (documents + subscriptions) ──────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const mode = session.mode
        const metadata = session.metadata || {}

        if (mode === 'payment' && metadata.documentId) {
          // Document purchase
          const documentId = metadata.documentId
          const buyerEmail = session.customer_details?.email || metadata.buyerEmail || ''

          // Record the purchase
          await db.from('document_purchases').insert({
            document_id: documentId,
            buyer_email: buyerEmail,
            stripe_payment_intent_id: session.payment_intent as string,
            amount_paid: (session.amount_total || 0) / 100,
          })

          // Get document info for email
          const { data: doc } = await db
            .from('documents')
            .select('title, full_file_path')
            .eq('id', documentId)
            .single()

          if (doc && buyerEmail) {
            // Generate a signed download URL (24h expiry)
            const { data: signedData } = await db.storage
              .from('documents-private')
              .createSignedUrl(doc.full_file_path, 86400)

            const downloadUrl = signedData?.signedUrl
              ? `${APP_URL}/store/download?url=${encodeURIComponent(signedData.signedUrl)}&title=${encodeURIComponent(doc.title)}`
              : null

            if (downloadUrl) {
              const transporter = makeTransporter()
              await transporter.sendMail({
                from: `"LaPai Management Solutions" <${process.env.GMAIL_USER}>`,
                to: buyerEmail,
                subject: `Your download: ${doc.title}`,
                html: `
                  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
                    <div style="background:#1a5c38;padding:32px;border-radius:12px 12px 0 0">
                      <p style="color:#c9960c;font-weight:900;font-size:18px;margin:0">LaPai Management Solutions</p>
                    </div>
                    <div style="background:#faf8f4;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
                      <h2 style="margin-top:0">Your document is ready</h2>
                      <p>Thank you for your purchase. Your document <strong>${doc.title}</strong> is ready to download.</p>
                      <p style="font-size:13px;color:#6b7280">This link expires in 24 hours. Keep it safe.</p>
                      <a href="${downloadUrl}"
                         style="display:inline-block;background:#1a5c38;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0">
                        Download Now
                      </a>
                      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
                      <p style="font-size:12px;color:#9ca3af">If you have any issues, reply to this email or contact us at Lapaisolutions@gmail.com</p>
                    </div>
                  </div>
                `,
              })
            }
          }
        }

        if (mode === 'subscription' && metadata.user_id) {
          // Business listing subscription — business record was already created, subscription will be handled by subscription.created event
          // Just ensure the business is linked when the sub event fires (metadata passes user_id)
        }

        break
      }

      default:
        // Unhandled events are fine — just log them
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}
