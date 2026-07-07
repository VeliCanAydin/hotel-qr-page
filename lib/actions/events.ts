'use server'

import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'

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
}

export async function updateEvent(id: string, data: Omit<EventInput, 'id'>) {
  await requireAdmin('/dashboard/events/list')
  await db.update(events).set({ ...data, color: data.color ?? null }).where(eq(events.id, id))
  updateTag(CONTENT_TAGS.events)
}

export async function deleteEvent(id: string) {
  await requireAdmin('/dashboard/events/list')
  await db.delete(events).where(eq(events.id, id))
  updateTag(CONTENT_TAGS.events)
}
