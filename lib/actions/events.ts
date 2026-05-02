'use server'

import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

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
  await db.insert(events).values({ ...event, color: event.color ?? null })
  revalidatePath('/events')
}

export async function updateEvent(id: string, data: Omit<EventInput, 'id'>) {
  await db.update(events).set({ ...data, color: data.color ?? null }).where(eq(events.id, id))
  revalidatePath('/events')
}

export async function deleteEvent(id: string) {
  await db.delete(events).where(eq(events.id, id))
  revalidatePath('/events')
}
