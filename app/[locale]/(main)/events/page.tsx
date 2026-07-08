import { setRequestLocale } from "next-intl/server"
import { getPublicEvents } from "@/lib/content"
import type { HotelEvent } from "@/lib/types/events"
import EventsContent from "./events-content"

export default async function PageEvent({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const rows = await getPublicEvents(locale)
  const allEvents: HotelEvent[] = rows.map((e) => ({
    ...e,
    category: e.category as HotelEvent["category"],
    color: e.color ?? undefined,
  }))
  return <EventsContent allEvents={allEvents} />
}
