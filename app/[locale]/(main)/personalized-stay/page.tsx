import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"

import PersonalizedStayPlanner from "@/components/guest/personalized-stay-planner"
import { getPublicEvents } from "@/lib/content"
import type { HotelEvent } from "@/lib/types/events"


export default async function PersonalizedStayPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("plan")
  const rows = await getPublicEvents()
  const allEvents: HotelEvent[] = rows.map((event) => ({
    ...event,
    category: event.category as HotelEvent['category'],
    color: event.color ?? undefined,
  }))

  const stayDates = Array.from(new Set(allEvents.map((event) => event.date))).sort()
  const stayEvents = allEvents.filter((event) => stayDates.includes(event.date))

  return (
    <div className="min-h-screen pb-8">
      <section className="relative h-[36vh] min-h-[24rem] overflow-hidden sm:h-[42vh] sm:min-h-80">
        <Image
          src="/dosinia_luxury_resort_main_building_front_view_main_pool.jpeg"
          alt="Dosinia Luxury Resort"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white sm:px-6">
          <p className="mb-3 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs backdrop-blur-sm sm:text-sm">
            {t("personalizedStay")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t("planYourAgenda")}</h1>
          <p className="mt-3 max-w-xl text-sm text-white/85 sm:max-w-2xl sm:text-base">
            {t("heroDesc")}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-3 pt-4 sm:px-4 sm:pt-6">
        <PersonalizedStayPlanner
          events={stayEvents}
          stayDates={stayDates}
          storageKey="dosinia-personalized-stay-plan-public"
          guestName="Guest"
        />
      </div>
    </div>
  )
}