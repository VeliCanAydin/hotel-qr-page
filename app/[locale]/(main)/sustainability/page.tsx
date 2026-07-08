import { setRequestLocale } from "next-intl/server"
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
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-10">

      {/* Hero */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Leaf className="size-6 text-green-600 dark:text-green-400" />
          <h1 className="text-2xl font-bold">Our Sustainability Vision</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Knowing that our natural resources are not infinite, we monitor our consumption and act in harmony
          with our environment to leave a more liveable world for future generations. We view sustainability
          not as an individual goal but as a collective responsibility, integrating it into all our operations.
        </p>
      </section>

      <Separator />

      {/* Stats — Bento Grid */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Our Impact by the Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

          {/* Local employment — wide card */}
          <Card className="col-span-2 md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-blue-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Local Employment Rate</CardTitle>
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
                Supporting regional development through local hiring
              </p>
            </CardContent>
          </Card>

          {/* Renewable energy */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-yellow-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Renewable Energy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">7%</span>
              <p className="text-sm text-muted-foreground mt-1">of total energy consumption</p>
            </CardContent>
          </Card>

          {/* Local suppliers */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-emerald-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Local Suppliers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">80%</span>
              <p className="text-sm text-muted-foreground mt-1">for the past two consecutive years</p>
            </CardContent>
          </Card>

          {/* Women in workforce */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-purple-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Women in Workforce</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">35%</span>
                <Badge variant="outline" className="mb-1 text-xs">↑ from 31%</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">16% in management positions</p>
            </CardContent>
          </Card>

          {/* Guest satisfaction */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-orange-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Guest Satisfaction</CardTitle>
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
          Environment &amp; Waste Management
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Recycle className="size-4 text-green-500" />
                Zero Waste Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              We sort waste at the source across all operational areas and monitor it in dedicated temporary
              storage zones to ensure proper disposal — working towards a zero-waste operation.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="size-4 text-cyan-500" />
                Chemical Control
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              We prioritise chemicals with minimal environmental impact, maintain strict MSDS (Material Safety
              Data Sheet) records, and track per-capita consumption by department.
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Social & Cultural */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Landmark className="size-5 text-indigo-500" />
          Social &amp; Cultural Contributions
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sailboat className="size-4 text-sky-500" />
                Sports Sponsorship
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Main sponsor of the <strong className="text-foreground">Dosinia Likya Cup</strong> sailing races,
              hosted by Kemer Municipality Yacht Sailing Sports Club — promoting regional tourism and the sport
              of sailing.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UtensilsCrossed className="size-4 text-amber-500" />
                Cultural Heritage
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              We serve <strong className="text-foreground">UNESCO-registered traditional Turkish cuisine</strong> in
              our concept kitchens and introduce the traditional Turkish Hammam culture to our international guests.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="size-4 text-indigo-500" />
                Natural Heritage
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              We guide our guests with a <strong className="text-foreground">Code of Conduct</strong> that
              encourages respectful visits to ancient cities, historical sites, and the natural wonders of
              our region.
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Certificates */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Award className="size-5 text-yellow-500" />
          Certificates &amp; Accreditations
        </h2>
        <p className="text-sm text-muted-foreground">
          Our certifications are official proof of our commitment to nature and society.
        </p>
        <div className="flex flex-col gap-2">
          {[
            "Turkey Sustainable Tourism — Phase 1 Certificate",
            "Zero Waste Certificate (Basic Level) — Republic of Turkey, Ministry of Environment and Urbanisation",
            "Environmental Impact Assessment (EIA) — Not Required Certificate",
          ].map((cert) => (
            <div key={cert} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Award className="size-4 text-yellow-500 mt-0.5 shrink-0" />
              <span className="text-sm">{cert}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Reports */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileDown className="size-5 text-primary" />
          Sustainability Reports
        </h2>
        <p className="text-sm text-muted-foreground">
          In keeping with our transparency principle, you can access our full sustainability reports —
          including operational data and environmental impact targets.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">2024 Sustainability Report</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Full overview of our 2024 environmental, social and governance performance.
              </p>
              <Button asChild variant="outline" className="gap-2 w-fit">
                <a href="/reports/dosinia-sustainability-report-2024.pdf" download>
                  <FileDown className="size-4" />
                  Download PDF
                </a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">2023 Sustainability Report</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Full overview of our 2023 environmental, social and governance performance.
              </p>
              <Button asChild variant="outline" className="gap-2 w-fit">
                <a href="/reports/dosinia-sustainability-report-2023.pdf" download>
                  <FileDown className="size-4" />
                  Download PDF
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground">
          PDF files will be available once uploaded. Contact us at{" "}
          <a href="mailto:info@dosiniahotels.com" className="underline hover:text-primary transition-colors">
            info@dosiniahotels.com
          </a>{" "}
          to request a report directly.
        </p>
      </section>

    </main>
  )
}
