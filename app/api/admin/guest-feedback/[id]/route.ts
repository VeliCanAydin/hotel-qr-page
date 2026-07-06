import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { isPageAllowedForSession } from '@/lib/page-access'
import { verifyToken, SESSION_COOKIE } from '@/lib/auth'
import { updateGuestFeedbackResponse } from '@/lib/actions/feedback'

const responseSchema = z.object({
  staffResponse: z.string().trim().max(4000).default(''),
  staffActionNote: z.string().trim().max(4000).default(''),
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

  if (!(await isPageAllowedForSession(session, '/dashboard/guests/feedback'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await context.params
  const feedbackId = Number(id)

  if (!Number.isInteger(feedbackId) || feedbackId <= 0) {
    return NextResponse.json({ error: 'Invalid feedback id' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const parsed = responseSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid response payload' }, { status: 400 })
  }

  const updatedFeedback = await updateGuestFeedbackResponse(feedbackId, {
    staffResponse: parsed.data.staffResponse,
    staffActionNote: parsed.data.staffActionNote,
    staffResponseBy: session.email,
  })

  if (!updatedFeedback) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
  }

  return NextResponse.json({ feedback: updatedFeedback })
}