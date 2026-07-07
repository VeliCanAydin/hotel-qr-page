
import SupportRequestsClient from './support-requests-client'
import { getGuestSupportRequests } from '@/lib/actions/support-requests'
import type { GuestSupportRequest } from '@/lib/actions/support-requests'

export default async function Page() {
  // No try/catch: the auth check inside reads cookies(), which rejects with a
  // control-flow sentinel during prerender — swallowing it would bake an
  // empty list into the static shell.
  const requests: GuestSupportRequest[] = await getGuestSupportRequests()

  // Format createdAt on the server and send the formatted string to the client to
  // avoid hydration mismatches caused by different locale formatting on server vs client.
  const enriched = requests.map((r) => ({
    ...r,
    createdAtFormatted: new Date(r.createdAt).toLocaleString('en-GB'),
  }))

  return <SupportRequestsClient initialRequests={enriched} />
}
