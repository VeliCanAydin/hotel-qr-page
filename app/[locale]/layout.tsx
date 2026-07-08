import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Manrope } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { ThemeProvider } from '@/components/theme-provider'
import { CartProvider } from '@/context/cart-context'
import { HMRBodyUnlocker } from '@/components/hmr-body-unlocker'
import '../globals.css'

const manrope = Manrope({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: '#1e3a5f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Dosinia Luxury Hotel',
  description: 'Experience the best luxury stay at Dosinia Hotel.',
  keywords: ['hotel', 'luxury', 'stay', 'Dosinia'],
  authors: [{ name: 'Dosinia Team', url: 'https://dosinia.com' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dosinia',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-128x128.png',
    apple: '/icons/icon-128x128.png',
  },
}

// Statically render all four locales at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// Root layout for all guest surfaces — owns <html> so `lang` reflects the
// active locale. The admin panel has its own root layout in app/(admin).
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Required for static rendering under cacheComponents/PPR — without this the
  // page falls back to dynamic rendering (see plan §2.3 / tuzak #2).
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning className={manrope.className}>
      <body>
        <ThemeProvider attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <CartProvider>
            <NextIntlClientProvider>{children}</NextIntlClientProvider>
          </CartProvider>
        </ThemeProvider>
        <HMRBodyUnlocker />
      </body>
    </html>
  )
}
