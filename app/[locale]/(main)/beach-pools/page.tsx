import { setRequestLocale } from "next-intl/server"
import { getPublicBeachPoolsInfo } from "@/lib/content"
import BeachPoolsContent from "./beach-pools-content"

export default async function BeachPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const info = await getPublicBeachPoolsInfo()
  return <BeachPoolsContent info={info} />
}
