import { getNearbyGuideItems } from "@/lib/actions/nearby-guide"

import NearbyGuideClient from "./nearby-guide-client"

export const dynamic = 'force-dynamic'

export default async function NearbyGuideAdminPage() {
  const items = await getNearbyGuideItems()
  return <NearbyGuideClient initialItems={items} />
}