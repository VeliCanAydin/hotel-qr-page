'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/cart-context';
import { Minus, Plus, Trash2, ShoppingBag, LogIn, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { createRoomServiceOrder } from '@/lib/actions/room-service-orders';
import type { OrderItem } from '@/lib/actions/room-service-orders';

interface CartClientProps {
  isLoggedIn: boolean;
  guestSurname?: string;
}

export default function CartClient({ isLoggedIn }: CartClientProps) {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState('');
  const router = useRouter();
  const t = useTranslations('cart');

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setOrderError('');
    const orderItems: OrderItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const result = await createRoomServiceOrder(orderItems, note);

    if ('error' in result) {
      if (result.redirectTo) {
        router.push(result.redirectTo);
        return;
      }
      setOrderError(result.error);
      setIsSubmitting(false);
      return;
    }

    clearCart();
    setNote('');
    setOrderPlaced(true);
    setIsSubmitting(false);
  };

  if (orderPlaced) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('orderPlaced')}</h2>
        <p className="text-muted-foreground mb-6 text-center">
          {t('orderPlacedDesc')}
        </p>
        <Link href="/room-service">
          <Button>{t('backToRoomService')}</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('empty')}</h2>
        <p className="text-muted-foreground mb-6 text-center">
          {t('emptyDesc')}
        </p>
        <Link href="/room-service">
          <Button>{t('browse')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
      <p className="text-muted-foreground mb-6">
        {t('subtitle')}
      </p>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="py-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.price === 0 ? t('free') : t('priceEach', { price: `$${item.price.toFixed(2)}` })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="font-semibold">
                  {item.price === 0 ? t('free') : `$${(item.price * item.quantity).toFixed(2)}`}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-6" />

      <Card className="py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('orderNote')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Textarea
            placeholder={t('orderNotePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      <Card className="mt-4 py-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>{t('total')}</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex-col gap-2">
          {orderError ? (
            <p className="w-full text-sm text-destructive" role="alert">
              {orderError}
            </p>
          ) : null}
          {isLoggedIn ? (
            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('placingOrder') : t('placeOrder')}
            </Button>
          ) : (
            <Link href="/login?redirect=/room-service/cart" className="w-full">
              <Button className="w-full" size="lg" variant="secondary">
                <LogIn className="h-4 w-4 mr-2" />
                {t('loginToOrder')}
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
