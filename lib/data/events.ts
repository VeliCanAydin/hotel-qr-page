export interface HotelEvent {
  id: string
  title: string
  description: string
  location: string
  date: string
  startTime: string
  endTime: string
  category: 'entertainment' | 'dining' | 'wellness' | 'kids' | 'sports' | 'music'
  color?: string
}

export const categoryColors: Record<HotelEvent['category'], string> = {
  entertainment: 'bg-purple-500',
  dining: 'bg-orange-500',
  wellness: 'bg-green-500',
  kids: 'bg-pink-500',
  sports: 'bg-blue-500',
  music: 'bg-red-500',
}
