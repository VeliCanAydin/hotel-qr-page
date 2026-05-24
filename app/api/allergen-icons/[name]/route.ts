import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

const FILE_ALIASES: Record<string, string> = {
  shellfish: 'crustacean',
  dairy: 'milk',
  soy: 'soybean',
}

const ALLOWED = new Set([
  'nuts',
  'peanut',
  'gluten',
  'dairy',
  'shellfish',
  'soy',
  'egg',
  'sesame',
  'fish',
])

function fallbackSvg(name: string) {
  const label = name.charAt(0).toUpperCase() + name.slice(1)
  const bg = '#f8fafc'
  const ring = '#cbd5e1'
  const text = '#0f172a'

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none">
      <circle cx="128" cy="128" r="112" fill="${bg}" stroke="${ring}" stroke-width="8"/>
      <circle cx="128" cy="128" r="76" fill="#ffffff" stroke="${ring}" stroke-width="6"/>
      <text x="128" y="138" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="${text}">${label.slice(0, 1)}</text>
    </svg>
  `.trim()
}

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const requested = name.toLowerCase()

  if (!ALLOWED.has(requested) && !Object.prototype.hasOwnProperty.call(FILE_ALIASES, requested)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const fileName = FILE_ALIASES[requested] ?? requested
  const filePath = path.join(process.cwd(), 'allergen-icons', `${fileName}.png`)

  try {
    const image = await readFile(filePath)
    return new NextResponse(image, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse(fallbackSvg(requested), {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }
}
