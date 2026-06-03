import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import ExcelJS from 'exceljs'

import { isDashboardPathAllowed } from '@/lib/permissions'
import { verifyToken, SESSION_COOKIE } from '@/lib/auth'
import { getGuestSupportRequests } from '@/lib/actions/support-requests'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = await verifyToken(token)
  if (!session || session.roleName === 'guest') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.roleName !== 'Super Admin' && !isDashboardPathAllowed('/dashboard/guests/support-requests', session.roleName)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const requests = await getGuestSupportRequests()

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Support Requests')

  sheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Guest Name', key: 'guestName', width: 24 },
    { header: 'Room Number', key: 'roomNumber', width: 12 },
    { header: 'Type', key: 'requestType', width: 12 },
    { header: 'Category', key: 'issueCategory', width: 20 },
    { header: 'Subject', key: 'subject', width: 30 },
    { header: 'Message', key: 'message', width: 50 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Staff Response', key: 'staffResponse', width: 50 },
    { header: 'Staff Response By', key: 'staffResponseBy', width: 24 },
    { header: 'Staff Response At', key: 'staffResponseAt', width: 24 },
    { header: 'Created At', key: 'createdAt', width: 24 },
  ]

  requests.forEach((r) => {
    sheet.addRow({
      id: r.id,
      guestName: r.guestName,
      roomNumber: r.roomNumber,
      requestType: r.requestType,
      issueCategory: r.issueCategory,
      subject: r.subject,
      message: r.message,
      status: r.status,
      staffResponse: r.staffResponse,
      staffResponseBy: r.staffResponseBy,
      staffResponseAt: r.staffResponseAt ? new Date(r.staffResponseAt).toLocaleString('en-GB') : '',
      createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString('en-GB') : '',
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="support-requests.xlsx"',
    },
  })
}
