
import SupportRequestsClient from './support-requests-client'
import { countGuestSupportRequests, getGuestSupportRequests } from '@/lib/actions/support-requests'
import type { GuestSupportRequest } from '@/lib/actions/support-requests'

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 1000

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>
}) {
  const { limit: limitParam } = await searchParams
  const limit = Math.min(Math.max(Number(limitParam) || DEFAULT_LIMIT, DEFAULT_LIMIT), MAX_LIMIT)

  // No try/catch: the auth check inside reads cookies(), which rejects with a
  // control-flow sentinel during prerender — swallowing it would bake an
  // empty list into the static shell.
  const [requests, totalCount]: [GuestSupportRequest[], number] = await Promise.all([
    getGuestSupportRequests(limit),
    countGuestSupportRequests(),
  ])

  // Format createdAt on the server and send the formatted string to the client to
  // avoid hydration mismatches caused by different locale formatting on server vs client.
  const enriched = requests.map((r) => ({
    ...r,
    createdAtFormatted: new Date(r.createdAt).toLocaleString('en-GB'),
  }))

  return <SupportRequestsClient initialRequests={enriched} totalCount={totalCount} limit={limit} />
}
