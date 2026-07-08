import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ShieldCheck, PartyPopper, SmilePlus } from "lucide-react"
import Benefits from "@/components/kids-care/benefits"
import ServiceCard from "@/components/kids-care/service-card"
import { getPublicKidsContent } from "@/lib/content"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default async function KidsCarePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("kidsCare")
  const { services, serviceItems: items, activities: activityRows } = await getPublicKidsContent(locale)

  const itemsByService: Record<string, { trigger: string; content: string }[]> = {}
  for (const item of items) {
    if (!itemsByService[item.serviceId]) itemsByService[item.serviceId] = []
    itemsByService[item.serviceId].push({ trigger: item.trigger, content: item.content })
  }

  const scheduleByService: Record<string, { day: string; activities: { time: string; event: string }[] }[]> = {}
  for (const service of services) {
    const serviceRows = activityRows.filter((r) => r.serviceId === service.id)
    if (serviceRows.length > 0) {
      scheduleByService[service.id] = DAYS.map((day) => ({
        day,
        activities: serviceRows
          .filter((r) => r.day === day)
          .map((r) => ({ time: r.time, event: r.event })),
      }))
    }
  }

  return (
    <div className="flex flex-col p-4 gap-4">
      <div className="relative w-full h-[200px] rounded-3xl overflow-hidden">
        <Image src="/kids-care.png" alt="Kids Care" fill className="object-cover" />
      </div>
      <p>{t("intro")}</p>
      <div className="grid grid-cols-3 gap-3">
        <Benefits icon={ShieldCheck} title={t("certifiedStaff")} content={t("certifiedStaffDesc")} />
        <Benefits icon={PartyPopper} title={t("allAges")} content={t("allAgesDesc")} />
        <Benefits icon={SmilePlus} title={t("creativePlay")} content={t("creativePlayDesc")} />
      </div>

      {services.map((service) => (
        <ServiceCard
          key={service.id}
          data={{
            image: service.image || "/kids-club.png",
            imageAlt: service.imageAlt || service.title,
            title: service.title,
            description: service.description,
            accordionItems: itemsByService[service.id] ?? [],
            schedule: scheduleByService[service.id],
          }}
        />
      ))}
    </div>
  )
}
