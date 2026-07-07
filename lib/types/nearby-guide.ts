import type { LucideIcon } from "lucide-react"
import { BadgeCheck, BusFront, CarTaxiFront, Landmark, MapPinned, Pill, ShoppingBasket, TreePalm, TriangleAlert } from "lucide-react"

export type NearbyGuideSection = "Nearby Essentials" | "Tourist Attractions"

export type NearbyGuideIconKey =
  | "pill"
  | "basket"
  | "bus"
  | "taxi"
  | "badge"
  | "alert"
  | "map"
  | "tree"
  | "landmark"

export type NearbyGuideItem = {
  id: string
  name: string
  distance: string
  eta: string
  note: string
  phone: string | null
  mapQuery: string
  tone: string
  section: NearbyGuideSection
  iconKey: NearbyGuideIconKey
  orderIndex: number
}

export const nearbyGuideIconMap: Record<NearbyGuideIconKey, LucideIcon> = {
  pill: Pill,
  basket: ShoppingBasket,
  bus: BusFront,
  taxi: CarTaxiFront,
  badge: BadgeCheck,
  alert: TriangleAlert,
  map: MapPinned,
  tree: TreePalm,
  landmark: Landmark,
}
