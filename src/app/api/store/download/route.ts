import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Generates a fresh 1-hour signed download URL for a purchased document.
 * Verifies the session_id against Stripe to confirm payment before serving.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const docId = searchParams.get('docId')

    if (!sessionId || !docId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const { stripe } = await import('@/lib/stripe')

    // Verify the Stripe checkout session was actually paid
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 403 })
    }

    if (session.metadata?.documentId !== docId) {
      return NextResponse.json({ error: 'Document mismatch' }, { status: 403 })
    }

    const db = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: doc } = await db
      .from('documents')
      .select('full_file_path, title')
      .eq('id', docId)
      .single()

    if (!doc?.full_file_path) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // 1-hour signed URL
    const { data: signed } = await db.storage
      .from('documents-private')
      .createSignedUrl(doc.full_file_path, 3600)

    if (!signed?.signedUrl) {
      return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 })
    }

    return NextResponse.json({ url: signed.signedUrl, title: doc.title })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
