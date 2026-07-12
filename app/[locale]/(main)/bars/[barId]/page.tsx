import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getPublicBarMenu, getPublicBars } from "@/lib/content"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuItemCard } from "@/components/a-la-carte/menu-item-card"
import type { MenuItem } from "@/lib/types/menu"

// Prerender the menus of known bars; ones added later render on demand.
export async function generateStaticParams() {
  const rows = await getPublicBars("en")
  return rows.map((bar) => ({ barId: bar.id }))
}

export default async function BarMenuPage({
  params,
}: {
  params: Promise<{ locale: string; barId: string }>
}) {
  const { locale, barId } = await params
  setRequestLocale(locale)
  const t = await getTranslations("bars")

  const { bar, items, categories: allCategories } = await getPublicBarMenu(barId, locale)

  if (!bar) notFound()

  const itemsWithImages: MenuItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: 0,
    category: item.category,
    priceText: item.priceText,
  }))

  // Only show categories that actually have items for this bar, preserving DB
  // order; unknown category ids used by items still get a tab.
  const itemCategoryIds = new Set(items.map((i) => i.category))
  const knownIds = new Set(allCategories.map((c) => c.id))
  const categories = [
    ...allCategories.filter((c) => itemCategoryIds.has(c.id)),
    ...[...itemCategoryIds].filter((id) => !knownIds.has(id)).map((id) => ({ id, label: id })),
  ]

  const hours = [bar.openTime?.slice(0, 5), bar.closeTime?.slice(0, 5)].filter(Boolean).join(" – ")

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">{bar.name}</h2>

      {items.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-center">{t("notAvailable")}</p>
      ) : (
        <Tabs defaultValue={categories[0]?.id} className="w-full">
          <TabsList className="mb-4 w-full justify-start gap-2 overflow-x-auto">
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
      )}
    </div>
  )
}
