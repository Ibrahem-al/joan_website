import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { PDFDocument, rgb } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    // Verify admin using anon key + auth
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

    // Check authentication
    const { data: { user } } = await anonSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await anonSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      )
    }

    // Use service role for all file operations (bypasses RLS)
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

    // Fetch document from database
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    if (!document.full_file_path) {
      return NextResponse.json(
        { error: 'No PDF file found for this document' },
        { status: 400 }
      )
    }

    // Download full PDF from private bucket using service role
    const { data: pdfData, error: downloadError } = await serviceSupabase.storage
      .from('documents-private')
      .download(document.full_file_path)

    if (downloadError || !pdfData) {
      console.error('PDF download error:', downloadError)
      return NextResponse.json(
        { error: 'Failed to download PDF' },
        { status: 500 }
      )
    }

    // Read PDF into buffer
    const pdfBuffer = await pdfData.arrayBuffer()

    // Load PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const totalPages = pdfDoc.getPageCount()
    const previewPages = Math.min(document.preview_pages, totalPages)

    // Create new PDF with only preview pages
    const previewDoc = await PDFDocument.create()
    const indicesToCopy = Array.from({ length: previewPages }, (_, i) => i)
    const copiedPages = await previewDoc.copyPages(pdfDoc, indicesToCopy)

    copiedPages.forEach((page) => {
      previewDoc.addPage(page)
    })

    // Add diagonal watermark to each page (top-right to bottom-left)
    const pages = previewDoc.getPages()
    const watermarkText = 'PREVIEW ONLY'
    const fontSize = 80

    pages.forEach((page) => {
      const { width, height } = page.getSize()

      // Draw diagonal watermark from top-right to bottom-left
      // Repeat every 250 pixels along the diagonal
      const spacing = 250
      const diagonalLength = Math.sqrt(width * width + height * height) * 1.5

      for (let i = -diagonalLength; i < diagonalLength; i += spacing) {
        page.drawText(watermarkText, {
          x: width - (i / Math.sqrt(2)),
          y: height - (i / Math.sqrt(2)),
          size: fontSize,
          color: rgb(0.6, 0.6, 0.6),
          opacity: 0.15,
          rotate: 315, // 45 degrees from top-right to bottom-left
        })
      }
    })

    // Save preview PDF to bytes
    const previewPdfBytes = await previewDoc.save()
    const previewBuffer = Buffer.from(previewPdfBytes)

    // Upload preview PDF to public bucket using service role
    const previewFileName = `preview_${documentId}.pdf`
    const { error: uploadError } = await serviceSupabase.storage
      .from('documents-preview')
      .upload(previewFileName, previewBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('Preview upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload preview PDF' },
        { status: 500 }
      )
    }

    // Get public URL for the preview
    const { data: urlData } = serviceSupabase.storage
      .from('documents-preview')
      .getPublicUrl(previewFileName)

    const previewUrl = urlData.publicUrl

    // Update document with preview path using service role
    const { error: updateError } = await serviceSupabase
      .from('documents')
      .update({ preview_file_path: previewFileName })
      .eq('id', documentId)

    if (updateError) {
      console.error('Document update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    return NextResponse.json({ previewUrl, success: true })
  } catch (error) {
    console.error('PDF processing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
