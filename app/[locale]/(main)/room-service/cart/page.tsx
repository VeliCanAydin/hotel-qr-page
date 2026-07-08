import { cookies } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth';
import CartClient from './cart-client';

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value;
  const guest = token ? await verifyGuestToken(token) : null;

  return <CartClient isLoggedIn={!!guest} guestSurname={guest?.surname} />;
}
