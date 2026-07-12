import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ServiceItemCard } from '@/components/room-service/service-item-card'
import { getPublicRoomServiceItems, getPublicRoomServiceCategories } from '@/lib/content'

export default async function RoomService({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('roomService')
  const [items, allCategories] = await Promise.all([
    getPublicRoomServiceItems(locale),
    getPublicRoomServiceCategories(locale),
  ])

  // Only show categories that actually have items, preserving DB order
  const itemCategoryIds = new Set(items.map((item) => item.category))
  const activeCategories = allCategories.filter((c) => itemCategoryIds.has(c.id))

  // Catch any categories in the items that aren't in roomServiceCategories yet
  const knownIds = new Set(allCategories.map((c) => c.id))
  const extraCategories = [...itemCategoryIds]
    .filter((id) => !knownIds.has(id))
    .map((id) => ({ id, label: id, orderIndex: 999 }))

  const categories = [...activeCategories, ...extraCategories]

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
      <p className="text-muted-foreground mb-6">
        {t('subtitle')}
      </p>

      <Tabs defaultValue={categories[0]?.id} className="w-full">
        <TabsList className="mb-4 w-full justify-start gap-2 overflow-x-auto">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm">
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="space-y-0">
              {items
                .filter((item) => item.category === category.id)
                .map((item, index, array) => (
                  <ServiceItemCard
                    key={item.id}
                    item={item}
                    showSeparator={index !== array.length - 1}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
