'use client'

import { useEffect, useState } from 'react'

// The current year can't be read during prerender (cacheComponents forbids
// uncached clock access), so it fills in after mount.
export function FooterYear() {
  const [year, setYear] = useState<number | null>(null)
  useEffect(() => setYear(new Date().getFullYear()), [])
  return <>{year ?? ''}</>
}
