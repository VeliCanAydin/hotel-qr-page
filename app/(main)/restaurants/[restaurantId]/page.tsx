import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { menuItems, menuItemImages, menuCategories, restaurants } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuItemCard } from "@/components/a-la-carte/MenuItemCard"
import type { MenuItem } from "@/lib/data/a-la-carte-menu"

export const dynamic = 'force-dynamic'

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>
}) {
  const { restaurantId } = await params

  const [restaurantRows, items, images, allCategories] = await Promise.all([
    db.select().from(restaurants).where(eq(restaurants.id, restaurantId)).limit(1),
    db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId)),
    db.select().from(menuItemImages),
    db.select().from(menuCategories).orderBy(asc(menuCategories.orderIndex)),
  ])

  const restaurant = restaurantRows[0]
  if (!restaurant) notFound()

  const imageMap = Object.fromEntries(images.map((img) => [img.itemId, img.proxyUrl]))

  const itemsWithImages: MenuItem[] = items.map((item) => ({
    ...item,
    image: imageMap[item.id],
    // Normalize allergens: may be stored as JSON string or array or empty
    allergens: (() => {
      const raw = (item as any).allergens
      if (!raw) return []
      if (Array.isArray(raw)) return raw
      try {
        const p = JSON.parse(raw as unknown as string)
        return Array.isArray(p) ? p : []
      } catch {
        return []
      }
    })(),
  }))

  // Only show categories that actually have items for this restaurant, preserving DB order
  const itemCategoryIds = new Set(items.map((i) => i.category))
  const activeCategories = allCategories.filter((c) => itemCategoryIds.has(c.id))

  // Catch any categories in the items that aren't in menuCategories yet
  const knownIds = new Set(allCategories.map((c) => c.id))
  const extraCategories = [...itemCategoryIds]
    .filter((id) => !knownIds.has(id))
    .map((id) => ({ id, label: id, orderIndex: 999 }))

  const categories = [...activeCategories, ...extraCategories]

  if (items.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-3xl font-bold mb-4">{restaurant.name}</h2>
        <p className="text-muted-foreground mt-8 text-center">Menu is not available yet.</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">{restaurant.name}</h2>

      <Tabs defaultValue={categories[0]?.id}>
        <TabsList className="mb-4 w-full gap-2 overflow-x-auto">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="divide-y">
              {itemsWithImages
                .filter((item) => item.category === category.id)
                .map((item, index, filtered) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    showSeparator={index < filtered.length - 1}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
