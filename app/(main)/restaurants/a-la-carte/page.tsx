"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuItemCard } from "@/components/a-la-carte/MenuItemCard";
import { menuItems, categories } from "@/lib/data/aLaCarteMenu";

export default function ALaCartePage() {
    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold mb-4">A La Carte</h2>

            <Tabs defaultValue="appetizers" >
                <TabsList className="mb-4 w-full gap-2 overflow-x-auto ">
                    {categories.map((category) => (
                        <TabsTrigger key={category.id} value={category.id}>
                            {category.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {categories.map((category) => (
                    <TabsContent key={category.id} value={category.id}>
                        <div className="divide-y">
                            {menuItems
                                .filter((item) => item.category === category.id)
                                .map((item, index, filteredItems) => (
                                    <MenuItemCard
                                        key={item.id}
                                        item={item}
                                        showSeparator={index < filteredItems.length - 1}
                                    />
                                ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}