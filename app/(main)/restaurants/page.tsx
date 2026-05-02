import RestaurantCard from "@/components/RestaurantCard"
import { Suspense } from "react"
import RestaurantCardSkeleton from "@/components/RestaurantCardSkeleton"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function RestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({ orderBy: { order: "asc" } })

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">Restaurants</h2>
      {restaurants.map((restaurant) => (
        <Suspense key={restaurant.id} fallback={<RestaurantCardSkeleton />}>
          <RestaurantCard
            id={restaurant.id}
            src={restaurant.src}
            alt={restaurant.alt}
            title={restaurant.title}
            description={restaurant.description}
            hasReservation={restaurant.hasReservation}
            openingHours={restaurant.openingHours}
            cuisine={restaurant.cuisine}
            highlights={restaurant.highlights}
          />
        </Suspense>
      ))}
    </div>
  )
}
