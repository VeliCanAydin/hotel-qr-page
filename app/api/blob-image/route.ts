import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const blobUrl = searchParams.get('url')

  // Strict host validation: the read-write token is attached to the upstream
  // request, so this must never fetch anything but our own blob store.
  let parsed: URL
  try {
    parsed = new URL(blobUrl ?? '')
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }
  const isBlobHost =
    parsed.hostname === 'blob.vercel-storage.com' ||
    parsed.hostname.endsWith('.blob.vercel-storage.com')
  if (parsed.protocol !== 'https:' || !isBlobHost) {
    return new NextResponse('Invalid url', { status: 400 })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return new NextResponse('Storage not configured', { status: 500 })
  }

  const upstream = await fetch(parsed, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!upstream.ok) {
    return new NextResponse('Not found', { status: upstream.status })
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
