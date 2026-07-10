'use server'

import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'
import { deleteTranslationsFor } from '@/lib/translations'
import { todayISO } from '@/lib/dates'
import { sendPushToActiveGuests, type PushPayload } from '@/lib/push'
import { eventAnnouncementPush } from '@/lib/push-messages'
import { LOCALES } from '@/i18n/routing'

type EventInput = {
  id: string
  title: string
  description: string
  location: string
  date: string
  startTime: string
  endTime: string
  category: string
  color?: string | null
}

export async function createEvent(event: EventInput) {
  await requireAdmin('/dashboard/events/list')
  await db.insert(events).values({ ...event, color: event.color ?? null })
  updateTag(CONTENT_TAGS.events)

  // Announce upcoming events to every in-house guest, each in their own
  // language. The event was just created so no translations exist yet — the
  // title/location stay in English inside a localized sentence.
  if (event.date >= todayISO()) {
    const payloads: Partial<Record<string, PushPayload>> = {}
    for (const locale of LOCALES) {
      payloads[locale] = eventAnnouncementPush(
        locale,
        event.title,
        event.date,
        event.startTime,
        event.location,
      )
    }
    await sendPushToActiveGuests(payloads)
  }
}

export async function updateEvent(id: string, data: Omit<EventInput, 'id'>) {
  await requireAdmin('/dashboard/events/list')
  // Rescheduling re-arms the "starting soon" reminder for the new time.
  const [existing] = await db
    .select({ date: events.date, startTime: events.startTime })
    .from(events)
    .where(eq(events.id, id))
    .limit(1)
  const rescheduled =
    existing && (existing.date !== data.date || existing.startTime !== data.startTime)

  await db
    .update(events)
    .set({
      ...data,
      color: data.color ?? null,
      ...(rescheduled ? { reminderSentAt: null } : {}),
    })
    .where(eq(events.id, id))
  updateTag(CONTENT_TAGS.events)
}

export async function deleteEvent(id: string) {
  await requireAdmin('/dashboard/events/list')
  await db.delete(events).where(eq(events.id, id))
  await deleteTranslationsFor('event', id)
  updateTag(CONTENT_TAGS.events)
}
