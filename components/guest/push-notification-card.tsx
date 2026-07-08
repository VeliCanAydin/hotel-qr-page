'use client'

import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Bell, BellOff, Share, SquarePlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { usePushSubscription } from '@/hooks/use-push-subscription'

export function PushNotificationCard() {
  const t = useTranslations('portal')
  const tErrors = useTranslations('errors')
  const { status, isBusy, subscribe, unsubscribe } = usePushSubscription()

  // Browsers with no Push API at all get nothing — a card they can't act on
  // is just noise. iOS Safari outside a Home Screen install is the exception:
  // it CAN get push after installing, so we show the how-to instead.
  if (status === 'loading' || status === 'unsupported') return null

  async function handleToggle(enable: boolean) {
    const result = enable ? await subscribe() : await unsubscribe()
    if ('error' in result) {
      toast.info(tErrors.has(result.error) ? tErrors(result.error) : tErrors('generic'))
    } else {
      toast.success(enable ? t('notifOn') : t('notifOff'))
    }
  }

  return (
    <Card className="gap-3">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-l font-bold">{t('notifications')}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {status === 'ios-needs-install' ? (
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Bell className="h-5 w-5 shrink-0 mt-0.5" />
            <p>
              {t.rich('iosInstall', {
                share: () => <Share className="inline h-3.5 w-3.5 align-text-bottom" />,
                add: () => <SquarePlus className="inline h-3.5 w-3.5 align-text-bottom" />,
              })}
            </p>
          </div>
        ) : status === 'denied' ? (
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <BellOff className="h-5 w-5 shrink-0 mt-0.5" />
            <p>
              {t('denied')}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-tight">{t('orderUpdates')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('orderUpdatesDesc')}
                </p>
              </div>
            </div>
            <Switch
              checked={status === 'subscribed'}
              disabled={isBusy}
              onCheckedChange={handleToggle}
              aria-label={t('togglePush')}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
