import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Cookie, ShieldCheck, Database, Settings2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Cookie Policy | Dosinia Luxury Hotel",
  description: "How this website uses cookies and local storage.",
}

const code = (chunks: React.ReactNode) => <code className="text-foreground">{chunks}</code>
const strong = (chunks: React.ReactNode) => <strong className="text-foreground">{chunks}</strong>

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("cookiePolicy")
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Cookie className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {t("intro")}
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("whatWeUse")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                {t("essentialTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>{t.rich("essentialP1", { code })}</p>
              <p>{t.rich("essentialP2", { code })}</p>
              <p>{t.rich("essentialP3", { strong })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="size-4 text-primary" />
                {t("localStorageTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>{t("localP1")}</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t("localItem1")}</li>
                <li>{t("localItem2")}</li>
                <li>{t("localItem3")}</li>
              </ul>
              <p>{t("localP2")}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Settings2 className="size-5 text-primary" />
          {t("whatWeDont")}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("dontP")}
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{t("managing")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("managingP")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t.rich("questions", {
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
