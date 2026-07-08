"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { MenuItem } from "@/lib/types/menu";
import { ALLERGENS as STATIC_ALLERGENS } from "@/lib/data/allergens";

interface MenuItemCardProps {
    item: MenuItem;
    showSeparator?: boolean;
}

export function MenuItemCard({ item, showSeparator = true }: MenuItemCardProps) {
    const t = useTranslations("menuItemCard")
    const [activeAllergen, setActiveAllergen] = useState<string | null>(null)
    const [allergenMeta, setAllergenMeta] = useState<{ id: string; label: string; icon: string }[]>(STATIC_ALLERGENS)

    useEffect(() => {
        let mounted = true
        fetch('/api/allergens')
            .then((r) => r.json())
            .then((data) => {
                if (mounted && Array.isArray(data)) setAllergenMeta(data)
            })
            .catch(() => {
                /* keep fallback */
            })
        return () => { mounted = false }
    }, [])

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
            <div className="flex gap-4 py-4">
                {/* <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized
                    />
                </div> */}
                <div className="flex flex-1 flex-col justify-center gap-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <span className="shrink-0 font-semibold text-foreground">
                            ${item.price.toFixed(2)}
                        </span>
                    </div>
                    {item.isVegetarian && (
                        <Badge 
                            variant="outline" 
                            className="w-fit border-green-600 text-green-600 dark:border-green-500 dark:text-green-500 text-[10px] px-1.5 py-0"
                        >
                            {t("vegetarian")}
                        </Badge>
                    )}
                    {allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {allergens.map((a) => {
                                const meta = allergenMeta.find((x) => x.id === a)
                                const isActive = activeAllergen === a
                                return (
                                    <Badge
                                        key={a}
                                        variant="outline"
                                        className="inline-flex items-center gap-1 rounded-full px-1 py-1 text-[11px] font-medium"
                                        title={meta?.label ?? a}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setActiveAllergen(isActive ? null : a)}
                                            className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-ring/60"
                                            aria-label={meta?.label ?? a}
                                        >
                                            <img
                                                src={meta?.icon ?? '/api/allergen-icons/nuts'}
                                                alt={meta?.label ?? a}
                                                className="h-full w-full object-contain p-0.5"
                                            />
                                        </button>
                                        <span
                                            className={
                                                "overflow-hidden whitespace-nowrap transition-all duration-200 " +
                                                (isActive ? "max-w-24 opacity-100 ml-1" : "max-w-0 opacity-0 ml-0")
                                            }
                                        >
                                            {meta?.label ?? a}
                                        </span>
                                    </Badge>
                                )
                            })}
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                    </p>
                </div>
            </div>
            {showSeparator && <Separator />}
        </>
    );
}
