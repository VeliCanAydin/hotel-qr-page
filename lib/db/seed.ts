import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

// Dynamic imports run after env is loaded
async function seed() {
  const { db } = await import('./index')
  const { menuItems, roomServiceItems, events, kidsActivities, adminUsers, adminRoles, adminRolePages, hotelInfo, beachPoolsInfo, spaServices, wellnessServices, restaurants, menuCategories, nearbyGuideItems: nearbyGuideItemsTable } = await import('./schema')
  const { hashPassword } = await import('../auth')
  const { ADMIN_PAGE_PERMISSIONS, DEFAULT_ADMIN_ROLE_PRESETS } = await import('../permissions')
  const { menuItems: menuData } = await import('../data/aLaCarteMenu')
  const { roomServiceItems: roomData } = await import('../data/roomServiceData')
  const { nearbyGuideItems: nearbyGuideData } = await import('../data/nearbyGuide')
  const { hotelEvents } = await import('./event-seed-data')
  const { weeklySchedule } = await import('../data/kidsClubData')

  console.log('Seeding database...')

  // Restaurants (upsert — safe to re-seed)
  await db
    .insert(restaurants)
    .values([
      { id: 'a-la-carte', name: 'A-La-Carte Restaurant', cuisine: 'Mediterranean & Turkish', openTime: '18:00', closeTime: '22:00', description: "Fine dining experience with premium Mediterranean and Turkish cuisine. Chef's signature dishes made with fresh, local ingredients.", reservation: true, orderIndex: 0 },
      { id: 'main-restaurant', name: 'Main Restaurant', cuisine: 'International Buffet', openTime: '07:00', closeTime: '21:00', description: 'Our main buffet restaurant offering an extensive selection of international cuisine for breakfast, lunch and dinner.', reservation: false, orderIndex: 1 },
      { id: 'snack-restaurant', name: 'Snack Restaurant', cuisine: 'Fast Food & Snacks', openTime: '11:00', closeTime: '17:00', description: 'Casual poolside dining with light bites, snacks, salads, and refreshing drinks.', reservation: false, orderIndex: 2 },
    ])
    .onConflictDoNothing()
  console.log('Upserted 3 restaurants')

  // Menu categories (upsert)
  await db
    .insert(menuCategories)
    .values([
      { id: 'appetizers', label: 'Appetizers', orderIndex: 0 },
      { id: 'soups-salads', label: 'Soups & Salads', orderIndex: 1 },
      { id: 'main-courses', label: 'Main Courses', orderIndex: 2 },
      { id: 'sides', label: 'Sides', orderIndex: 3 },
      { id: 'desserts', label: 'Desserts', orderIndex: 4 },
    ])
    .onConflictDoNothing()
  console.log('Upserted 5 menu categories')

  // Allergens (upsert from static list)
  try {
    const { ALLERGENS: staticAllergens } = await import('../data/allergens')
    const { allergens: allergensTable } = await import('./schema')
    await db.insert(allergensTable).values(
      staticAllergens.map((a: any, idx: number) => ({ id: a.id, label: a.label, iconPath: a.icon, orderIndex: idx }))
    ).onConflictDoNothing()
    console.log(`Upserted ${staticAllergens.length} allergens`)
  } catch (err) {
    console.warn('Failed to seed allergens table, continuing without it', err)
  }

  await db.delete(menuItems)
  await db.insert(menuItems).values(
    menuData.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      isVegetarian: item.isVegetarian ?? false,
      category: item.category,
      restaurantId: 'a-la-carte',
    }))
  )
  console.log(`Inserted ${menuData.length} menu items`)

  await db.delete(roomServiceItems)
  await db.insert(roomServiceItems).values(
    roomData.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
    }))
  )
  console.log(`Inserted ${roomData.length} room service items`)

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

  await db.delete(kidsActivities)
  const activitiesToInsert = weeklySchedule.flatMap((day, dayIndex) =>
    day.activities.map((activity, activityIndex) => ({
      day: day.day,
      time: activity.time,
      event: activity.event,
      orderIndex: dayIndex * 100 + activityIndex,
    }))
  )
  await db.insert(kidsActivities).values(activitiesToInsert)
  console.log(`Inserted ${activitiesToInsert.length} kids activities`)

  // Access control roles and default permissions
  await db
    .insert(adminRoles)
    .values(
      DEFAULT_ADMIN_ROLE_PRESETS.map((preset) => ({
        name: preset.name,
        description: preset.description,
        isSystem: preset.isSystem,
      }))
    )
    .onConflictDoNothing()

  const { eq } = await import('drizzle-orm')
  const roles = await db.select().from(adminRoles)
  const roleByName = new Map(roles.map((role) => [role.name, role]))
  const existingPermissionRows = await db.select({ roleId: adminRolePages.roleId }).from(adminRolePages)
  const roleIdsWithPermissions = new Set(existingPermissionRows.map((row) => row.roleId))

  const permissionRows = DEFAULT_ADMIN_ROLE_PRESETS.flatMap((preset) => {
    const role = roleByName.get(preset.name)
    if (!role || roleIdsWithPermissions.has(role.id)) {
      return []
    }

    return preset.allowedPageKeys.map((pageKey) => ({
      roleId: role.id,
      pageKey,
      isAllowed: true,
    }))
  })

  if (permissionRows.length > 0) {
    await db.insert(adminRolePages).values(permissionRows).onConflictDoNothing()
  }

  console.log(`Seeded ${roles.length} access roles and ${ADMIN_PAGE_PERMISSIONS.length} page definitions`)

  // Hotel info (upsert singleton)
  await db
    .insert(hotelInfo)
    .values({
      id: 1,
      phone: '+90 (242) 824 02 02',
      email: 'info@dosinialuxuryresort.com',
      whatsapp: '+90 (242) 824 02 02',
      wifiName: 'Dosinia_Guest',
      wifiPassword: 'LuxuryStay2024',
      checkInStart: '12:00',
      checkInEnd: '18:00',
      checkOut: '12:00',
      cancellationPolicy:
        'Free cancellation up to 24 hours before arrival. After this period, a charge of one night\'s stay will be applied.',
      aboutText:
        'Welcome to Dosinia Luxury Resort, where every moment is crafted to create unforgettable memories. Nestled in a breathtaking coastal setting, our resort offers world-class amenities and personalized service to ensure your stay exceeds all expectations.',
    })
    .onConflictDoNothing()
  console.log('Upserted hotel info')

  // Beach & pools info (upsert singleton)
  await db
    .insert(beachPoolsInfo)
    .values({
      id: 1,
      beachDescription:
        'Our private beach stretches 500 meters along the Mediterranean coast, offering crystal-clear waters and pristine white sand. Sunbeds and umbrellas are complimentary for all guests.',
      beachOpenTime: '07:00',
      beachCloseTime: '19:00',
      beachNotes:
        'Beach towels available at the beach bar. Water sports equipment rental available from 09:00 to 17:00.',
      mainPoolDescription:
        'Our main outdoor pool is the heart of the resort, featuring a spacious swimming area, a children\'s splash zone, and a poolside bar.',
      mainPoolOpenTime: '07:00',
      mainPoolCloseTime: '20:00',
      indoorPoolDescription:
        'The indoor heated pool is available year-round and is perfect for early morning swims or cooler evenings.',
      indoorPoolOpenTime: '06:00',
      indoorPoolCloseTime: '22:00',
      kidsPoolDescription:
        'A dedicated shallow pool for children with water features and slides, supervised by our trained staff.',
      kidsPoolOpenTime: '09:00',
      kidsPoolCloseTime: '18:00',
      generalNotes:
        'Pool towels are available at the pool deck. Food and beverages can be ordered directly to your sunbed. Please shower before entering pools.',
    })
    .onConflictDoNothing()
  console.log('Upserted beach & pools info')

  // Spa services
  await db.delete(spaServices)
  await db.insert(spaServices).values([
    {
      id: 'turkish-bath',
      name: 'Turkish Bath',
      description:
        'Our Turkish Bath is waiting for you as a modern interpretation of traditional relaxation. Enjoy the steam and massage while resting on the hot stones. It is the perfect space for a deep relaxation and refresh experience.',
      image: '/spa/dosinia_luxury_resort_spa_turkish_bath-1.jpeg',
      imageAlt: 'Turkish Bath',
      openTime: '08:00', closeTime: '20:00',
      isFree: true,
      price: '',
      requiresReservation: false,
      tags: 'Complimentary,Daily',
      orderIndex: 0,
    },
    {
      id: 'massage',
      name: 'Massage & Aromatherapy',
      description:
        'Rejuvenating massage rituals combined with aromatic oils tailored to your needs. Ease tension, improve circulation, and unwind in a serene atmosphere.',
      image: '/spa/dosinia_luxury_resort_spa_massage_room-1.jpeg',
      imageAlt: 'Massage & Aromatherapy',
      openTime: '08:00', closeTime: '20:00',
      isFree: false,
      price: 'Starting from $60',
      requiresReservation: true,
      tags: 'Classic Massage,Aroma Therapy,Relax Massage,Hot Stone Massage,Chocolate Massage,Algae Massage,Waist Massage,Medical Massage',
      orderIndex: 1,
    },
    {
      id: 'sauna',
      name: 'Sauna & Steam Room',
      description:
        'Our sauna and steam room are the address of relaxation and renewal. Relax your muscles in the warm environment of the sauna, experience a deep feeling of cleanliness in the steam room.',
      image: '/spa/dosinia_luxury_resort_spa_sauna-1.jpeg',
      imageAlt: 'Sauna & Steam Room',
      openTime: '09:00', closeTime: '18:00',
      isFree: true,
      price: '',
      requiresReservation: false,
      tags: 'Complimentary,Finnish Sauna,Steam Room',
      orderIndex: 2,
    },
    {
      id: 'salt-room',
      name: 'Salt Room Therapy',
      description:
        'Our salt room offers a relaxing experience that supports your health. Experience a deep relaxation in its calming environment while cleansing your respiratory tract with the natural healing effect of salt.',
      image: '/spa/dosinia_luxury_resort_spa_salt_bath_2-1.jpeg',
      imageAlt: 'Salt Room Therapy',
      openTime: '08:00', closeTime: '19:30',
      isFree: false,
      price: 'Starting from $40',
      requiresReservation: true,
      tags: 'Halotherapy,Respiratory,Wellness',
      orderIndex: 3,
    },
  ])
  console.log('Inserted 4 spa services')

  // Wellness services
  await db.delete(wellnessServices)
  await db.insert(wellnessServices).values([
    {
      id: 'fitness',
      name: 'Fitness',
      description:
        'For sports enthusiasts and anyone who wants to stay fit during their holiday, discover expert-designed training sessions at Dosinia Luxury Resort. With modern equipment and a spacious gym, enjoy every workout while boosting your energy and reaching your fitness goals.',
      image: '/wellness/EVG01681-Enhanced-NR-HDR-Edit.jpeg',
      imageAlt: 'Fitness',
      openTime: '07:00', closeTime: '22:00',
      isPaid: false,
      requiresReservation: false,
      orderIndex: 0,
    },
    {
      id: 'yoga',
      name: 'Yoga',
      description:
        'Yoga sessions are a perfect opportunity to balance both body and mind. With our expert instructors, reconnect with yourself in a peaceful atmosphere. Improve flexibility, leave stress behind, and reach a deeper sense of inner calm.',
      image: '/wellness/wellness-nedir-4.webp',
      imageAlt: 'Yoga',
      openTime: '08:30', closeTime: '09:30',
      isPaid: false,
      requiresReservation: true,
      orderIndex: 1,
    },
    {
      id: 'morning-gymnastics',
      name: 'Morning Gymnastics',
      description:
        'Start your day with energy through enjoyable sessions led by professional trainers. Refresh your body and mind, feel revitalized, and build a healthy daily ritual that helps you begin the day feeling strong and active.',
      image: '/wellness/sabah-jimnastigi.jpeg',
      imageAlt: 'Morning Gymnastics',
      openTime: '09:00', closeTime: '09:30',
      isPaid: false,
      requiresReservation: false,
      orderIndex: 2,
    },
    {
      id: 'pool-gymnastics',
      name: 'Pool Gymnastics',
      description:
        'Strengthen your body and unwind at the same time with fun and effective exercises in the pool. Enjoy the water while staying in shape, and refresh your energy with the relaxing effect of a water-based workout.',
      image: '/wellness/havuz-jimnastigi.jpeg',
      imageAlt: 'Pool Gymnastics',
      openTime: '11:00', closeTime: '11:30',
      isPaid: false,
      requiresReservation: false,
      orderIndex: 3,
    },
    {
      id: 'aqua-spinning',
      name: 'Aqua Spinning',
      description:
        'Aqua Spinning delivers a dynamic workout powered by the natural resistance of water. Pedal in the pool to burn calories and train your whole body with joint-friendly movement. A high-energy activity that is both fun and effective.',
      image: '/wellness/thumbnail_Aqua_spinning_class_aboard_a_cruise_ship.webp',
      imageAlt: 'Aqua Spinning',
      openTime: '16:00', closeTime: '16:45',
      isPaid: true,
      requiresReservation: true,
      orderIndex: 4,
    },
    {
      id: 'aqua-trampoline',
      name: 'Aqua Trampoline',
      description:
        'Enjoy a playful jumping experience on the water for an energetic and refreshing workout. Stay in shape while having fun, and feel the soothing, cooling effect of water.',
      image: '/wellness/aqua-jump-3.jpeg',
      imageAlt: 'Aqua Trampoline',
      openTime: '17:00', closeTime: '17:30',
      isPaid: true,
      requiresReservation: true,
      orderIndex: 5,
    },
    {
      id: 'beach-volleyball',
      name: 'Beach Volleyball',
      description:
        'Play with friends or family under the sun and combine fun with physical activity. Feel the spirit of the game on the beach and crown your holiday with lively memories and great energy.',
      image: '/wellness/woman-throwing-ball-beach-1.jpeg',
      imageAlt: 'Beach Volleyball',
      openTime: '10:30', closeTime: '12:00',
      isPaid: false,
      requiresReservation: false,
      orderIndex: 6,
    },
    {
      id: 'kangoo-jump',
      name: 'Kangoo Jump',
      description:
        'Kangoo Jump offers a fun and energetic workout using special rebound boots. Turn cardio into an enjoyable experience, activate your whole body, and burn calories while having a great time.',
      image: '/wellness/kangoo-jump.jpeg',
      imageAlt: 'Kangoo Jump',
      openTime: '18:00', closeTime: '18:45',
      isPaid: true,
      requiresReservation: true,
      orderIndex: 7,
    },
    {
      id: 'water-polo',
      name: 'Water Polo',
      description:
        'Water polo brings an energetic and exciting team challenge to the pool. Build team spirit, enjoy fast-paced moments, and create unforgettable memories in refreshing water.',
      image: '/wellness/EVG00355-rotated.jpeg',
      imageAlt: 'Water Polo',
      openTime: '15:00', closeTime: '15:45',
      isPaid: false,
      requiresReservation: false,
      orderIndex: 8,
    },
    {
      id: 'dart-games',
      name: 'Dart Games',
      description:
        'Dart games offer a fun and competitive experience. Enjoy quality time with friends or family while improving your aim and focus. Moments spent around the dartboard will add extra joy to your holiday.',
      image: '/wellness/3d-rendering-arrow-hitting-target.jpeg',
      imageAlt: 'Dart Games',
      openTime: '19:00', closeTime: '22:30',
      isPaid: false,
      requiresReservation: false,
      orderIndex: 9,
    },
  ])
  console.log('Inserted 10 wellness services')

  await db.delete(nearbyGuideItemsTable)
  await db.insert(nearbyGuideItemsTable).values(
    nearbyGuideData.map((item) => ({
      id: item.id,
      name: item.name,
      distance: item.distance,
      eta: item.eta,
      note: item.note,
      phone: item.phone ?? null,
      mapQuery: item.mapQuery,
      tone: item.tone,
      section: item.section,
      iconKey: item.iconKey,
      orderIndex: item.orderIndex,
    }))
  )
  console.log(`Inserted ${nearbyGuideData.length} nearby guide items`)

  // Admin user (upsert — don't wipe on re-seed)
  const superAdmin = roleByName.get('Super Admin')
  const contentManager = roleByName.get('Content Manager')
  const serviceManager = roleByName.get('Service Manager')
  const existing = await db.select().from(adminUsers).where(eq(adminUsers.email, 'admin@dosinia.com')).limit(1)
  if (existing.length === 0) {
    await db.insert(adminUsers).values({
      roleId: superAdmin?.id ?? null,
      email: 'admin@dosinia.com',
      passwordHash: await hashPassword('admin123'),
    })
    console.log('Created default admin user: admin@dosinia.com / admin123')
  } else {
    if (superAdmin) {
      await db.update(adminUsers).set({ roleId: superAdmin.id }).where(eq(adminUsers.email, 'admin@dosinia.com'))
    }
    console.log('Admin user already exists, skipping')
  }

  const testStaffUsers = [
    {
      email: 'content.manager@dosinia.com',
      password: 'content123!',
      roleId: contentManager?.id ?? null,
      label: 'Content Manager',
    },
    {
      email: 'service.manager@dosinia.com',
      password: 'service123!',
      roleId: serviceManager?.id ?? null,
      label: 'Service Manager',
    },
  ]

  for (const staffUser of testStaffUsers) {
    const [existingUser] = await db.select().from(adminUsers).where(eq(adminUsers.email, staffUser.email)).limit(1)
    if (existingUser) {
      if (staffUser.roleId) {
        await db.update(adminUsers).set({ roleId: staffUser.roleId }).where(eq(adminUsers.email, staffUser.email))
      }
      console.log(`Updated ${staffUser.label} test account: ${staffUser.email}`)
      continue
    }

    await db.insert(adminUsers).values({
      email: staffUser.email,
      passwordHash: await hashPassword(staffUser.password),
      roleId: staffUser.roleId,
    })
    console.log(`Created ${staffUser.label} test account: ${staffUser.email} / ${staffUser.password}`)
  }

  console.log('Done!')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
