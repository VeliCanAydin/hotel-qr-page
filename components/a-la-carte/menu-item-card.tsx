"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, Leaf } from "lucide-react";
import type { MenuItem } from "@/lib/types/menu";
import { ALLERGENS as STATIC_ALLERGENS } from "@/lib/data/allergens";

interface MenuItemCardProps {
    item: MenuItem;
    showSeparator?: boolean;
}

export function MenuItemCard({ item, showSeparator = true }: MenuItemCardProps) {
    const t = useTranslations("menuItemCard")
    const tCommon = useTranslations("common")
    const locale = useLocale()
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [allergenMeta, setAllergenMeta] = useState<{ id: string; label: string; icon: string }[]>(STATIC_ALLERGENS)

    useEffect(() => {
        let mounted = true
        fetch(`/api/allergens?locale=${locale}`)
            .then((r) => r.json())
            .then((data) => {
                if (mounted && Array.isArray(data)) setAllergenMeta(data)
            })
            .catch(() => {
                /* keep fallback */
            })
        return () => { mounted = false }
    }, [locale])

    const allergens: string[] = (() => {
        if (!item.allergens) return []
        if (Array.isArray(item.allergens)) return item.allergens
        try {
            const parsed = JSON.parse(item.allergens as unknown as string)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    })()

    return (
        <>
            <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                className="flex w-full items-center gap-3 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-md"
            >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                        <h3 className="flex items-center gap-1.5 font-semibold text-foreground truncate">
                            <span className="truncate">{item.name}</span>
                            {item.isVegetarian && (
                                <Leaf className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-500" />
                            )}
                        </h3>
                        <span className="shrink-0 font-semibold text-foreground">
                            ${item.price.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                    </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
            </button>
            {showSeparator && <Separator />}

            <Drawer open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DrawerContent className="max-h-[90vh]">
                    <div className="overflow-y-auto">
                        {item.image && (
                            <div className="px-4 pt-4">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-48 w-full rounded-lg border object-cover"
                                />
                            </div>
                        )}
                        <DrawerHeader className="text-left">
                            <div className="flex items-start justify-between gap-3">
                                <DrawerTitle className="text-xl">{item.name}</DrawerTitle>
                                <span className="shrink-0 text-xl font-semibold text-foreground">
                                    ${item.price.toFixed(2)}
                                </span>
                            </div>
                            {item.isVegetarian && (
                                <Badge
                                    variant="outline"
                                    className="w-fit gap-1 border-green-600 text-green-600 dark:border-green-500 dark:text-green-500 text-[10px] px-1.5 py-0"
                                >
                                    <Leaf className="h-3 w-3" />
                                    {t("vegetarian")}
                                </Badge>
                            )}
                            <DrawerDescription className="text-base leading-relaxed whitespace-pre-line">
                                {item.description}
                            </DrawerDescription>
                        </DrawerHeader>
                        {allergens.length > 0 && (
                            <div className="px-4 pb-2">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    {t("allergens")}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {allergens.map((a) => {
                                        const meta = allergenMeta.find((x) => x.id === a)
                                        return (
                                            <Badge
                                                key={a}
                                                variant="outline"
                                                className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-medium"
                                            >
                                                <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-border">
                                                    <img
                                                        src={meta?.icon ?? '/api/allergen-icons/nuts'}
                                                        alt=""
                                                        className="h-full w-full object-contain p-0.5"
                                                    />
                                                </span>
                                                {meta?.label ?? a}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <DrawerFooter className="border-t border-border/60">
                        <DrawerClose asChild>
                            <Button variant="outline" className="w-full rounded-full">
                                {tCommon("close")}
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
