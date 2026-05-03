import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { menuItemImages } from '@/lib/db/schema'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const itemId = formData.get('itemId') as string | null

    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!itemId) {
      return NextResponse.json({ error: 'No itemId provided' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 4 MB)' }, { status: 400 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const blob = await put(`menu/${itemId}-${safeName}`, file, {
      access: 'private',
      contentType: file.type,
    })

    const proxyUrl = `/api/blob-image?url=${encodeURIComponent(blob.url)}`

    await db
      .insert(menuItemImages)
      .values({ itemId, proxyUrl })
      .onConflictDoUpdate({ target: menuItemImages.itemId, set: { proxyUrl } })

    return NextResponse.json({ url: proxyUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[upload] error:', message, err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
