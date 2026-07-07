import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

async function seed() {
  const { db } = await import('./index')
  const { kidsActivities } = await import('./schema')
  const { weeklySchedule } = await import('../data/kids-club-data')

  console.log('Seeding kids club schedule...')

  const rows = weeklySchedule.flatMap((day) =>
    day.activities.map((activity, index) => ({
      serviceId: 'kids-club',
      day: day.day,
      time: activity.time,
      event: activity.event,
      orderIndex: index,
    }))
  )

  await db.insert(kidsActivities).values(rows).onConflictDoNothing()
  console.log(`Inserted ${rows.length} activities (7 days × 14 slots)`)

  console.log('Done.')
}

seed().catch((err) => { console.error(err); process.exit(1) })
