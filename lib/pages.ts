import { CircleAlert, Utensils, Martini, Baby, TreePalm, Flower, Dumbbell, HandPlatter, Bot, CalendarDays, MessageCircleQuestionMark, MapPinned, NotebookPen, Flame } from "lucide-react";

// Home-page cards. `key` maps to the `home` messages namespace
// (home.<key>.title / home.<key>.description); icon + href stay here.
export const pages = [
    { icon: CircleAlert, key: "hotelInfo", href: "/hotel-info" },
    { icon: Utensils, key: "restaurants", href: "/restaurants" },
    { icon: Martini, key: "bars", href: "/bars" },
    { icon: Baby, key: "kidsCare", href: "/kids-care" },
    { icon: TreePalm, key: "beach", href: "/beach-pools" },
    { icon: Flower, key: "spa", href: "/spa" },
    { icon: Dumbbell, key: "wellness", href: "/wellness" },
    { icon: HandPlatter, key: "roomService", href: "/room-service" },
    { icon: Flame, key: "calorieTracker", href: "/calorie-tracker" },
    { icon: Bot, key: "aiAssistant", href: "/ai-assistant" },
    { icon: CalendarDays, key: "events", href: "/events" },
    // { icon: NotebookPen, key: "personalizedStay", href: "/personalized-stay" },
    { icon: MessageCircleQuestionMark, key: "feedback", href: "/feedback" },
    { icon: MapPinned, key: "nearbyGuide", href: "/nearby-guide" },
] as const;
