export interface HotelEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // 24h format (HH:mm)
  endTime: string; // 24h format (HH:mm)
  category: "entertainment" | "dining" | "wellness" | "kids" | "sports" | "music";
  color?: string; // Optional custom color for the event card
}

// Helper function to format date to YYYY-MM-DD in local timezone
function formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper function to get events for a specific date
export function getEventsForDate(date: Date): HotelEvent[] {
  const dateString = formatDateToLocal(date);
  return hotelEvents.filter((event) => event.date === dateString);
}

// Helper function to check if a date has events
export function hasEventsOnDate(date: Date): boolean {
  const dateString = formatDateToLocal(date);
  return hotelEvents.some((event) => event.date === dateString);
}

// Get all dates that have events (useful for calendar highlighting)
export function getDatesWithEvents(): Date[] {
  const uniqueDates = [...new Set(hotelEvents.map((event) => event.date))];
  // Parse dates at noon to avoid timezone issues
  return uniqueDates.map((dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  });
}

// Category colors
export const categoryColors: Record<HotelEvent["category"], string> = {
  entertainment: "bg-purple-500",
  dining: "bg-orange-500",
  wellness: "bg-green-500",
  kids: "bg-pink-500",
  sports: "bg-blue-500",
  music: "bg-red-500",
};

// Sample hotel events data
export const hotelEvents: HotelEvent[] = [
  // Events for November 29, 2025 (today based on current date)
  {
    id: "1",
    title: "Morning Yoga Session",
    description:
      "Start your day with a relaxing yoga session by the pool. All levels welcome. Mats and towels provided.",
    location: "Pool Deck",
    date: "2025-11-29",
    startTime: "07:00",
    endTime: "08:00",
    category: "wellness",
  },
  {
    id: "2",
    title: "Breakfast Buffet",
    description:
      "Enjoy our extensive breakfast buffet featuring international cuisine, fresh fruits, and local specialties.",
    location: "Main Restaurant",
    date: "2025-11-29",
    startTime: "07:00",
    endTime: "10:30",
    category: "dining",
  },
  {
    id: "3",
    title: "Kids Art Workshop",
    description:
      "Creative art workshop for children ages 4-12. Painting, drawing, and crafts included.",
    location: "Kids Club",
    date: "2025-11-29",
    startTime: "10:00",
    endTime: "12:00",
    category: "kids",
  },
  {
    id: "4",
    title: "Aqua Aerobics",
    description:
      "Fun and energetic water aerobics class in the main pool. Great for all fitness levels.",
    location: "Main Pool",
    date: "2025-11-29",
    startTime: "11:00",
    endTime: "12:00",
    category: "sports",
  },
  {
    id: "5",
    title: "Live Acoustic Music",
    description:
      "Enjoy live acoustic performances while you relax by the pool. Featuring local artists.",
    location: "Pool Bar",
    date: "2025-11-29",
    startTime: "14:00",
    endTime: "16:00",
    category: "music",
  },
  {
    id: "6",
    title: "Wine Tasting Experience",
    description:
      "Discover premium local wines with our sommelier. Includes cheese and appetizer pairing.",
    location: "Wine Cellar",
    date: "2025-11-29",
    startTime: "17:00",
    endTime: "18:30",
    category: "dining",
  },
  {
    id: "7",
    title: "Kids Movie Night",
    description:
      "Family-friendly movie screening with popcorn and soft drinks. Tonight: Animation Special!",
    location: "Kids Club Cinema",
    date: "2025-11-29",
    startTime: "19:00",
    endTime: "21:00",
    category: "kids",
  },
  {
    id: "8",
    title: "DJ Night Party",
    description:
      "Dance the night away with our resident DJ. Drink specials available all night.",
    location: "Beach Club",
    date: "2025-11-29",
    startTime: "21:00",
    endTime: "23:59",
    category: "entertainment",
  },

  // Events for November 30, 2025
  {
    id: "9",
    title: "Sunrise Beach Walk",
    description:
      "Guided beach walk to watch the sunrise. Meet at the lobby for a refreshing start to your day.",
    location: "Beach",
    date: "2025-11-30",
    startTime: "06:30",
    endTime: "07:30",
    category: "wellness",
  },
  {
    id: "10",
    title: "Sunday Brunch",
    description:
      "Lavish Sunday brunch with live cooking stations, seafood bar, and unlimited sparkling wine.",
    location: "Main Restaurant",
    date: "2025-11-30",
    startTime: "11:00",
    endTime: "15:00",
    category: "dining",
  },
  {
    id: "11",
    title: "Beach Volleyball Tournament",
    description:
      "Join our fun beach volleyball tournament. Teams of 4, prizes for winners!",
    location: "Beach Sports Area",
    date: "2025-11-30",
    startTime: "15:00",
    endTime: "17:00",
    category: "sports",
  },
  {
    id: "12",
    title: "Sunset Cocktail Hour",
    description:
      "Complimentary cocktails while watching the sunset. Live saxophone performance.",
    location: "Rooftop Bar",
    date: "2025-11-30",
    startTime: "18:00",
    endTime: "19:30",
    category: "entertainment",
  },

  // Events for December 1, 2025
  {
    id: "13",
    title: "Pilates Class",
    description:
      "Core-strengthening Pilates class suitable for beginners and intermediate levels.",
    location: "Fitness Center",
    date: "2025-12-01",
    startTime: "08:00",
    endTime: "09:00",
    category: "wellness",
  },
  {
    id: "14",
    title: "Cooking Class: Local Cuisine",
    description:
      "Learn to prepare traditional local dishes with our executive chef. Includes lunch.",
    location: "Culinary Studio",
    date: "2025-12-01",
    startTime: "10:30",
    endTime: "13:00",
    category: "dining",
  },
  {
    id: "15",
    title: "Kids Treasure Hunt",
    description:
      "Exciting treasure hunt adventure around the hotel. Prizes for all participants!",
    location: "Hotel Grounds",
    date: "2025-12-01",
    startTime: "15:00",
    endTime: "16:30",
    category: "kids",
  },
  {
    id: "16",
    title: "Live Band: Jazz Night",
    description:
      "Enjoy smooth jazz from our talented house band. Dinner reservations recommended.",
    location: "Lobby Lounge",
    date: "2025-12-01",
    startTime: "20:00",
    endTime: "23:00",
    category: "music",
  },
];
