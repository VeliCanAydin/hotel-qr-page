import RestaurantCard from "@/components/RestaurantCard";
import { Suspense } from "react";
import RestaurantCardSkeleton from "@/components/RestaurantCardSkeleton";

export default function RestaurantsPage() {
    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold mb-4">Restaurants</h2>
            <Suspense fallback={<RestaurantCardSkeleton />}>
                <RestaurantCard
                    id="a-la-carte"
                    src="/azure.png"
                    alt="A La Carte"
                    title="A La Carte"
                    description="Exquisite dining experience with a focus on fresh, local ingredients."
                    hasReservation={true}
                />
            </Suspense>
            <Suspense fallback={<RestaurantCardSkeleton />}>
                <RestaurantCard
                    id="main-restaurant"
                    src="/gold.png"
                    alt="Main Restaurant"
                    title="Main Restaurant"
                    description="Casual dining with a variety of international dishes to satisfy every palate."
                />
            </Suspense>
            <Suspense fallback={<RestaurantCardSkeleton />}>
                <RestaurantCard
                    id="snack-restaurant"
                    src="/crystal.png"
                    alt="Snack Restaurant"
                    title="Snack Restaurant"
                    description="Quick bites and light meals perfect for a casual lunch or afternoon snack."
                />
            </Suspense>
        </div>
    );
}