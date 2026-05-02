export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import { type HotelEvent } from '@/lib/data/events'
import EventsClient from './events-client'

export default async function EventsListPage() {
  const rows = await db.select().from(events).orderBy(asc(events.date))
  const typed: HotelEvent[] = rows.map((e) => ({
    ...e,
    category: e.category as HotelEvent['category'],
    color: e.color ?? undefined,
  }))
  return <EventsClient initialEvents={typed} />
}
