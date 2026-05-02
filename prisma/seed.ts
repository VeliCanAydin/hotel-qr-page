import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { email: "admin@dosinia.com" },
    update: {},
    create: {
      email: "admin@dosinia.com",
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  })

  // Hotel Info
  await prisma.hotelInfo.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      phone: "+90 (242) 824 02 02",
      email: "info@dosinialuxuryresort.com",
      whatsapp: "+90 (242) 824 02 02",
      wifiName: "Dosinia_Guest",
      wifiPassword: "LuxuryStay2024",
      checkInStart: "12:00",
      checkInEnd: "18:00",
      checkOut: "12:00",
      cancellationPolicy:
        "Free cancellation up to 24 hours before arrival. After this period, a charge of one night's stay will be applied.",
      aboutText:
        "Welcome to Dosinia Luxury Resort, where every moment is crafted to create unforgettable memories. Nestled in a breathtaking coastal setting, our resort offers world-class amenities and personalized service to ensure your stay exceeds all expectations.",
    },
  })

  // Restaurants
  const restaurants = [
    {
      id: "a-la-carte",
      src: "/azure.png",
      alt: "A La Carte",
      title: "A La Carte",
      description: "Exquisite dining experience with a focus on fresh, local ingredients.",
      hasReservation: true,
      openingHours: "18:00 - 22:00",
      cuisine: "Mediterranean & Turkish Cuisine",
      highlights: [
        "Reservation required",
        "Fine dining experience",
        "Fresh seafood selection",
        "Vegetarian options available",
        "Award-winning chef",
      ],
      order: 0,
    },
    {
      id: "main-restaurant",
      src: "/gold.png",
      alt: "Main Restaurant",
      title: "Main Restaurant",
      description: "Casual dining with a variety of international dishes to satisfy every palate.",
      hasReservation: false,
      openingHours: "07:00 - 10:00 | 12:30 - 14:00 | 19:00 - 21:00",
      cuisine: "International Buffet",
      highlights: [
        "Open buffet style",
        "Live cooking stations",
        "Kids corner available",
        "Gluten-free options",
        "Theme nights on weekends",
      ],
      order: 1,
    },
    {
      id: "snack-restaurant",
      src: "/crystal.png",
      alt: "Snack Restaurant",
      title: "Snack Restaurant",
      description: "Quick bites and light meals perfect for a casual lunch or afternoon snack.",
      hasReservation: false,
      openingHours: "11:00 - 17:00",
      cuisine: "Fast Food & Snacks",
      highlights: [
        "Poolside service",
        "Fresh pizzas & burgers",
        "Ice cream bar",
        "Refreshing beverages",
        "No reservation needed",
      ],
      order: 2,
    },
  ]

  for (const r of restaurants) {
    await prisma.restaurant.upsert({ where: { id: r.id }, update: {}, create: r })
  }

  // Events (updated to 2026 dates)
  const events = [
    {
      id: "evt-1",
      title: "Morning Yoga Session",
      description: "Start your day with a relaxing yoga session by the pool. All levels welcome.",
      location: "Pool Deck",
      date: "2026-05-02",
      startTime: "07:00",
      endTime: "08:00",
      category: "wellness" as const,
    },
    {
      id: "evt-2",
      title: "Breakfast Buffet",
      description: "Enjoy our extensive breakfast buffet featuring international cuisine and fresh fruits.",
      location: "Main Restaurant",
      date: "2026-05-02",
      startTime: "07:00",
      endTime: "10:30",
      category: "dining" as const,
    },
    {
      id: "evt-3",
      title: "Kids Art Workshop",
      description: "Creative art workshop for children ages 4-12. Painting, drawing, and crafts included.",
      location: "Kids Club",
      date: "2026-05-02",
      startTime: "10:00",
      endTime: "12:00",
      category: "kids" as const,
    },
    {
      id: "evt-4",
      title: "Aqua Aerobics",
      description: "Fun and energetic water aerobics class in the main pool.",
      location: "Main Pool",
      date: "2026-05-02",
      startTime: "11:00",
      endTime: "12:00",
      category: "sports" as const,
    },
    {
      id: "evt-5",
      title: "Live Acoustic Music",
      description: "Enjoy live acoustic performances while you relax by the pool.",
      location: "Pool Bar",
      date: "2026-05-02",
      startTime: "14:00",
      endTime: "16:00",
      category: "music" as const,
    },
    {
      id: "evt-6",
      title: "DJ Night Party",
      description: "Dance the night away with our resident DJ. Drink specials available all night.",
      location: "Beach Club",
      date: "2026-05-02",
      startTime: "22:00",
      endTime: "02:00",
      category: "entertainment" as const,
    },
    {
      id: "evt-7",
      title: "Wine Tasting Experience",
      description: "Discover premium local wines with our sommelier. Includes cheese and appetizer pairing.",
      location: "Wine Cellar",
      date: "2026-05-03",
      startTime: "17:00",
      endTime: "18:30",
      category: "dining" as const,
    },
    {
      id: "evt-8",
      title: "Beach Volleyball Tournament",
      description: "Join our friendly beach volleyball tournament. Teams of 4, all skill levels welcome.",
      location: "Beach",
      date: "2026-05-03",
      startTime: "15:00",
      endTime: "17:00",
      category: "sports" as const,
    },
  ]

  for (const e of events) {
    await prisma.hotelEvent.upsert({ where: { id: e.id }, update: {}, create: e })
  }

  console.log("Seed completed. Admin: admin@dosinia.com / admin123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
