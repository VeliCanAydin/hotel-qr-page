"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { parseISO } from "date-fns"
import { formatMonthDay, formatWeekdayShort } from "@/lib/dates"
import { CheckCircle2 } from "lucide-react"
import { EventDetailsDrawer, Timeline } from "@/components/events"
import type { HotelEvent } from "@/lib/types/events"

type PlanState = Record<string, string[]>

function formatDayLabel(dateString: string, locale: string) {
  return formatWeekdayShort(parseISO(dateString), locale)
}

function formatDateLabel(dateString: string, locale: string) {
  return formatMonthDay(parseISO(dateString), locale)
}

function sortDates(dates: string[]) {
  return [...new Set(dates)].sort((left, right) => left.localeCompare(right))
}

function toDateObject(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)
}

export default function MyPlanView({ events, storageKey }: { events: HotelEvent[]; storageKey: string }) {
  const t = useTranslations("plan")
  const locale = useLocale()
  const [plan, setPlan] = useState<PlanState>({})
  const [hydrated, setHydrated] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      const storedPlan = window.localStorage.getItem(storageKey)
      if (storedPlan) {
        setPlan(JSON.parse(storedPlan) as PlanState)
      }
    } catch {
      setPlan({})
    } finally {
      setHydrated(true)
    }
  }, [storageKey])

  const eventById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events])

  const assignedDays = useMemo(
    () => sortDates(Object.keys(plan).filter((date) => (plan[date] ?? []).length > 0)),
    [plan]
  )

  // Auto-select the first assigned day
  useEffect(() => {
    if (hydrated && assignedDays.length > 0 && !selectedDate) {
      setSelectedDate(assignedDays[0])
    }
  }, [hydrated, assignedDays, selectedDate])

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    const assignedIds = plan[selectedDate] ?? []
    return assignedIds.map((id) => eventById.get(id)).filter((e): e is HotelEvent => !!e)
  }, [selectedDate, plan, eventById])

  const selectedEvent = useMemo(
    () => (selectedEventId ? (eventById.get(selectedEventId) ?? null) : null),
    [eventById, selectedEventId]
  )

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

  if (!hydrated) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 p-3 sm:p-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-28 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-lg border bg-muted" />
      </div>
    )
  }

  if (assignedDays.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 p-3 sm:p-4">
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 size-7 text-muted-foreground" />
          <p className="text-base font-medium">{t("noActivities")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("noActivitiesDesc")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-3 sm:p-4">
      {/* Date tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {assignedDays.map((date) => {
          const isActive = selectedDate === date
          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-4 py-2.5 text-left transition-all ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-background hover:border-foreground/20 hover:bg-muted/40"
              }`}
            >
              <span className="text-xs font-medium leading-none">
                {formatDayLabel(date, locale)}
              </span>
              <span className="text-sm font-semibold leading-snug">
                {formatDateLabel(date, locale)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Events list for selected date */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{t("assignedDays")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("itemsCount", { count: eventsForSelectedDate.length })}
          </p>
        </div>

        {eventsForSelectedDate.length > 0 ? (
          <Timeline
            events={eventsForSelectedDate}
            selectedDate={selectedDate ? toDateObject(selectedDate) : undefined}
            onEventClick={openEventDrawer}
          />
        ) : (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            <p>{t("noActivities")}</p>
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