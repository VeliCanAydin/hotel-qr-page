import { CircleAlert, Utensils, Baby, TreePalm, Flower, HandPlatter, Bot, CalendarDays} from "lucide-react";

export const pages = [
    {
        icon: CircleAlert,
        title: "Hotel Info",
        description: "About the hotel",
        href: "/hotel-info",
    },
    {
        icon: Utensils,
        title: "Restaurant & Bar",
        description: "Menus and dining options",
        href: "/restaurant-bar",
    },
    {
        icon: Baby,
        title: "Kids Care",
        description: "Childcare services",
        href: "/kids-care",
    },
    {
        icon: TreePalm,
        title: "Beach",
        description: "Private beach access and info",
        href: "/beach",
    },
    {
        icon: Flower,
        title: "Spa & Wellness",
        description: "Treatments and classes",
        href: "/spa-wellness",
    },
    {
        icon: HandPlatter,
        title: "Room Service",
        description: "In-Room Dining",
        href: "/room-service",
    },
    {
        icon: Bot,
        title: "AI Assistant",
        description: "Instant help and support",
        href: "/ai-assistant",
    },
    {
        icon: CalendarDays,
        title: "Events",
        description: "Upcoming events at the hotel",
        href: "/events",
    },
];