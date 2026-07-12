import RestaurantCard from "@/components/restaurant-card"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getPublicHotelInfo, getPublicRestaurants } from "@/lib/content"


// Images for the original three restaurants; new ones get the default
const RESTAURANT_IMAGES: Record<string, string> = {
  'a-la-carte': '/azure.png',
  'main-restaurant': '/gold.png',
  'snack-restaurant': '/crystal.png',
}
const DEFAULT_IMAGE = '/azure.png'

export default async function RestaurantsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("restaurants")
  const [restaurantRows, hotelInfo] = await Promise.all([
    getPublicRestaurants(locale),
    getPublicHotelInfo(locale),
  ])

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">{t("title")}</h2>
      {restaurantRows
        .filter((r) => !r.id.startsWith('main-restaurant-'))
        .map((r) => {
        const hours = [r.openTime?.slice(0, 5), r.closeTime?.slice(0, 5)].filter(Boolean).join(' – ')
        const mealSlots = r.id === 'main-restaurant'
          ? restaurantRows
              .filter((sub) => sub.id.startsWith('main-restaurant-'))
              .map((sub) => {
                const subHours = [sub.openTime?.slice(0, 5), sub.closeTime?.slice(0, 5)].filter(Boolean).join(' – ')
                return {
                  labelKey: '',
                  label: sub.name,
                  hours: subHours,
                  href: `/restaurants/${sub.id}`,
                }
              })
          : undefined;

        return (
          <RestaurantCard
            key={r.id}
            id={r.id}
            src={RESTAURANT_IMAGES[r.id] ?? DEFAULT_IMAGE}
            alt={r.name}
            title={r.name}
            description={r.description}
            hasReservation={r.reservation}
            openingHours={hours}
            cuisine={r.cuisine}
            contactPhone={hotelInfo.phone}
            contactWhatsapp={hotelInfo.whatsapp}
            mealSlots={mealSlots}
            highlights={[
              r.reservation ? t("reservationRequired") : t("noReservation"),
              r.cuisine,
              hours ? t("openHighlight", { hours }) : '',
            ].filter(Boolean)}
          />
        )
      })}
    </div>
  )
}

