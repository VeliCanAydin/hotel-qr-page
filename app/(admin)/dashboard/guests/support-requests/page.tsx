export const dynamic = 'force-dynamic'

import SupportRequestsClient from './support-requests-client'
import { getGuestSupportRequests } from '@/lib/actions/support-requests'
import type { GuestSupportRequest } from '@/lib/actions/support-requests'

export default async function Page() {
  let requests: GuestSupportRequest[] = []
  try {
    requests = await getGuestSupportRequests()
  } catch (err) {
    // If something unexpected happens, log and show empty list to the client.
    // eslint-disable-next-line no-console
    console.error('[admin/support-requests] failed to load requests:', err)
    requests = []
  }

  // Format createdAt on the server and send the formatted string to the client to
  // avoid hydration mismatches caused by different locale formatting on server vs client.
  const enriched = requests.map((r) => ({
    ...r,
    createdAtFormatted: new Date(r.createdAt).toLocaleString('en-GB'),
  }))

  return <SupportRequestsClient initialRequests={enriched} />
}
