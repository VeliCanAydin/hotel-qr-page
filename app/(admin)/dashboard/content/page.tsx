import Link from "next/link"
import { ArrowRight, Hotel, Baby, TreePalm, Flower, MapPinned, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const contentSections = [
  {
    title: "Hotel Info",
    description: "Contact details, Wi-Fi, check-in, and policy content.",
    href: "/dashboard/content/hotel-info",
    icon: Hotel,
    accent: "text-blue-500",
    status: "Live",
  },
  {
    title: "Kids Care",
    description: "Kids club services, benefits, and weekly schedules.",
    href: "/dashboard/content/kids-care",
    icon: Baby,
    accent: "text-amber-500",
    status: "Live",
  },
  {
    title: "Beach & Pools",
    description: "Beach access, pool notes, and guest-facing info.",
    href: "/dashboard/content/beach-pools",
    icon: TreePalm,
    accent: "text-cyan-500",
    status: "Live",
  },
  {
    title: "Spa",
    description: "Spa services, treatments, and reservation rules.",
    href: "/dashboard/content/spa",
    icon: Flower,
    accent: "text-violet-500",
    status: "Live",
  },
  {
    title: "Wellness",
    description: "Fitness, movement, and activity content.",
    href: "/dashboard/content/wellness",
    icon: Sparkles,
    accent: "text-emerald-500",
    status: "Live",
  },
  {
    title: "Nearby Guide",
    description: "Nearby essentials and tourist attraction listings.",
    href: "/dashboard/content/nearby-guide",
    icon: MapPinned,
    accent: "text-rose-500",
    status: "New",
  },
]

export default function ContentManagementOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage guest-facing content from a single place.
          </p>
        </div>
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
          6 sections
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contentSections.map((section) => {
          const Icon = section.icon

          return (
            <Card key={section.href} className="h-full transition-colors hover:bg-accent/40">
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-muted p-2">
                      <Icon className={`h-5 w-5 ${section.accent}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <CardDescription className="mt-0.5 text-xs">{section.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={section.status === "New" ? "default" : "secondary"} className="rounded-full">
                    {section.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full rounded-full">
                  <Link href={section.href}>
                    Manage
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}