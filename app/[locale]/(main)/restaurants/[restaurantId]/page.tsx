import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getPublicRestaurantMenu, getPublicRestaurants } from "@/lib/content"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuItemCard } from "@/components/a-la-carte/menu-item-card"
import type { MenuItem } from "@/lib/types/menu"


// Prerender the menus of known restaurants; ones added later render on demand.
export async function generateStaticParams() {
  const rows = await getPublicRestaurants()
  return rows.map((restaurant) => ({ restaurantId: restaurant.id }))
}

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ locale: string; restaurantId: string }>
}) {
  const { locale, restaurantId } = await params
  setRequestLocale(locale)

  const { restaurant, items, images, categories: allCategories } =
    await getPublicRestaurantMenu(restaurantId)

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
