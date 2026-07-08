import { setRequestLocale } from "next-intl/server"
import MyPlanView from "@/components/guest/my-plan-view"
import { getPublicEvents } from "@/lib/content"
import type { HotelEvent } from "@/lib/types/events"


export default async function MyPlanPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const rows = await getPublicEvents(locale)
  const allEvents: HotelEvent[] = rows.map((event) => ({
    ...event,
    category: event.category as HotelEvent["category"],
    color: event.color ?? undefined,
  }))

  return <MyPlanView events={allEvents} storageKey="dosinia-personalized-stay-plan-public" />
}