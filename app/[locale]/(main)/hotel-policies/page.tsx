import type { Metadata } from "next"
import {
  BedDouble,
  CalendarX,
  CreditCard,
  Baby,
  CigaretteOff,
  PawPrint,
  Moon,
  Waves,
  ShieldAlert,
} from "lucide-react"

import { getTranslations, setRequestLocale } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getPublicHotelInfo } from "@/lib/content"

export const metadata: Metadata = {
  title: "Hotel Policies | Dosinia Luxury Hotel",
  description: "Check-in and check-out times, cancellation terms, and general house rules.",
}

const POLICIES = [
  { key: "smoking", icon: CigaretteOff },
  { key: "pets", icon: PawPrint },
  { key: "children", icon: Baby },
  { key: "quiet", icon: Moon },
  { key: "pool", icon: Waves },
  { key: "liability", icon: ShieldAlert },
] as const

export default async function HotelPoliciesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("hotelPolicies")
  const info = await getPublicHotelInfo(locale)

  const strong = (chunks: React.ReactNode) => <strong className="text-foreground">{chunks}</strong>
  const emailLink = () => (
    <a href="mailto:info@dosiniahotels.com" className="underline hover:text-primary transition-colors">
      info@dosiniahotels.com
    </a>
  )

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground leading-relaxed">
          {t("intro")}
        </p>
      </section>

      <Separator />

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BedDouble className="size-4 text-primary" />
              {t("checkInOut")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-1">
            <p>
              {t.rich("checkInLabel", { strong })}{" "}
              {info.checkInStart && info.checkInEnd
                ? `${info.checkInStart} – ${info.checkInEnd}`
                : t("checkInFallback")}
            </p>
            <p>
              {t.rich("checkOutLabel", { strong })}{" "}
              {t("checkOutUntil", { time: info.checkOut || "12:00" })}
            </p>
            <p>
              {t("earlyLate")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarX className="size-4 text-primary" />
              {t("cancellation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            {info.cancellationPolicy || t("cancellationFallback")}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              {t("payment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            {t("paymentP")}
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("houseRules")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {POLICIES.map((policy) => (
            <Card key={policy.key}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <policy.icon className="size-4 text-primary" />
                  {t(`policies.${policy.key}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {t(`policies.${policy.key}.content`)}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        {info.phone
          ? t.rich("contactWithPhone", {
              email: emailLink,
              phone: () => (
                <a href={`tel:${info.phone.replace(/\D/g, "")}`} className="underline hover:text-primary transition-colors">
                  {info.phone}
                </a>
              ),
            })
          : t.rich("contactBase", { email: emailLink })}
      </p>
    </main>
  )
}
