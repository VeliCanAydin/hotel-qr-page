import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file was provided.' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files can be uploaded.' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be 5 MB or less.' }, { status: 400 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const blob = await put(`support/${Date.now()}-${safeName}`, file, {
      access: 'private',
      contentType: file.type,
    })

    const proxyUrl = `/api/blob-image?url=${encodeURIComponent(blob.url)}`
    return NextResponse.json({ url: proxyUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    console.error('[support-upload] error:', message, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
