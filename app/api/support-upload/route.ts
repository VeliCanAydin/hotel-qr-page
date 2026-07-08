import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    // `error` values are keys in the `errors` messages namespace — the client translates them.
    if (!file || !file.size) {
      return NextResponse.json({ error: 'noFile' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'notImageFile' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'fileTooLarge' }, { status: 400 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const blob = await put(`support/${Date.now()}-${safeName}`, file, {
      access: 'private',
      contentType: file.type,
    })

    const proxyUrl = `/api/blob-image?url=${encodeURIComponent(blob.url)}`
    return NextResponse.json({ url: proxyUrl })
  } catch (error) {
    console.error('[support-upload] error:', error)
    return NextResponse.json({ error: 'uploadFailed' }, { status: 500 })
  }
}
