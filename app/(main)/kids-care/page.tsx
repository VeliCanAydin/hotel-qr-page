import Image from "next/image"
import { ShieldCheck, PartyPopper, SmilePlus } from "lucide-react"
import Benefits from "@/components/kids-care/Benefits"
import ServiceCard from "@/components/kids-care/ServiceCard"
import { db } from "@/lib/db"
import { kidsActivities, kidsServices, kidsServiceItems } from "@/lib/db/schema"
import { asc } from "drizzle-orm"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default async function KidsCarePage() {
  const [services, items, activityRows] = await Promise.all([
    db.select().from(kidsServices).orderBy(asc(kidsServices.orderIndex)),
    db.select().from(kidsServiceItems).orderBy(asc(kidsServiceItems.orderIndex)),
    db.select().from(kidsActivities).orderBy(asc(kidsActivities.orderIndex)),
  ])

  const itemsByService: Record<string, { trigger: string; content: string }[]> = {}
  for (const item of items) {
    if (!itemsByService[item.serviceId]) itemsByService[item.serviceId] = []
    itemsByService[item.serviceId].push({ trigger: item.trigger, content: item.content })
  }

  const scheduleByService: Record<string, { day: string; activities: { time: string; event: string }[] }[]> = {}
  for (const service of services) {
    const serviceRows = activityRows.filter((r) => r.serviceId === service.id)
    if (serviceRows.length > 0) {
      scheduleByService[service.id] = DAYS.map((day) => ({
        day,
        activities: serviceRows
          .filter((r) => r.day === day)
          .map((r) => ({ time: r.time, event: r.event })),
      }))
    }
  }

  return (
    <div className="flex flex-col p-4 gap-4">
      <div className="relative w-full h-[200px] rounded-3xl overflow-hidden">
        <Image src="/kids-care.png" alt="Kids Care" fill className="object-cover" />
      </div>
      <p>We are dedicated to providing a safe, fun, and engaging environment for our youngest guests. Explore our bespoke services designed to ensure a memorable stay for the entire family.</p>
      <div className="grid grid-cols-3 gap-3">
        <Benefits icon={ShieldCheck} title="Certified Staff" content="Trained & Vetted" />
        <Benefits icon={PartyPopper} title="All Ages" content="Toddlers to Teens" />
        <Benefits icon={SmilePlus} title="Creative Play" content="Fun-filled Activities" />
      </div>

      {services.map((service) => (
        <ServiceCard
          key={service.id}
          data={{
            image: service.image || "/kids-club.png",
            imageAlt: service.imageAlt || service.title,
            title: service.title,
            description: service.description,
            accordionItems: itemsByService[service.id] ?? [],
            schedule: scheduleByService[service.id],
          }}
        />
      ))}
    </div>
  )
}
