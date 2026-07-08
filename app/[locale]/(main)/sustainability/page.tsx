import { getTranslations, setRequestLocale } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Leaf,
  Users,
  ShoppingBag,
  Zap,
  Star,
  Recycle,
  FlaskConical,
  Sailboat,
  UtensilsCrossed,
  Landmark,
  Award,
  FileDown,
} from "lucide-react"

export default async function SustainabilityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("sustainability")
  const strong = (chunks: React.ReactNode) => <strong className="text-foreground">{chunks}</strong>
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-10">

      {/* Hero */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Leaf className="size-6 text-green-600 dark:text-green-400" />
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {t("intro")}
        </p>
      </section>

      <Separator />

      {/* Stats — Bento Grid */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("impactNumbers")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

          {/* Local employment — wide card */}
          <Card className="col-span-2 md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-blue-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("localEmployment")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">56%</span>
                <div className="mb-1 flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">2023: 3%</Badge>
                  <span className="text-xs text-muted-foreground">→</span>
                  <Badge className="text-xs bg-blue-600 hover:bg-blue-600">2024: 56%</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t("localEmploymentDesc")}
              </p>
            </CardContent>
          </Card>

          {/* Renewable energy */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-yellow-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("renewable")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">7%</span>
              <p className="text-sm text-muted-foreground mt-1">{t("renewableDesc")}</p>
            </CardContent>
          </Card>

          {/* Local suppliers */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-emerald-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("localSuppliers")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">80%</span>
              <p className="text-sm text-muted-foreground mt-1">{t("localSuppliersDesc")}</p>
            </CardContent>
          </Card>

          {/* Women in workforce */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-purple-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("women")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">35%</span>
                <Badge variant="outline" className="mb-1 text-xs">{t("womenBadge")}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t("womenDesc")}</p>
            </CardContent>
          </Card>

          {/* Guest satisfaction */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-orange-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("guestSat")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">4.5</span>
                  <span className="text-sm text-muted-foreground">/ 5 Tripadvisor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">4.4</span>
                  <span className="text-sm text-muted-foreground">/ 5 Google</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      <Separator />

      {/* Environment & Waste */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Recycle className="size-5 text-green-600 dark:text-green-400" />
          {t("envWaste")}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Recycle className="size-4 text-green-500" />
                {t("zeroWaste")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {t("zeroWasteDesc")}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="size-4 text-cyan-500" />
                {t("chemical")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {t("chemicalDesc")}
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Social & Cultural */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Landmark className="size-5 text-indigo-500" />
          {t("social")}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sailboat className="size-4 text-sky-500" />
                {t("sportsSponsorship")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {t.rich("sportsSponsorshipDesc", { strong })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UtensilsCrossed className="size-4 text-amber-500" />
                {t("culturalHeritage")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {t.rich("culturalHeritageDesc", { strong })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="size-4 text-indigo-500" />
                {t("naturalHeritage")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {t.rich("naturalHeritageDesc", { strong })}
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Certificates */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Award className="size-5 text-yellow-500" />
          {t("certificates")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("certificatesDesc")}
        </p>
        <div className="flex flex-col gap-2">
          {(["c1", "c2", "c3"] as const).map((key) => (
            <div key={key} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Award className="size-4 text-yellow-500 mt-0.5 shrink-0" />
              <span className="text-sm">{t(`certs.${key}`)}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Reports */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileDown className="size-5 text-primary" />
          {t("reports")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("reportsDesc")}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("report2024")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                {t("report2024Desc")}
              </p>
              <Button asChild variant="outline" className="gap-2 w-fit">
                <a href="/reports/dosinia-sustainability-report-2024.pdf" download>
                  <FileDown className="size-4" />
                  {t("downloadPdf")}
                </a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("report2023")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                {t("report2023Desc")}
              </p>
              <Button asChild variant="outline" className="gap-2 w-fit">
                <a href="/reports/dosinia-sustainability-report-2023.pdf" download>
                  <FileDown className="size-4" />
                  {t("downloadPdf")}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground">
          {t.rich("pdfNote", {
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
