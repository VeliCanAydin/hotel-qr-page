import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuItemCard } from "@/components/a-la-carte/MenuItemCard"
import { categories } from "@/lib/data/aLaCarteMenu"
import { db } from "@/lib/db"
import { menuItems } from "@/lib/db/schema"
import { type MenuItem } from "@/lib/data/aLaCarteMenu"

export default async function ALaCartePage() {
  const items = await db.select().from(menuItems)

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">A La Carte</h2>

      <Tabs defaultValue="appetizers">
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
              {items
                .filter((item) => item.category === category.id)
                .map((item, index, filteredItems) => (
                  <MenuItemCard
                    key={item.id}
                    item={item as MenuItem}
                    showSeparator={index < filteredItems.length - 1}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
