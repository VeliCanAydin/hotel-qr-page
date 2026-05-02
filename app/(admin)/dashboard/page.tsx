import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { roomServiceItems } from "@/lib/data/roomServiceData"
import { menuItems } from "@/lib/data/aLaCarteMenu"
import { hotelEvents } from "@/lib/data/events"
import { weeklySchedule } from "@/lib/data/kidsClubData"
import {
  HandPlatter,
  Utensils,
  CalendarDays,
  Baby,
  Hotel,
  Flower,
  TreePalm,
  ArrowRight,
  TrendingUp,
} from "lucide-react"

const totalKidsActivities = weeklySchedule.reduce(
  (sum, day) => sum + day.activities.filter((a) => a.event !== "Closed").length,
  0
)

const stats = [
  {
    title: "Room Service Items",
    value: roomServiceItems.length,
    description: `${roomServiceItems.filter((i) => i.category === "food").length} food · ${roomServiceItems.filter((i) => i.category === "beverages").length} beverages · ${roomServiceItems.filter((i) => i.category === "other-services").length} services`,
    icon: HandPlatter,
    href: "/dashboard/services/room-service",
  },
  {
    title: "A-La-Carte Menu",
    value: menuItems.length,
    description: "5 categories — appetizers to desserts",
    icon: Utensils,
    href: "/dashboard/services/restaurant",
  },
  {
    title: "Hotel Events",
    value: hotelEvents.length,
    description: `Across ${new Set(hotelEvents.map((e) => e.date)).size} dates`,
    icon: CalendarDays,
    href: "/dashboard/events/list",
  },
  {
    title: "Kids Activities",
    value: totalKidsActivities,
    description: "Weekly schedule — 7 days",
    icon: Baby,
    href: "/dashboard/content/kids-care",
  },
]

const quickLinks = [
  {
    title: "Hotel Info",
    description: "Contact, WiFi, check-in policies",
    icon: Hotel,
    href: "/dashboard/content/hotel-info",
    color: "text-blue-500",
  },
  {
    title: "Spa Services",
    description: "Manage spa & wellness services",
    icon: Flower,
    href: "/dashboard/content/spa",
    color: "text-purple-500",
  },
  {
    title: "Beach & Pools",
    description: "Beach and pool information",
    icon: TreePalm,
    href: "/dashboard/content/beach-pools",
    color: "text-cyan-500",
  },
  {
    title: "Room Service",
    description: "Food, beverages and in-room services",
    icon: HandPlatter,
    href: "/dashboard/services/room-service",
    color: "text-orange-500",
  },
  {
    title: "Restaurant Menu",
    description: "A-la-carte and restaurant details",
    icon: Utensils,
    href: "/dashboard/services/restaurant",
    color: "text-green-500",
  },
  {
    title: "Events Calendar",
    description: "Schedule and manage hotel events",
    icon: CalendarDays,
    href: "/dashboard/events/list",
    color: "text-red-500",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dosinia Luxury Resort — Content Management
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          All systems operational
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-medium mb-4">Content Management</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Card key={link.href} className="hover:bg-accent/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <link.icon className={`h-5 w-5 ${link.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{link.title}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{link.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={link.href}>
                    Manage
                    <ArrowRight className="h-3.5 w-3.5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
