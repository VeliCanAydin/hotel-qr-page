"use client"

import { useActionState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { login } from "@/lib/actions/auth"
import { guestLogin } from "@/lib/actions/guest-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Loader2 } from "lucide-react"

// Router stays on next/navigation: guest login lands on /portal (locale-prefixed
// by middleware) while staff login lands on the locale-less /dashboard.
function GuestLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') ?? ''
  const locale = useLocale()
  const [state, formAction, isPending] = useActionState(guestLogin, { error: "" })
  const t = useTranslations('login')
  const tErrors = useTranslations('errors')

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state.redirectTo, router])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectPath} />
      {/* Written to the reservation so push notifications use the guest's language. */}
      <input type="hidden" name="locale" value={locale} />
      <div className="space-y-2">
        <Label htmlFor="guest-room-number">{t('roomNumber')}</Label>
        <Input
          id="guest-room-number"
          name="roomNumber"
          type="text"
          placeholder={t('roomNumberPlaceholder')}
          autoComplete="off"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guest-surname">{t('surname')}</Label>
        <Input
          id="guest-surname"
          name="surname"
          type="text"
          placeholder={t('surnamePlaceholder')}
          autoComplete="family-name"
          required
        />
      </div>

      {state.error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{tErrors.has(state.error) ? tErrors(state.error) : tErrors('generic')}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('signInAsGuest')}
      </Button>
    </form>
  )
}

function StaffLoginForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(login, { error: "" })
  const t = useTranslations('login')

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state.redirectTo, router])

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="staff-email">{t('email')}</Label>
        <Input
          id="staff-email"
          name="email"
          type="email"
          placeholder="admin@dosinia.com"
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="staff-password">{t('password')}</Label>
        <Input
          id="staff-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('signInAsStaff')}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  const t = useTranslations('login')

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>Dosinia Luxury Hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="guest">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="guest">{t('guestTab')}</TabsTrigger>
              <TabsTrigger value="staff">{t('staffTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="guest">
              <Suspense fallback={<div className="h-48" />}>
                <GuestLoginForm />
              </Suspense>
            </TabsContent>
            <TabsContent value="staff">
              <StaffLoginForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
