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

export const nearbyGuideItems: NearbyGuideItem[] = [
  {
    id: "pharmacy",
    name: "Pharmacy",
    distance: "280 m",
    eta: "4 min walk",
    note: "Open • 24 hours",
    phone: "+90 242 000 00 01",
    mapQuery: "nearest pharmacy near Dosinia Luxury Hotel Kemer",
    tone: "emerald",
    section: "Nearby Essentials",
    iconKey: "pill",
    orderIndex: 0,
  },
  {
    id: "market",
    name: "Market",
    distance: "190 m",
    eta: "3 min walk",
    note: "Daily essentials",
    mapQuery: "grocery market near Dosinia Luxury Hotel Kemer",
    tone: "sky",
    section: "Nearby Essentials",
    iconKey: "basket",
    orderIndex: 1,
    phone: null,
  },
  {
    id: "bus-stop",
    name: "Bus Stop",
    distance: "120 m",
    eta: "1 min walk",
    note: "Frequent service",
    mapQuery: "bus stop near Dosinia Luxury Hotel Kemer",
    tone: "amber",
    section: "Nearby Essentials",
    iconKey: "bus",
    orderIndex: 2,
    phone: null,
  },
  {
    id: "taxi-stand",
    name: "Taxi Stand",
    distance: "95 m",
    eta: "1 min walk",
    note: "24/7 service",
    phone: "+90 242 000 00 02",
    mapQuery: "taxi stand near Dosinia Luxury Hotel Kemer",
    tone: "rose",
    section: "Nearby Essentials",
    iconKey: "taxi",
    orderIndex: 3,
  },
  {
    id: "atm",
    name: "ATM",
    distance: "340 m",
    eta: "5 min walk",
    note: "In the center",
    mapQuery: "ATM near Dosinia Luxury Hotel Kemer",
    tone: "violet",
    section: "Nearby Essentials",
    iconKey: "badge",
    orderIndex: 4,
    phone: null,
  },
  {
    id: "health-center",
    name: "Health Center",
    distance: "2.1 km",
    eta: "6 min by taxi",
    note: "For urgent access",
    phone: "+90 242 000 00 03",
    mapQuery: "hospital near Dosinia Luxury Hotel Kemer",
    tone: "red",
    section: "Nearby Essentials",
    iconKey: "alert",
    orderIndex: 5,
  },
  {
    id: "moonlight-park",
    name: "Moonlight Park & Beach",
    distance: "3.2 km",
    eta: "10 min by taxi",
    note: "Sea view and promenade",
    mapQuery: "Moonlight Park and Beach Kemer",
    tone: "sky",
    section: "Tourist Attractions",
    iconKey: "tree",
    orderIndex: 0,
    phone: null,
  },
  {
    id: "kemer-marina",
    name: "Kemer Marina",
    distance: "3.6 km",
    eta: "12 min by taxi",
    note: "Shopping and sunset views",
    mapQuery: "Kemer Marina",
    tone: "emerald",
    section: "Tourist Attractions",
    iconKey: "map",
    orderIndex: 1,
    phone: null,
  },
  {
    id: "phaselis",
    name: "Phaselis Ancient City",
    distance: "16.5 km",
    eta: "25 min by taxi",
    note: "Historic coastal ruins",
    mapQuery: "Phaselis Ancient City",
    tone: "amber",
    section: "Tourist Attractions",
    iconKey: "landmark",
    orderIndex: 2,
    phone: null,
  },
]