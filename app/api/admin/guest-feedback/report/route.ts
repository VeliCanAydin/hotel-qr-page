import { format } from 'date-fns'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

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

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Hotel QR Page'
  workbook.lastModifiedBy = 'Hotel QR Page'
  workbook.created = new Date()
  workbook.modified = new Date()
  workbook.properties.date1904 = false

  const worksheet = workbook.addWorksheet('Guest Feedback', {
    views: [{ state: 'frozen', ySplit: 1 }],
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  })

  worksheet.columns = [
    { header: 'Created At', key: 'createdAt', width: 19 },
    { header: 'Guest', key: 'guest', width: 20 },
    { header: 'Contact', key: 'contact', width: 28 },
    { header: 'Trip', key: 'tripType', width: 12 },
    { header: 'Consent', key: 'consent', width: 10 },
    { header: 'Overall', key: 'overall', width: 10 },
    { header: 'Cleanliness', key: 'cleanliness', width: 12 },
    { header: 'Staff', key: 'staff', width: 10 },
    { header: 'Comfort', key: 'comfort', width: 10 },
    { header: 'Value', key: 'value', width: 10 },
    { header: 'Food', key: 'food', width: 10 },
    { header: 'NPS', key: 'nps', width: 8 },
    { header: 'Positive', key: 'positive', width: 34 },
    { header: 'Attention', key: 'negative', width: 34 },
    { header: 'Internal note', key: 'internal', width: 34 },
  ]

  const headerRow = worksheet.getRow(1)
  headerRow.height = 22
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' },
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
      left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
      bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } },
      right: { style: 'thin', color: { argb: 'FF9CA3AF' } },
    }
  })

  worksheet.addRows(
    feedbacks.map((feedback) => {
      const createdAt = feedback.createdAt ? format(feedback.createdAt, 'dd/MM/yyyy HH:mm') : '-'
      const guest = feedback.guestName?.trim() || 'Anonymous'
      const contact = [feedback.roomNumber ? `Room ${feedback.roomNumber}` : '', feedback.email].filter(Boolean).join(' · ')
      return {
        createdAt,
        guest,
        contact: contact || '-',
        tripType: feedback.tripType || '-',
        consent: feedback.consent ? 'Yes' : 'No',
        overall: `${feedback.overallRating}/5`,
        cleanliness: `${feedback.cleanlinessRating}/5`,
        staff: `${feedback.staffRating}/5`,
        comfort: `${feedback.comfortRating}/5`,
        value: `${feedback.valueRating}/5`,
        food: `${feedback.foodRating}/5`,
        nps: feedback.npsScore != null ? `${feedback.npsScore}/10` : '-',
        positive: feedback.positive?.trim() || '-',
        negative: feedback.negative?.trim() || '-',
        internal: feedback.staffActionNote?.trim() || '-',
      }
    })
  )

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return

    let maxLines = 1
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      }

      const value = String(cell.value ?? '')
      const lineCount = Math.max(1, value.split(/\r?\n/).length, Math.ceil(value.length / 28))
      if (lineCount > maxLines) maxLines = lineCount
    })

    row.height = Math.min(Math.max(18, maxLines * 15), 120)
  })

  worksheet.autoFilter = {
    from: 'A1',
    to: 'O1',
  }

  worksheet.views = [{ state: 'frozen', ySplit: 1 }]

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer())

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=guest-feedback-report-${new Date().toISOString().slice(0,10)}.xlsx`,
    },
  })
}
