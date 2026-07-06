import { cookies } from "next/headers"
import Link from "next/link"
import { ne } from "drizzle-orm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/db"
import { events, kidsActivities, menuItems, roomServiceItems } from "@/lib/db/schema"
import { verifyToken } from "@/lib/auth"
import { getAllowedPageHrefs } from "@/lib/page-access"
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

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin-session")?.value
  const token = session ? await verifyToken(session) : null
  const allowedHrefs = token
    ? await getAllowedPageHrefs({ userId: token.userId, roleName: token.roleName })
    : new Set<string>()

  // Live counts — every stat card reads the same tables the admin pages edit.
  const [roomServiceRows, menuItemRows, eventRows, kidsActivityCount] = await Promise.all([
    db.select({ category: roomServiceItems.category }).from(roomServiceItems),
    db.select({ id: menuItems.id }).from(menuItems),
    db.select({ date: events.date }).from(events),
    db.$count(kidsActivities, ne(kidsActivities.event, "Closed")),
  ])

  const foodCount = roomServiceRows.filter((i) => i.category === "food").length
  const beverageCount = roomServiceRows.filter((i) => i.category === "beverages").length
  const serviceCount = roomServiceRows.filter((i) => i.category === "other-services").length
  const eventDateCount = new Set(eventRows.map((event) => event.date)).size

  const stats = [
    {
      title: "Room Service Items",
      value: roomServiceRows.length,
      description: `${foodCount} food · ${beverageCount} beverages · ${serviceCount} services`,
      icon: HandPlatter,
      href: "/dashboard/services/room-service",
    },
    {
      title: "A-La-Carte Menu",
      value: menuItemRows.length,
      description: "Across all restaurant menus",
      icon: Utensils,
      href: "/dashboard/services/restaurant",
    },
    {
      title: "Hotel Events",
      value: eventRows.length,
      description: `Across ${eventDateCount} dates`,
      icon: CalendarDays,
      href: "/dashboard/events/list",
    },
    {
      title: "Kids Activities",
      value: kidsActivityCount,
      description: "Weekly schedule — 7 days",
      icon: Baby,
      href: "/dashboard/content/kids-care",
    },
  ]

  const resolvedStats = stats.filter((stat) => allowedHrefs.has(stat.href))
  const visibleQuickLinks = quickLinks.filter((link) => allowedHrefs.has(link.href))

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
        {resolvedStats.length ? (
          resolvedStats.map((stat) => (
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
          ))
        ) : (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
              No dashboard metrics are assigned to your role yet.
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-medium mb-4">Content Management</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleQuickLinks.map((link) => (
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
          {!visibleQuickLinks.length ? (
            <Card className="border-dashed">
              <CardContent className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
                No dashboard sections are assigned to your role yet.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
