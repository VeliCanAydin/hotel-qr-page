import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

async function seedEvents() {
  const { db } = await import('./index')
  const { events } = await import('./schema')
  const { hotelEvents } = await import('./event-seed-data')

  console.log('Replacing events table contents...')

  await db.delete(events)
  await db.insert(events).values(
    hotelEvents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      category: event.category,
      color: event.color ?? null,
    }))
  )

  console.log(`Inserted ${hotelEvents.length} events`)
  process.exit(0)
}

seedEvents().catch((error) => {
  console.error(error)
  process.exit(1)
})