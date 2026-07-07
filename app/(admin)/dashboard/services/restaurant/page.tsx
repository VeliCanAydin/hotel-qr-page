
import { db } from '@/lib/db'
import { menuItems, menuItemImages, menuCategories } from '@/lib/db/schema'
import { getRestaurants } from '@/lib/actions/restaurants'
import { getMenuTemplates } from '@/lib/actions/menu-templates'
import { asc } from 'drizzle-orm'
import RestaurantClient from './restaurant-client'

export default async function RestaurantPage() {
  const [restaurantRows, allMenuItems, images, dbCategories] = await Promise.all([
    getRestaurants(),
    db.select().from(menuItems),
    db.select().from(menuItemImages),
    db.select().from(menuCategories).orderBy(asc(menuCategories.orderIndex)),
  ])

  const templatesByRestaurant = Object.fromEntries(
    await Promise.all(
      restaurantRows.map(async (r) => [r.id, await getMenuTemplates(r.id)])
    )
  )

  const imageMap = Object.fromEntries(images.map((i) => [i.itemId, i.proxyUrl]))

  const menuItemsTyped = allMenuItems.map((item) => ({
    ...item,
    image: imageMap[item.id] as string | undefined,
  }))

  return (
    <RestaurantClient
      initialRestaurants={restaurantRows}
      initialMenuItems={menuItemsTyped}
      initialTemplatesByRestaurant={templatesByRestaurant}
      initialCategories={dbCategories}
    />
  )
}
