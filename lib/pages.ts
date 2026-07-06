import { CircleAlert, Utensils, Baby, TreePalm, Flower, Dumbbell, HandPlatter, Bot, CalendarDays, MessageCircleQuestionMark, MapPinned, NotebookPen, Flame } from "lucide-react";

export const pages = [
    {
        icon: CircleAlert,
        title: "Hotel Info",
        description: "About the hotel",
        href: "/hotel-info",
    },
    {
        icon: Utensils,
        title: "Restaurants",
        description: "Menus and dining options",
        href: "/restaurants",
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
        href: "/beach-pools",
    },
    {
        icon: Flower,
        title: "Spa",
        description: "Massages and treatments",
        href: "/spa",
    },
    {
        icon: Dumbbell,
        title: "Wellness",
        description: "Fitness, yoga and activities",
        href: "/wellness",
    },
    {
        icon: HandPlatter,
        title: "Room Service",
        description: "In-Room Dining",
        href: "/room-service",
    },
    {
        icon: Flame,
        title: "Calorie Tracker",
        description: "Track your meals and daily calorie intake",
        href: "/calorie-tracker",
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
    {
        icon: NotebookPen,
        title: "Personalize Your Stay",
        description: "Build a day-by-day event agenda",
        href: "/personalized-stay",
    },
    {
        icon: MessageCircleQuestionMark,
        title: "Feedback & Support",
        description: "Share feedback or report an issue",
        href: "/feedback",
    },
    {
        icon: MapPinned,
        title: "Nearby Guide",
        description: "Nearest pharmacy, market, and bus stop",
        href: "/nearby-guide",
    }
];