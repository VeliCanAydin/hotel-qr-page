import { db } from "@/lib/db"
import { events } from "@/lib/db/schema"
import { asc } from "drizzle-orm"
import type { HotelEvent } from "@/lib/types/events"
import EventsContent from "./events-content"

export default async function PageEvent() {
  const rows = await db.select().from(events).orderBy(asc(events.date))
  const allEvents: HotelEvent[] = rows.map((e) => ({
    ...e,
    category: e.category as HotelEvent["category"],
    color: e.color ?? undefined,
  }))
  return <EventsContent allEvents={allEvents} />
}
