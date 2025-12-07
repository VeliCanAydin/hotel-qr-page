import RestaurantCard from "@/components/RestaurantCard";
import { Suspense } from "react";
import RestaurantCardSkeleton from "@/components/RestaurantCardSkeleton";

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
            "Award-winning chef"
        ]
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
            "Theme nights on weekends"
        ]
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
            "No reservation needed"
        ]
    }
];

export default function RestaurantsPage() {
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
    );
}