import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import ServiceCard from "@/components/spa-wellness/service-card"
import { getPublicSpaServices } from "@/lib/content"

export default async function SpaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("spa")
  const services = await getPublicSpaServices(locale)

  return (
    <div className="min-h-screen">
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src="/spa/EVG00994-Enhanced-NR-HDR-Edit.jpeg"
          alt="Beach & Pools Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
          <Badge variant="secondary" className="mb-4 text-sm">
            {t("badge")}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center">
            Dosinia Spa
          </h1>
        </div>
      </section>

      <div className="flex flex-col p-4 gap-4">
        <p className="text-muted-foreground text-lg leading-relaxed">
          {t("intro")}
        </p>
        <h2 className="text-3xl font-bold mb-4">{t("services")}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              data={{
                image: service.image,
                imageAlt: service.imageAlt,
                title: service.name,
                description: service.description,
                hours: service.openTime && service.closeTime
                  ? `${service.openTime.slice(0, 5)} – ${service.closeTime.slice(0, 5)}`
                  : service.openTime?.slice(0, 5) || service.closeTime?.slice(0, 5) || '',
                isPaid: !service.isFree,
                reservationRequired: service.requiresReservation,
                badges: service.tags ? service.tags.split(',').filter(Boolean).map((t) => t.trim()) : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
