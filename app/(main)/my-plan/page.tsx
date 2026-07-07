import { asc } from "drizzle-orm"

import MyPlanView from "@/components/guest/my-plan-view"
import { db } from "@/lib/db"
import { events } from "@/lib/db/schema"
import type { HotelEvent } from "@/lib/types/events"

export const dynamic = "force-dynamic"

export default async function MyPlanPage() {
  const rows = await db.select().from(events).orderBy(asc(events.date), asc(events.startTime), asc(events.title))
  const allEvents: HotelEvent[] = rows.map((event) => ({
    ...event,
    category: event.category as HotelEvent["category"],
    color: event.color ?? undefined,
  }))

  return <MyPlanView events={allEvents} storageKey="dosinia-personalized-stay-plan-public" />
}