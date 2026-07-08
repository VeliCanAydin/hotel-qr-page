'use client'

import { useCallback, useEffect, useState } from 'react'
import { subscribeToPush, unsubscribeFromPush } from '@/lib/actions/push-subscriptions'

export type PushStatus =
  | 'loading'
  | 'unsupported'      // browser has no service worker / Push API
  | 'ios-needs-install' // iOS Safari: push only works from a Home Screen PWA
  | 'idle'             // supported, not subscribed yet
  | 'subscribed'
  | 'denied'           // permission blocked in browser settings

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0))
}

function isIosWithoutStandalone(): boolean {
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  return isIos && !isStandalone
}

export function usePushSubscription() {
  const [status, setStatus] = useState<PushStatus>('loading')
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function detect() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatus(isIosWithoutStandalone() ? 'ios-needs-install' : 'unsupported')
        return
      }
      if (Notification.permission === 'denied') {
        setStatus('denied')
        return
      }
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      const subscription = await registration?.pushManager.getSubscription()
      if (!cancelled) setStatus(subscription ? 'subscribed' : 'idle')
    }

    detect().catch(() => setStatus('unsupported'))
    return () => {
      cancelled = true
    }
  }, [])

  // `error` values are keys in the `errors` messages namespace — the caller translates them.
  const subscribe = useCallback(async (): Promise<{ ok: true } | { error: string }> => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return { error: 'pushNotConfigured' }

    setIsBusy(true)
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'idle')
        return { error: 'pushNotAllowed' }
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      })

      const json = subscription.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        return { error: 'pushFailed' }
      }

      const result = await subscribeToPush({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      })
      if ('error' in result) {
        await subscription.unsubscribe().catch(() => {})
        return result
      }

      setStatus('subscribed')
      return { ok: true }
    } catch {
      return { error: 'pushFailed' }
    } finally {
      setIsBusy(false)
    }
  }, [])

  const unsubscribe = useCallback(async (): Promise<{ ok: true } | { error: string }> => {
    setIsBusy(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint)
        await subscription.unsubscribe()
      }
      setStatus('idle')
      return { ok: true }
    } catch {
      return { error: 'pushFailed' }
    } finally {
      setIsBusy(false)
    }
  }, [])

  return { status, isBusy, subscribe, unsubscribe }
}
