import RestaurantCard from "@/components/RestaurantCard"
import { Suspense } from "react"
import RestaurantCardSkeleton from "@/components/RestaurantCardSkeleton"
import { db } from "@/lib/db"
import { restaurants } from "@/lib/db/schema"
import { asc } from "drizzle-orm"
import { getHotelInfo } from "@/lib/actions/hotel-info"

export const dynamic = 'force-dynamic'

// Images for the original three restaurants; new ones get the default
const RESTAURANT_IMAGES: Record<string, string> = {
  'a-la-carte': '/azure.png',
  'main-restaurant': '/gold.png',
  'snack-restaurant': '/crystal.png',
}
const DEFAULT_IMAGE = '/azure.png'

export default async function RestaurantsPage() {
  const [restaurantRows, hotelInfo] = await Promise.all([
    db.select().from(restaurants).orderBy(asc(restaurants.orderIndex)),
    getHotelInfo(),
  ])

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
            openingHours={r.openTime && r.closeTime ? `${r.openTime.slice(0, 5)} – ${r.closeTime.slice(0, 5)}` : r.openTime?.slice(0, 5) || r.closeTime?.slice(0, 5) || ''}
            cuisine={r.cuisine}
            contactPhone={hotelInfo.phone}
            contactWhatsapp={hotelInfo.whatsapp}
            highlights={[
              r.reservation ? 'Reservation required' : 'No reservation needed',
              r.cuisine,
              r.openTime && r.closeTime ? `Open ${r.openTime.slice(0, 5)} – ${r.closeTime.slice(0, 5)}` : '',
            ].filter(Boolean)}
          />
        </Suspense>
      ))}
    </div>
  )
}
