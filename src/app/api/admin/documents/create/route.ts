import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, price, preview_pages, full_file_path } = body

    // Verify admin using service role
    const supabase = createServerClient(
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

    // Get current user from auth header
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (!user || userError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Insert document
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        title,
        description,
        category,
        price,
        preview_pages,
        full_file_path,
        is_published: true,
      })
      .select()
      .single()

    if (docError) {
      console.error('Document insert error:', docError)
      return NextResponse.json({ error: docError.message }, { status: 400 })
    }

    return NextResponse.json(docData, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
