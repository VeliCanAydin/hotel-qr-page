import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createGuestFeedback } from '@/lib/actions/feedback'

const feedbackSchema = z.object({
  guest: z.object({
    name: z.string().optional().default(''),
    email: z.string().optional().default(''),
    roomNumber: z.string().optional().default(''),
    stayDates: z
      .object({
        from: z.string().nullable().optional(),
        to: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  }),
  ratings: z.object({
    overall: z.number().int().min(1).max(5),
    // Category ratings are null when the guest skipped the detailed section
    cleanliness: z.number().int().min(1).max(5).nullable(),
    staff: z.number().int().min(1).max(5).nullable(),
    comfort: z.number().int().min(1).max(5).nullable(),
    value: z.number().int().min(1).max(5).nullable(),
    food: z.number().int().min(1).max(5).nullable(),
    nps: z.number().int().min(0).max(10).nullable().optional(),
  }),
  feedback: z.object({
    positive: z.string().optional().default(''),
    negative: z.string().optional().default(''),
    tripType: z.string().optional().default(''),
  }),
  consent: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = feedbackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid feedback data.' },
        { status: 400 }
      )
    }

    const { guest, ratings, feedback, consent } = parsed.data

    await createGuestFeedback({
      guestName: guest.name,
      email: guest.email,
      roomNumber: guest.roomNumber,
      stayFrom: guest.stayDates?.from ?? '',
      stayTo: guest.stayDates?.to ?? '',
      tripType: feedback.tripType,
      overallRating: ratings.overall,
      cleanlinessRating: ratings.cleanliness,
      staffRating: ratings.staff,
      comfortRating: ratings.comfort,
      valueRating: ratings.value,
      foodRating: ratings.food,
      npsScore: ratings.nps ?? null,
      positive: feedback.positive,
      negative: feedback.negative,
      consent,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[feedback] submit error:', error)

    return NextResponse.json(
      { error: 'Feedback could not be saved. Please try again.' },
      { status: 500 }
    )
  }
}
