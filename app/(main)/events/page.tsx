import { getPublicEvents } from "@/lib/content"
import type { HotelEvent } from "@/lib/types/events"
import EventsContent from "./events-content"

export default async function PageEvent() {
  const rows = await getPublicEvents()
  const allEvents: HotelEvent[] = rows.map((e) => ({
    ...e,
    category: e.category as HotelEvent["category"],
    color: e.color ?? undefined,
  }))
  return <EventsContent allEvents={allEvents} />
}
