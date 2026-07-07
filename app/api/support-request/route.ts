import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createGuestSupportRequest } from '@/lib/actions/support-requests'

const supportSchema = z.object({
  guestName: z.string().optional().default(''),
  roomNumber: z.string().optional().default(''),
  requestType: z.enum(['support', 'complaint']),
  issueCategory: z.string().trim().min(2).max(80),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
  imageUrl: z.string().trim().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = supportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid support/complaint data.' }, { status: 400 })
    }

    await createGuestSupportRequest(parsed.data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[support-request] submit error:', error)
    return NextResponse.json(
      { error: 'Support/complaint request could not be saved. Please try again.' },
      { status: 500 }
    )
  }
}
