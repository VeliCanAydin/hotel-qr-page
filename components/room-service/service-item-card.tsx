'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { useTranslations } from 'next-intl';
import { useCart } from '@/context/cart-context';
import type { RoomServiceItem } from '@/lib/types/room-service';
import { Plus, Minus } from 'lucide-react';

interface ServiceItemCardProps {
    item: RoomServiceItem;
    showSeparator?: boolean;
}

export function ServiceItemCard({ item, showSeparator = true }: ServiceItemCardProps) {
    const t = useTranslations('roomService');
    const tCommon = useTranslations('common');
    const { items, addToCart, updateQuantity } = useCart();
    const [detailsOpen, setDetailsOpen] = useState(false);
    const cartItem = items.find((i) => i.id === item.id);
    const quantity = cartItem?.quantity ?? 0;

    const priceLabel = item.price === 0 ? t('free') : `$${item.price.toFixed(2)}`;

    const quantityControls = (
        <div className="flex items-center gap-1">
            <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.id, quantity - 1)}
            >
                <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-6 text-center text-sm font-semibold tabular-nums">
                {quantity}
            </span>
            <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => addToCart(item)}
            >
                <Plus className="h-3.5 w-3.5" />
            </Button>
        </div>
    );

    return (
        <>
            <div className="flex items-center gap-4 py-4">
                <button
                    type="button"
                    onClick={() => setDetailsOpen(true)}
                    className="flex min-w-0 flex-1 flex-col gap-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-md"
                >
                    <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                        <span className="shrink-0 font-semibold text-foreground">{priceLabel}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                    </p>
                </button>
                <div className="flex items-center shrink-0">
                    {quantity === 0 ? (
                        <Button size="sm" variant="outline" onClick={() => addToCart(item)}>
                            <Plus className="h-4 w-4 mr-1" />
                            {t('add')}
                        </Button>
                    ) : (
                        quantityControls
                    )}
                </div>
            </div>
            {showSeparator && <Separator />}

            <Drawer open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <div className="flex items-start justify-between gap-3">
                            <DrawerTitle className="text-xl">{item.name}</DrawerTitle>
                            <span className="shrink-0 text-xl font-semibold text-foreground">
                                {priceLabel}
                            </span>
                        </div>
                        <DrawerDescription className="text-base leading-relaxed whitespace-pre-line">
                            {item.description}
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter className="border-t border-border/60">
                        {quantity === 0 ? (
                            <Button className="w-full rounded-full" onClick={() => addToCart(item)}>
                                <Plus className="h-4 w-4 mr-1" />
                                {t('add')}
                            </Button>
                        ) : (
                            <div className="flex items-center justify-center gap-3">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-10 w-10 rounded-full"
                                    onClick={() => updateQuantity(item.id, quantity - 1)}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center text-lg font-semibold tabular-nums">
                                    {quantity}
                                </span>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-10 w-10 rounded-full"
                                    onClick={() => addToCart(item)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <DrawerClose asChild>
                            <Button variant="outline" className="w-full rounded-full">
                                {tCommon('close')}
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
