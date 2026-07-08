import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ScrollText, UserCheck, FileText, Mail } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "KVKK | Dosinia Luxury Hotel",
  description:
    "Personal data protection notice under the Turkish Personal Data Protection Law (KVKK, Law No. 6698).",
}

const DATA_KEYS = ["identity", "contact", "requests", "order"] as const
const RIGHT_KEYS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9"] as const

export default async function KvkkPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("kvkk")
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ScrollText className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {t.rich("intro", { strong: (chunks) => <strong className="text-foreground">{chunks}</strong> })}
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          {t("dataWeProcess")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {DATA_KEYS.map((key) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-base">{t(`data.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {t(`data.${key}.detail`)}
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("legalBasis")}
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("retention")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("retentionP")}
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UserCheck className="size-5 text-primary" />
          {t("yourRights")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("rightsIntro")}
        </p>
        <ul className="flex flex-col gap-2">
          {RIGHT_KEYS.map((key) => (
            <li key={key} className="flex items-start gap-3 p-3 rounded-lg border bg-card text-sm">
              <UserCheck className="size-4 text-primary mt-0.5 shrink-0" />
              <span>{t(`rights.${key}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Mail className="size-5 text-primary" />
          {t("howToApply")}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t.rich("applyP", {
            email: () => (
              <a href="mailto:info@dosiniahotels.com" className="underline hover:text-primary transition-colors">
                info@dosiniahotels.com
              </a>
            ),
          })}
        </p>
      </section>
    </main>
  )
}
