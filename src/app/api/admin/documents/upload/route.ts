import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    // Get file from request
    console.log('Parsing form data...')
    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('File received:', { name: file?.name, size: file?.size, type: file?.type })

    if (!file) {
      console.error('No file in form data')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get current user - use anon key to verify auth
    const anonSupabase = createServerClient(
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

    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: { user }, error: userError } = await anonSupabase.auth.getUser(token)
    if (!user || userError) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify admin
    const { data: profile } = await anonSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Use service role for upload - this bypasses RLS
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {},
        },
      }
    )

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to storage using service role
    const fileName = `${Date.now()}_${file.name}`
    console.log('Uploading with service role:', fileName)

    const { error: uploadError } = await serviceSupabase.storage
      .from('documents-private')
      .upload(fileName, buffer, {
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    console.log('File uploaded successfully:', fileName)
    return NextResponse.json({ fileName })
  } catch (error) {
    console.error('API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('Detailed error:', errorMessage)
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    )
  }
}
