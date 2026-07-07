"use client"

import { Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { categoryColors, type HotelEvent } from "@/lib/types/events"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: HotelEvent
  style?: React.CSSProperties
  onClick: (event: HotelEvent) => void
}

export function EventCard({ event, style, onClick }: EventCardProps) {
  const categoryColor = categoryColors[event.category]

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className={cn(
        "absolute left-16 right-2 cursor-pointer overflow-hidden rounded-md border-l-4 px-2 py-1 text-left text-white transition-opacity hover:opacity-90",
        categoryColor
      )}
      style={style}
    >
      <div className="truncate text-sm font-medium">{event.title}</div>
      <div className="flex items-center gap-1 truncate text-xs opacity-90">
        <Clock className="size-3.5 shrink-0" />
        <span>
          {event.startTime} - {event.endTime}
        </span>
      </div>
    </button>
  )
}
