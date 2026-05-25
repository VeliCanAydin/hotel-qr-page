'use server'

import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { guestFeedbacks } from '@/lib/db/schema'

export type GuestFeedback = typeof guestFeedbacks.$inferSelect

export type GuestFeedbackInput = {
  guestName?: string
  email?: string
  roomNumber?: string
  stayFrom?: string
  stayTo?: string
  tripType?: string
  overallRating: number
  cleanlinessRating: number
  staffRating: number
  comfortRating: number
  valueRating: number
  foodRating: number
  npsScore?: number | null
  positive?: string
  negative?: string
  consent?: boolean
}

export type GuestFeedbackResponseInput = {
  staffResponse: string
  staffActionNote: string
  staffResponseBy?: string
}

export async function createGuestFeedback(input: GuestFeedbackInput) {
  await db.insert(guestFeedbacks).values({
    guestName: input.guestName?.trim() ?? '',
    email: input.email?.trim() ?? '',
    roomNumber: input.roomNumber?.trim() ?? '',
    stayFrom: input.stayFrom?.trim() ?? '',
    stayTo: input.stayTo?.trim() ?? '',
    tripType: input.tripType?.trim() ?? '',
    overallRating: input.overallRating,
    cleanlinessRating: input.cleanlinessRating,
    staffRating: input.staffRating,
    comfortRating: input.comfortRating,
    valueRating: input.valueRating,
    foodRating: input.foodRating,
    npsScore: input.npsScore ?? null,
    positive: input.positive?.trim() ?? '',
    negative: input.negative?.trim() ?? '',
    staffResponse: '',
    staffActionNote: '',
    staffResponseBy: '',
    staffResponseAt: null,
    consent: input.consent ?? false,
  })
}

export async function getGuestFeedbacks(): Promise<GuestFeedback[]> {
  return db.select().from(guestFeedbacks).orderBy(desc(guestFeedbacks.createdAt))
}

export async function updateGuestFeedbackResponse(
  feedbackId: number,
  input: GuestFeedbackResponseInput
): Promise<GuestFeedback | null> {
  const [updatedFeedback] = await db
    .update(guestFeedbacks)
    .set({
      staffResponse: input.staffResponse.trim(),
      staffActionNote: input.staffActionNote.trim(),
      staffResponseBy: input.staffResponseBy?.trim() ?? '',
      staffResponseAt: new Date(),
    })
    .where(eq(guestFeedbacks.id, feedbackId))
    .returning()

  return updatedFeedback ?? null
}
