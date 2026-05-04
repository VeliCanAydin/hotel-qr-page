import RestaurantCard from "@/components/RestaurantCard"
import { Suspense } from "react"
import RestaurantCardSkeleton from "@/components/RestaurantCardSkeleton"
import { db } from "@/lib/db"
import { restaurants } from "@/lib/db/schema"
import { asc } from "drizzle-orm"

export const dynamic = 'force-dynamic'

// Images for the original three restaurants; new ones get the default
const RESTAURANT_IMAGES: Record<string, string> = {
  'a-la-carte': '/azure.png',
  'main-restaurant': '/gold.png',
  'snack-restaurant': '/crystal.png',
}
const DEFAULT_IMAGE = '/azure.png'

export default async function RestaurantsPage() {
  const restaurantRows = await db.select().from(restaurants).orderBy(asc(restaurants.orderIndex))

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">Restaurants</h2>
      {restaurantRows.map((r) => (
        <Suspense key={r.id} fallback={<RestaurantCardSkeleton />}>
          <RestaurantCard
            id={r.id}
            src={RESTAURANT_IMAGES[r.id] ?? DEFAULT_IMAGE}
            alt={r.name}
            title={r.name}
            description={r.description}
            hasReservation={r.reservation}
            openingHours={r.hours}
            cuisine={r.cuisine}
            highlights={[
              r.reservation ? 'Reservation required' : 'No reservation needed',
              r.cuisine,
              `Open ${r.hours}`,
            ].filter(Boolean)}
          />
        </Suspense>
      ))}
    </div>
  )
}
