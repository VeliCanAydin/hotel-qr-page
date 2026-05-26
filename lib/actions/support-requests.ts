'use server'

import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { guestSupportRequests } from '@/lib/db/schema'

export type GuestSupportRequest = typeof guestSupportRequests.$inferSelect

export type GuestSupportRequestInput = {
  guestName?: string
  roomNumber?: string
  requestType: 'support' | 'complaint'
  issueCategory: string
  subject: string
  message: string
  imageUrl: string
}

export async function createGuestSupportRequest(input: GuestSupportRequestInput) {
  await db.insert(guestSupportRequests).values({
    guestName: input.guestName?.trim() ?? '',
    roomNumber: input.roomNumber?.trim() ?? '',
    requestType: input.requestType,
    issueCategory: input.issueCategory,
    subject: input.subject.trim(),
    message: input.message.trim(),
    imageUrl: input.imageUrl.trim(),
    status: 'open',
    staffResponse: '',
    staffResponseBy: '',
    staffResponseAt: null,
  })
}

export async function getGuestSupportRequests(): Promise<GuestSupportRequest[]> {
  return db.select().from(guestSupportRequests).orderBy(desc(guestSupportRequests.createdAt))
}
