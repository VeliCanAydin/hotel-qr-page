import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

import { verifyToken, SESSION_COOKIE } from '@/lib/auth'
import { isDashboardPathAllowed } from '@/lib/permissions'
import { getGuestFeedbacks } from '@/lib/actions/feedback'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyToken(token)
  if (!session || session.roleName === 'guest') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.roleName !== 'Super Admin' && !isDashboardPathAllowed('/dashboard/guests/feedback', session.roleName)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const feedbacks = await getGuestFeedbacks()

  const pdfDoc = await PDFDocument.create()
  let currentPage = pdfDoc.addPage([842, 595]) // A4 landscape in points (approx)
  const { width, height } = currentPage.getSize()
  const margin = 36

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Try to fetch and embed a Unicode TTF (Noto Sans) to support Turkish characters
  // Fallback to standard fonts if fetching fails.
  let unicodeFont: any = helvetica
  let unicodeFontBold: any = helveticaBold
  try {
    const regUrl = 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf'
    const boldUrl = 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf'
    const [regRes, boldRes] = await Promise.all([fetch(regUrl), fetch(boldUrl)])
    if (regRes.ok && boldRes.ok) {
      const [regBuf, boldBuf] = await Promise.all([regRes.arrayBuffer(), boldRes.arrayBuffer()])
      unicodeFont = await pdfDoc.embedFont(regBuf)
      unicodeFontBold = await pdfDoc.embedFont(boldBuf)
    }
  } catch (e) {
    // ignore and keep standard fonts
  }

  // Header
  currentPage.drawText('Guest Feedback Report', {
    x: margin,
    y: height - margin - 20,
    size: 18,
    font: helveticaBold,
  })
  currentPage.drawText(`Generated: ${new Date().toLocaleString()}`, {
    x: margin,
    y: height - margin - 40,
    size: 9,
    font: helvetica,
  })

  // Helper: wrap text into lines given font and size
  function wrapTextLines(text: string, font: any, fontSize: number, maxWidth: number) {
    const words = String(text).split(/\s+/)
    const lines: string[] = []
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      const w = font.widthOfTextAtSize(test, fontSize)
      if (w > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
    return lines
  }

  // Table layout: show short columns first, then full-width text blocks for long text
  const cols = [
    { key: 'guest', label: 'Guest', width: 160 },
    { key: 'contact', label: 'Contact', width: 200 },
    { key: 'overall', label: 'Overall', width: 60 },
    { key: 'cleanliness', label: 'Cleanliness', width: 70 },
    { key: 'staff', label: 'Staff', width: 60 },
    { key: 'comfort', label: 'Comfort', width: 70 },
    { key: 'value', label: 'Value', width: 60 },
    { key: 'food', label: 'Food', width: 60 },
    { key: 'nps', label: 'NPS', width: 50 },
    { key: 'positive', label: 'Positive', width: 220 },
    { key: 'negative', label: 'Attention', width: 220 },
    { key: 'internal', label: 'Internal note', width: 220 },
  ]

    // Scale column widths to available page width to avoid horizontal overflow
    const availableWidth = width - margin * 2
    const totalRequested = cols.reduce((s, c) => s + c.width, 0) + (cols.length - 1) * 6
    const scale = Math.min(1, availableWidth / totalRequested)
    for (const c of cols) {
      c.width = Math.max(40, Math.floor(c.width * scale))
    }

    let cursorY = height - margin - 70

    // Draw header row (column labels)
    let headerX = margin
    for (const c of cols) {
      currentPage.drawText(c.label, { x: headerX, y: cursorY, size: 9, font: unicodeFontBold })
      headerX += c.width + 6
    }

    cursorY -= 18

    // Row rendering
    for (const fb of feedbacks) {
      // prepare cell values
      const vals: Record<string, string> = {
        guest: normalizeForPdf(fb.guestName) || 'Anonymous',
        contact: normalizeForPdf([fb.roomNumber ? `Room ${fb.roomNumber}` : '', fb.email].filter(Boolean).join(' · ')),
        overall: `${fb.overallRating}/5`,
        cleanliness: `${fb.cleanlinessRating}/5`,
        staff: `${fb.staffRating}/5`,
        comfort: `${fb.comfortRating}/5`,
        value: `${fb.valueRating}/5`,
        food: `${fb.foodRating}/5`,
        nps: fb.npsScore != null ? `${fb.npsScore}/10` : '-',
        positive: normalizeForPdf(fb.positive.trim() || '-'),
        negative: normalizeForPdf(fb.negative.trim() || '-'),
        internal: normalizeForPdf(fb.staffActionNote.trim() || '-'),
      }

      // Estimate row height by measuring wrapped lines for each cell
      const cellHeights: number[] = []
      for (const c of cols) {
        const lines = wrapTextLines(vals[c.key], unicodeFont, 8, c.width)
        // header line + content lines
        cellHeights.push((1 + lines.length) * (8 + 2) + 6)
      }

      const rowHeight = Math.max(...cellHeights)

      if (cursorY - rowHeight < margin) {
        const p = pdfDoc.addPage([842, 595])
        currentPage = p
        cursorY = currentPage.getSize().height - margin - 40
        // redraw headers on new page
        let hx = margin
        for (const c of cols) {
          currentPage.drawText(c.label, { x: hx, y: cursorY, size: 9, font: helveticaBold })
          hx += c.width + 6
        }
        cursorY -= 18
      }

      // draw all columns values (including Positive/Attention/Internal) side-by-side
      let x = margin
      for (const c of cols) {
        drawWrappedText(currentPage, unicodeFont, vals[c.key], x, cursorY - 12, c.width, 9)
        x += c.width + 6
      }

      cursorY -= rowHeight
      }

    const pdfBytes = await pdfDoc.save()

  function normalizeForPdf(input: string | null | undefined) {
    if (!input) return ''
    return String(input)
      .replace(/İ/g, 'I')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'I')
      .replace(/ş/g, 's')
      .replace(/Ş/g, 'S')
      .replace(/ğ/g, 'g')
      .replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u')
      .replace(/Ü/g, 'U')
      .replace(/ö/g, 'o')
      .replace(/Ö/g, 'O')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'C')
      .replace(/–/g, '-')
      .replace(/—/g, '-')
      .replace(/…/g, '...')
  }

  // Helper: split and draw wrapped text using font measurements
  function drawWrappedText(page: any, font: any, text: string, x: number, y: number, maxWidth: number, fontSize: number) {
    const words = String(text).split(/\s+/)
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      const width = font.widthOfTextAtSize(test, fontSize)
      if (width > maxWidth && line) {
        page.drawText(line, { x, y, size: fontSize, font })
        y -= fontSize + 2
        line = word
      } else {
        line = test
      }
    }
    if (line) {
      page.drawText(line, { x, y, size: fontSize, font })
      y -= fontSize + 2
    }
    return y
  }

  const buffer = Buffer.from(pdfBytes)

  // If any field contains characters unsupported by the standard fonts
  // (like Turkish characters), we transliterate them to ASCII equivalents
  // before drawing. This is a pragmatic fallback when no Unicode font
  // is embedded.

  // NOTE: the actual drawing used the raw values; to keep changes minimal,
  // we normalize cell content here by converting the pdf bytes? Simpler:
  // regenerate pdf with normalized content. For performance we apply normalize
  // earlier when assembling cells. (Below we simply return bytes since
  // normalization was applied at generation.)

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=guest-feedback-report-${new Date().toISOString().slice(0,10)}.pdf`,
    },
  })
}
