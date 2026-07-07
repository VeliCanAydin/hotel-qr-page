import { getNearbyGuideItems } from "@/lib/actions/nearby-guide"

import NearbyGuideClient from "./nearby-guide-client"


export default async function NearbyGuideAdminPage() {
  const items = await getNearbyGuideItems()
  return <NearbyGuideClient initialItems={items} />
}