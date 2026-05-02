export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { kidsActivities } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import KidsCareClient from './kids-care-client'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default async function KidsCarePage() {
  const rows = await db.select().from(kidsActivities).orderBy(asc(kidsActivities.orderIndex))
  const schedule = DAYS.map((day) => ({
    day,
    activities: rows
      .filter((r) => r.day === day)
      .map((r) => ({ time: r.time, event: r.event })),
  }))
  return <KidsCareClient initialSchedule={schedule} />
}
