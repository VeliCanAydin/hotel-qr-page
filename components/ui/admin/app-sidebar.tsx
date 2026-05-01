"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  ShoppingCart,
  TreePalm,
  Utensils,
  Users,
  Hotel,
  Flower,
  CalendarDays,
  Camera,
  HandPlatter,
} from "lucide-react"

import { NavMain } from "@/components/ui/admin/nav-main"
import { NavProjects } from "@/components/ui/admin/nav-projects"
import { NavUser } from "@/components/ui/admin/nav-user"
import { TeamSwitcher } from "@/components/ui/admin/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Admin User",
    email: "admin@dosinia.com",
    avatar: "/avatars/admin.jpg",
  },

  // If you manage multiple hotel locations or departments
  teams: [
    {
      name: "Dosinia Luxury Resort",
      logo: Hotel, // from lucide-react
      plan: "Main Location",
    },
    // {
    //   name: "Grand Ring Hotel",
    //   logo: Hotel,
    //   plan: "Department",
    // },
    // {
    //   name: "Just Inn City Hotel",
    //   logo: Hotel,
    //   plan: "Department",
    // },
  ],

  // Main navigation groups
  navMain: [
    {
      title: "Content Management",
      url: "/dashboard/content",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Hotel Info",
          url: "/dashboard/content/hotel-info",
        },
        {
          title: "Kids Care",
          url: "/dashboard/content/kids-care",
        },
        {
          title: "Beach & Pools",
          url: "/dashboard/content/beach-pools",
        },
        {
          title: "Spa",
          url: "/dashboard/content/spa",
        },
        {
          title: "Wellness",
          url: "/dashboard/content/wellness",
        }
      ],
    },
    {
      title: "Services",
      url: "/dashboard/services",
      icon: HandPlatter,
      items: [
        {
          title: "Restaurant",
          url: "/dashboard/services/restaurant",
        },
        {
          title: "Room Service",
          url: "/dashboard/services/spa",
        }
      ],
    },
    {
      title: "Orders & Requests",
      url: "/dashboard/orders",
      icon: ShoppingCart,
      items: [
        {
          title: "Room Service Orders",
          url: "/dashboard/orders/room-service",
        },
        {
          title: "Spa Bookings",
          url: "/dashboard/orders/spa-bookings",
        },
        {
          title: "Event Registrations",
          url: "/dashboard/orders/events",
        },
        {
          title: "Special Requests",
          url: "/dashboard/orders/requests",
        },
      ],
    },
    {
      title: "AI Assistant",
      url: "/dashboard/ai",
      icon: Bot,
      items: [
        {
          title: "Chat Logs",
          url: "/dashboard/ai/chat-logs",
        },
        {
          title: "Training Data",
          url: "/dashboard/ai/training",
        },
        {
          title: "AI Settings",
          url: "/dashboard/ai/settings",
        },
      ],
    },
    {
      title: "Guest Management",
      url: "/dashboard/guests",
      icon: Users,
      items: [
        {
          title: "Guest List",
          url: "/dashboard/guests/list",
        },
        {
          title: "Feedback & Reviews",
          url: "/dashboard/guests/feedback",
        },
        {
          title: "Room Assignments",
          url: "/dashboard/guests/rooms",
        },
        {
          title: "Check-in/Check-out",
          url: "/dashboard/guests/checkin",
        },
      ],
    },
    {
      title: "Events Calendar",
      url: "/dashboard/events",
      icon: CalendarDays,
      items: [
        {
          title: "Create Event",
          url: "/dashboard/events/create",
        },
        {
          title: "List Events",
          url: "/dashboard/events/list",
        },
        {
          title: "Event Bookings",
          url: "/dashboard/events",
        },
        {
          title: "Send Invitations",
          url: "/dashboard/events/invitations",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/dashboard/settings/general",
        },
        {
          title: "Staff Management",
          url: "/dashboard/settings/staff",
        },
        {
          title: "Notifications",
          url: "/dashboard/settings/notifications",
        },
        {
          title: "Integrations",
          url: "/dashboard/settings/integrations",
        },
      ],
    },
  ],

  // Quick access projects/sections
  projects: [
    {
      name: "Restaurant Menus",
      url: "/dashboard/content/restaurants",
      icon: Utensils,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
