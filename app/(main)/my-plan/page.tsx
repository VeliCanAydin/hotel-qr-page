import MyPlanView from "@/components/guest/my-plan-view"
import { getPublicEvents } from "@/lib/content"
import type { HotelEvent } from "@/lib/types/events"


export default async function MyPlanPage() {
  const rows = await getPublicEvents()
  const allEvents: HotelEvent[] = rows.map((event) => ({
    ...event,
    category: event.category as HotelEvent["category"],
    color: event.color ?? undefined,
  }))

  return <MyPlanView events={allEvents} storageKey="dosinia-personalized-stay-plan-public" />
}