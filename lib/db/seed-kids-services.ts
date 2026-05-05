import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

async function seed() {
  const { db } = await import('./index')
  const { kidsServices, kidsServiceItems } = await import('./schema')

  console.log('Seeding kids services...')

  await db
    .insert(kidsServices)
    .values([
      {
        id: 'kids-club',
        title: "The Kid's Club",
        description: "A world of fun awaits in our state-of-the-art play area. Supervised by our certified team, children can enjoy creative crafts, games, and activities in a safe and stimulating environment.",
        image: '/kids-club.png',
        imageAlt: 'Kids Club',
        orderIndex: 0,
      },
      {
        id: 'gaming-room',
        title: 'Gaming Room',
        description: 'Our gaming room is equipped with the latest consoles and games, providing a thrilling experience for kids and teens alike. Supervised sessions ensure a safe and enjoyable environment.',
        image: '/gaming-room.png',
        imageAlt: 'Gaming Room',
        orderIndex: 1,
      },
      {
        id: 'kids-aquapark',
        title: 'Kids Aquapark',
        description: 'Dive into fun at our Kids Aquapark, featuring shallow pools, water slides, and splash zones designed for safety and excitement. Lifeguards are on duty to ensure a secure environment for all children.',
        image: '/kids-aquapark.png',
        imageAlt: 'Kids Aquapark',
        orderIndex: 2,
      },
      {
        id: 'spray-action',
        title: 'Spray Action',
        description: 'Our Spray Action area offers a variety of water-based activities and interactive fountains that provide endless fun for kids of all ages. It\'s the perfect spot to cool off and enjoy some splashy excitement.',
        image: '/spray-action.png',
        imageAlt: 'Spray Action',
        orderIndex: 3,
      },
    ])
    .onConflictDoNothing()
  console.log('Upserted 4 kids services')

  await db
    .insert(kidsServiceItems)
    .values([
      // The Kid's Club
      { id: 'kids-club-hours',      serviceId: 'kids-club',     trigger: 'Operating Hours & Location', content: "Our kids' club is open between 10:30 to 23:30.",         orderIndex: 0 },
      { id: 'kids-club-ages',       serviceId: 'kids-club',     trigger: 'Age Groups',                 content: "Our kids' club is open to children aged 3 to 16.",     orderIndex: 1 },
      // Gaming Room
      { id: 'gaming-room-hours',    serviceId: 'gaming-room',   trigger: 'Operating Hours & Location', content: 'Our gaming room is open between 10:00 to 18:00.',       orderIndex: 0 },
      { id: 'gaming-room-ages',     serviceId: 'gaming-room',   trigger: 'Age Groups',                 content: 'Our gaming room is open to children aged 3 to 16.',    orderIndex: 1 },
      // Kids Aquapark
      { id: 'aquapark-hours',       serviceId: 'kids-aquapark', trigger: 'Operating Hours & Location', content: 'Our kids aquapark is open between 10:00 to 17:00.',     orderIndex: 0 },
      // Spray Action
      { id: 'spray-action-hours',   serviceId: 'spray-action',  trigger: 'Operating Hours & Location', content: 'Spray action is from 11:00 to 12:00 and from 15:00 to 16:00.', orderIndex: 0 },
    ])
    .onConflictDoNothing()
  console.log('Upserted 6 kids service items')

  console.log('Done.')
}

seed().catch((err) => { console.error(err); process.exit(1) })
