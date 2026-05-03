"use client"

import {
  LayoutDashboard,
  Hotel,
  Utensils,
  HandPlatter,
  Flower,
  TreePalm,
  CalendarDays,
  Baby,
  Bot,
  MessageSquare,
} from 'lucide-react'
import { GuestNav } from './guest-nav'
import { GuestUser } from './guest-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import type { GuestReservation } from '@/lib/data/mockReservations'

const navItems = [
  { title: 'My Stay', url: '/portal', icon: LayoutDashboard },
  { title: 'Reservation', url: '/portal/reservation', icon: Hotel },
  { title: 'Restaurants', url: '/restaurants', icon: Utensils, external: true },
  { title: 'Room Service', url: '/room-service', icon: HandPlatter, external: true },
  { title: 'Spa & Wellness', url: '/spa', icon: Flower, external: true },
  { title: 'Beach & Pools', url: '/beach-pools', icon: TreePalm, external: true },
  { title: 'Events', url: '/events', icon: CalendarDays, external: true },
  { title: 'Kids Care', url: '/kids-care', icon: Baby, external: true },
  { title: 'AI Assistant', url: '/ai-assistant', icon: Bot, external: true },
  { title: 'Feedback', url: '/feedback', icon: MessageSquare, external: true },
]

export function GuestSidebar({ reservation }: { reservation: GuestReservation }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Hotel className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Dosinia Luxury Resort</span>
            <span className="truncate text-xs text-muted-foreground">Room {reservation.roomNumber}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <GuestNav items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <GuestUser reservation={reservation} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
