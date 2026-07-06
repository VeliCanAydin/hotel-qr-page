'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Periodically re-fetches the current route's server data so operational
// screens (orders, support requests) show new records without a manual
// reload. Skips ticks while the tab is hidden.
export function useAutoRefresh(intervalMs = 30_000) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        router.refresh()
      }
    }, intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])
}
