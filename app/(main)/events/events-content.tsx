"use client"

import { useMemo, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { EventDetailsDrawer, Timeline } from "@/components/events"
import type { HotelEvent } from "@/lib/types/events"

function formatDateLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function EventsContent({ allEvents }: { allEvents: HotelEvent[] }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = formatDateLocal(selectedDate)
    return allEvents.filter((e) => e.date === dateStr)
  }, [selectedDate, allEvents])

  const selectedEvent = useMemo(
    () => allEvents.find((event) => event.id === selectedEventId) ?? null,
    [allEvents, selectedEventId]
  )

  const datesWithEvents = useMemo(() => {
    const unique = [...new Set(allEvents.map((e) => e.date))]
    return unique.map((dateStr) => {
      const [y, m, d] = dateStr.split("-").map(Number)
      return new Date(y, m - 1, d, 12, 0, 0)
    })
  }, [allEvents])

  function openEventDrawer(event: HotelEvent) {
    setSelectedEventId(event.id)
    setDrawerOpen(true)
  }

  function handleDrawerOpenChange(nextOpen: boolean) {
    setDrawerOpen(nextOpen)

    if (!nextOpen) {
      setSelectedEventId(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-3 sm:p-4">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
          buttonVariant="ghost"
          ISOWeek
          modifiers={{ hasEvents: datesWithEvents }}
          modifiersClassNames={{ hasEvents: "font-bold underline" }}
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
          <Timeline events={eventsForSelectedDate} selectedDate={selectedDate} onEventClick={openEventDrawer} />
        ) : (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            <p>No events scheduled for this day.</p>
            <p className="text-sm mt-2">Select a different date to view events.</p>
          </div>
        )}
      </div>

      <EventDetailsDrawer
        event={selectedEvent}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        showPrimaryAction={false}
      />
    </div>
  )
}
