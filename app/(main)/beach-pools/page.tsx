import { getBeachPoolsInfo } from "@/lib/actions/beach-pools"
import BeachPoolsContent from "./beach-pools-content"

export default async function BeachPage() {
  const info = await getBeachPoolsInfo()
  return <BeachPoolsContent info={info} />
}
