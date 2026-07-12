import { getTranslations, setRequestLocale } from "next-intl/server"
import BarCard from "@/components/bar-card"
import { getPublicBars } from "@/lib/content"

export default async function BarsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("bars")

  const bars = await getPublicBars(locale)

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">{t("title")}</h2>
      {bars.map((bar) => (
        <BarCard
          key={bar.id}
          id={bar.id}
          src={bar.image}
          alt={bar.name}
          title={bar.name}
          description={bar.description}
          openingHours={[bar.openTime?.slice(0, 5), bar.closeTime?.slice(0, 5)].filter(Boolean).join(" – ")}
          highlights={bar.highlights.split(",").map((h) => h.trim()).filter(Boolean)}
        />
      ))}
    </div>
  )
}
