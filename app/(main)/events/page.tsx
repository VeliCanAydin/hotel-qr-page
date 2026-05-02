"use client"

import { useState, useMemo, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Timeline } from "@/components/events/Timeline"
import type { HotelEvent } from "@/lib/data/events"

function formatDateToLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function PageEvent() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<HotelEvent[]>([])

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then(setEvents)
      .catch(console.error)
  }, [])

  const eventsForSelectedDate = useMemo(() => {
    const dateStr = formatDateToLocal(selectedDate)
    return events.filter((e) => e.date === dateStr)
  }, [selectedDate, events])

  const datesWithEvents = useMemo(() => {
    const unique = [...new Set(events.map((e) => e.date))]
    return unique.map((d) => {
      const [y, m, day] = d.split("-").map(Number)
      return new Date(y, m - 1, day, 12, 0, 0)
    })
  }, [events])

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
          buttonVariant="ghost"
          ISOWeek
          modifiers={{ hasEvent: datesWithEvents }}
          modifiersClassNames={{ hasEvent: "font-bold underline" }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Events</h2>
          <p className="text-muted-foreground text-sm">
            {eventsForSelectedDate.length === 0
              ? "No events scheduled"
              : `${eventsForSelectedDate.length} event${eventsForSelectedDate.length > 1 ? "s" : ""} scheduled`}
          </p>
        </div>

        {eventsForSelectedDate.length > 0 ? (
          <Timeline events={eventsForSelectedDate} selectedDate={selectedDate} />
        ) : (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            <p>No events scheduled for this day.</p>
            <p className="text-sm mt-2">Select a different date to view events.</p>
          </div>
        )}
      </div>
    </div>
  )
}
