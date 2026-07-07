"use client"

import { useEffect, useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { Clock3, Sparkles, Trash2 } from "lucide-react"
import Link from "next/link"

import { EventDetailsDrawer } from "@/components/events"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { HotelEvent } from "@/lib/types/events"

type PlanState = Record<string, string[]>

const categoryOrder: HotelEvent["category"][] = ["wellness", "sports", "entertainment", "dining", "kids", "music"]

const categoryLabels: Record<HotelEvent["category"], string> = {
  wellness: "Wellness Activities",
  sports: "Activities",
  entertainment: "Activities",
  dining: "Dining",
  kids: "Kids",
  music: "Music",
}

function formatDayLabel(dateString: string) {
  return format(parseISO(dateString), "EEE")
}

function formatDateLabel(dateString: string) {
  return format(parseISO(dateString), "MMM d")
}

function formatPlanItem(event: HotelEvent) {
  return `${event.title} · ${event.startTime}-${event.endTime}`
}

function groupEventsByCategory(events: HotelEvent[]) {
  return categoryOrder
    .map((category) => ({
      category,
      items: events
        .filter((event) => event.category === category)
        .sort((left, right) => {
          const dateOrder = left.date.localeCompare(right.date)
          if (dateOrder !== 0) return dateOrder

          const timeOrder = left.startTime.localeCompare(right.startTime)
          if (timeOrder !== 0) return timeOrder

          return left.title.localeCompare(right.title)
        }),
    }))
    .filter((group) => group.items.length > 0)
}

function sortUniqueDates(dates: string[]) {
  return [...new Set(dates)].sort((left, right) => left.localeCompare(right))
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export default function PersonalizedStayPlanner({
  events,
  stayDates,
  storageKey,
  guestName,
}: {
  events: HotelEvent[]
  stayDates: string[]
  storageKey: string
  guestName: string
}) {
  const days = useMemo(() => {
    const todayKey = getLocalDateKey(new Date())

    return sortUniqueDates(stayDates).filter((date) => date >= todayKey)
  }, [stayDates])
  const groupedEvents = useMemo(() => groupEventsByCategory(events), [events])
  const eventById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events])

  const [plan, setPlan] = useState<PlanState>({})
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPickingDay, setIsPickingDay] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as PlanState
        if (parsed && typeof parsed === "object") {
          setPlan(parsed)
        }
      }
    } catch {
      // Ignore malformed storage and continue with an empty plan.
    } finally {
      setHydrated(true)
    }
  }, [storageKey])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(storageKey, JSON.stringify(plan))
  }, [hydrated, plan, storageKey])

  const selectedEvent = selectedEventId ? eventById.get(selectedEventId) ?? null : null

  function toggleSelection(eventId: string) {
    setSelectedEventId((current) => (current === eventId ? null : eventId))
    setDrawerOpen(true)
    setIsPickingDay(false)
  }

  function handleDrawerOpenChange(nextOpen: boolean) {
    setDrawerOpen(nextOpen)

    if (!nextOpen) {
      setSelectedEventId(null)
      setIsPickingDay(false)
    }
  }

  function startCalendarSelection() {
    if (!selectedEventId) return
    setIsPickingDay(true)
  }

  function assignSelectedEventToDay(date: string) {
    if (!selectedEventId) return

    setPlan((current) => {
      const nextPlan: PlanState = {}

      for (const [day, ids] of Object.entries(current)) {
        nextPlan[day] = ids.filter((id) => id !== selectedEventId)
      }

      nextPlan[date] = [...(nextPlan[date] ?? []), selectedEventId]
      return nextPlan
    })

    setSelectedEventId(null)
    setIsPickingDay(false)
  }

  if (!days.length) {
    return (
      <section className="rounded-[2rem] border border-border/60 bg-gradient-to-br from-slate-50 via-background to-emerald-50/50 p-6 shadow-sm dark:from-slate-950 dark:via-background dark:to-emerald-950/20">
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
            <Sparkles className="mr-1 size-3" />
            Personalize Your Stay
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">Plan your stay</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Once hotel events are added, this section will turn into a simple activity picker.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[2rem] border border-border/60 bg-gradient-to-br from-slate-50 via-background to-emerald-50/50 p-4 shadow-sm dark:from-slate-950 dark:via-background dark:to-emerald-950/20 sm:p-6">
      <div className="sticky top-4 z-50 flex justify-end">
        <Button asChild type="button" className="rounded-full px-5 shadow-md">
          <Link href="/my-plan">My Plan</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Available activities</CardTitle>
            <CardDescription>Activities are grouped by type. Tap a title to reveal the details underneath.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {groupedEvents.map((group) => (
                <AccordionItem key={group.category} value={group.category} className="border-b-0">
                  <AccordionTrigger className="rounded-2xl border border-border/60 bg-background px-4 py-3 hover:no-underline data-[state=open]:rounded-b-none">
                    <div className="flex w-full items-center justify-between gap-3 pr-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                          {categoryLabels[group.category]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{group.items.length} items</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="rounded-b-2xl border border-t-0 border-border/60 bg-background px-4 pt-3 pb-4">
                    <ul className="space-y-2">
                      {group.items.map((event) => {
                        const isSelected = selectedEventId === event.id

                        return (
                          <li key={event.id}>
                            <button
                              type="button"
                              onClick={() => toggleSelection(event.id)}
                              className={cn(
                                "w-full rounded-2xl border px-4 py-4 text-left transition-all",
                                isSelected
                                  ? "border-foreground/15 bg-foreground/[0.03] shadow-sm"
                                  : "border-border/60 bg-muted/20 hover:border-foreground/15 hover:bg-muted/35"
                              )}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-medium">{event.title}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                                </div>
                                <Badge variant="secondary" className="rounded-full">
                                  {event.startTime}
                                </Badge>
                              </div>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <EventDetailsDrawer
        event={selectedEvent}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        primaryActionLabel={isPickingDay ? "Choose day" : "Takvime ekle"}
        primaryAction={startCalendarSelection}
        primaryActionDisabled={isPickingDay}
        showDetails={!isPickingDay}
        showPrimaryAction={!isPickingDay}
      >
        {selectedEvent && isPickingDay ? (
          <div className="grid gap-2">
              {days.map((date) => {
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => assignSelectedEventToDay(date)}
                    className="rounded-2xl border border-border/60 bg-background px-4 py-4 text-left transition-all hover:border-foreground/15 hover:bg-muted/40"
                  >
                    <p className="text-sm font-medium">
                      {formatDayLabel(date)} · {formatDateLabel(date)}
                    </p>
                  </button>
                )
              })}
          </div>
        ) : null}
      </EventDetailsDrawer>
    </section>
  )
}