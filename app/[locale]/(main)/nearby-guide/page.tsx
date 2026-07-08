import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { BadgeCheck, Clock3, MapPinned, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPublicNearbyGuideItems } from "@/lib/content"
import { nearbyGuideIconMap, type NearbyGuideItem } from "@/lib/types/nearby-guide"

export const metadata: Metadata = {
  title: "Nearby Guide | Dosinia Luxury Hotel",
  description: "A quick guide to the nearest pharmacy, market, bus stop, and other nearby essentials.",
}

function getToneClasses(tone: string) {
  switch (tone) {
    case "emerald":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/35 dark:text-emerald-300 dark:ring-emerald-900/60"
    case "sky":
      return "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/35 dark:text-sky-300 dark:ring-sky-900/60"
    case "amber":
      return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/35 dark:text-amber-300 dark:ring-amber-900/60"
    case "rose":
      return "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/35 dark:text-rose-300 dark:ring-rose-900/60"
    case "violet":
      return "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/35 dark:text-violet-300 dark:ring-violet-900/60"
    case "red":
      return "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/35 dark:text-red-300 dark:ring-red-900/60"
    default:
      return "bg-muted text-foreground"
  }
}

function NearbyPlaceCard({ place }: { place: NearbyGuideItem }) {
  const Icon = nearbyGuideIconMap[place.iconKey]

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm transition-all duration-200 hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex size-11 items-center justify-center rounded-2xl ring-1 ${getToneClasses(place.tone)}`}>
            <Icon className="size-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{place.name}</CardTitle>
              <Badge variant="outline" className="rounded-full">{place.distance}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                {place.eta}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="size-3.5" />
                {place.note}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapQuery)}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2 rounded-full">
              <MapPinned className="size-4" />
              Map
            </Button>
          </a>

          {place.phone ? (
            <a href={`tel:${place.phone.replace(/\D/g, "")}`}>
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <Phone className="size-4" />
                Call
              </Button>
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}


export default async function NearbyGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const nearbyGuideItems = await getPublicNearbyGuideItems()
  const nearbyEssentials = nearbyGuideItems.filter((item) => item.section === "Nearby Essentials")
  const touristAttractions = nearbyGuideItems.filter((item) => item.section === "Tourist Attractions")

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPinned className="size-5 text-emerald-600" />
          <h1 className="text-2xl font-semibold tracking-tight">Nearby Guide</h1>
        </div>
        <p className="text-sm text-muted-foreground">The nearest places are listed below.</p>
      </section>

      <Separator />

      <Tabs defaultValue="essentials" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-full p-1">
          <TabsTrigger value="essentials" className="rounded-full">
            Nearby Essentials
          </TabsTrigger>
          <TabsTrigger value="attractions" className="rounded-full">
            Tourist Attractions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="essentials" className="mt-4">
          <section className="flex flex-col gap-3">
            {nearbyEssentials.map((place) => (
              <NearbyPlaceCard key={place.id} place={place} />
            ))}
          </section>
        </TabsContent>

        <TabsContent value="attractions" className="mt-4">
          <section className="flex flex-col gap-3">
            {touristAttractions.map((place) => (
              <NearbyPlaceCard key={place.id} place={place} />
            ))}
          </section>
        </TabsContent>
      </Tabs>
    </main>
  )
}