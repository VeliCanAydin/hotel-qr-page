import { getPublicBeachPoolsInfo } from "@/lib/content"
import BeachPoolsContent from "./beach-pools-content"

export default async function BeachPage() {
  const info = await getPublicBeachPoolsInfo()
  return <BeachPoolsContent info={info} />
}
