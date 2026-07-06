"use server"

import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { guestSupportRequests } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/auth'

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
  await requireAdmin('/dashboard/guests/support-requests')
  try {
    return await db.select().from(guestSupportRequests).orderBy(desc(guestSupportRequests.createdAt))
  } catch (err) {
    // If the table doesn't exist (dev environment without migrations), return empty list
    // and log error for visibility.
    // Caller pages should tolerate empty arrays.
    // eslint-disable-next-line no-console
    console.error('[getGuestSupportRequests] failed:', err)
    return []
  }
}

export type GuestSupportRequestUpdateInput = {
  staffResponse?: string
  status?: string
  staffResponseBy?: string
}

export async function updateGuestSupportRequest(
  requestId: number,
  input: GuestSupportRequestUpdateInput
): Promise<GuestSupportRequest | null> {
  await requireAdmin('/dashboard/guests/support-requests')
  const [updated] = await db
    .update(guestSupportRequests)
    .set({
      staffResponse: (input.staffResponse ?? '').trim(),
      status: input.status ?? 'open',
      staffResponseBy: input.staffResponseBy?.trim() ?? '',
      staffResponseAt: new Date(),
    })
    .where(eq(guestSupportRequests.id, requestId))
    .returning()

  return updated ?? null
}
