export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { kidsActivities, kidsServices, kidsServiceItems } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import KidsCareClient from './kids-care-client'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default async function KidsCarePage() {
  const [services, items, activityRows] = await Promise.all([
    db.select().from(kidsServices).orderBy(asc(kidsServices.orderIndex)),
    db.select().from(kidsServiceItems).orderBy(asc(kidsServiceItems.orderIndex)),
    db.select().from(kidsActivities).orderBy(asc(kidsActivities.orderIndex)),
  ])

  const itemsByService: Record<string, { id: string; serviceId: string; trigger: string; content: string; orderIndex: number }[]> = {}
  for (const item of items) {
    if (!itemsByService[item.serviceId]) itemsByService[item.serviceId] = []
    itemsByService[item.serviceId].push(item)
  }

  const scheduleByService: Record<string, { day: string; activities: { id: number; time: string; event: string }[] }[]> = {}
  for (const service of services) {
    const serviceRows = activityRows.filter((r) => r.serviceId === service.id)
    scheduleByService[service.id] = DAYS.map((day) => ({
      day,
      activities: serviceRows
        .filter((r) => r.day === day)
        .map((r) => ({ id: r.id, time: r.time, event: r.event })),
    }))
  }

  return (
    <KidsCareClient
      initialServices={services}
      initialItemsByService={itemsByService}
      initialScheduleByService={scheduleByService}
    />
  )
}
