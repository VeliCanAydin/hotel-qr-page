import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { isPageAllowedForSession } from '@/lib/page-access'
import { verifyToken, SESSION_COOKIE } from '@/lib/auth'
import { updateGuestSupportRequest } from '@/lib/actions/support-requests'

const responseSchema = z.object({
  staffResponse: z.string().trim().max(4000).optional(),
  status: z.string().trim().max(50).optional(),
})

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = await verifyToken(token)
  if (!session || session.roleName === 'guest') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!(await isPageAllowedForSession(session, '/dashboard/guests/support-requests'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await context.params
  const reqId = Number(id)
  if (!Number.isInteger(reqId) || reqId <= 0) {
    return NextResponse.json({ error: 'Invalid request id' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const parsed = responseSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const updated = await updateGuestSupportRequest(reqId, {
    staffResponse: parsed.data.staffResponse ?? '',
    status: parsed.data.status ?? 'open',
    staffResponseBy: session.email,
  })

  if (!updated) {
    return NextResponse.json({ error: 'Support request not found' }, { status: 404 })
  }

  return NextResponse.json({ request: updated })
}
