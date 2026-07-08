"use client"

import { Link } from "@/i18n/navigation"
import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { format, parseISO } from "date-fns"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { HotelEvent } from "@/lib/types/events"

type PlanState = Record<string, string[]>

function formatDayLabel(dateString: string) {
  return format(parseISO(dateString), "EEE")
}

function formatDateLabel(dateString: string) {
  return format(parseISO(dateString), "MMM d")
}

function sortDates(dates: string[]) {
  return [...new Set(dates)].sort((left, right) => left.localeCompare(right))
}

export default function MyPlanView({ events, storageKey }: { events: HotelEvent[]; storageKey: string }) {
  const t = useTranslations("plan")
  const [plan, setPlan] = useState<PlanState>({})
  const [hydrated, setHydrated] = useState(false)

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
  const assignedDays = useMemo(() => sortDates(Object.keys(plan).filter((date) => (plan[date] ?? []).length > 0)), [plan])

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{t("personalizedStay")}</p>
          <h1 className="text-3xl font-bold tracking-tight">{t("myPlan")}</h1>
        </div>

        <Button asChild variant="outline" className="rounded-full">
          <Link href="/personalized-stay">
            <ArrowLeft className="mr-2 size-4" />
            {t("back")}
          </Link>
        </Button>
      </div>

      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{t("assignedDays")}</CardTitle>
          <CardDescription>{t("assignedDaysDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!hydrated ? (
            <div className="py-10 text-center text-sm text-muted-foreground">{t("loadingPlan")}</div>
          ) : assignedDays.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {assignedDays.map((date) => {
                const assignedIds = plan[date] ?? []

                return (
                  <AccordionItem key={date} value={date} className="overflow-hidden rounded-2xl border border-border/60">
                    <AccordionTrigger className="px-4 py-4 hover:no-underline">
                      <div className="flex w-full items-center justify-between gap-3 pr-2">
                        <p className="text-sm font-medium">
                          {formatDayLabel(date)} · {formatDateLabel(date)}
                        </p>
                        <Badge variant="secondary" className="rounded-full">
                          {assignedIds.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {assignedIds.map((id) => {
                          const event = eventById.get(id)
                          if (!event) return null

                          return (
                            <li key={id} className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                <div>
                                  <p className="font-medium text-foreground">{event.title}</p>
                                  <p>
                                    {event.startTime} - {event.endTime} · {event.location}
                                  </p>
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 size-6 text-muted-foreground" />
              <p className="text-base font-medium">{t("noActivities")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("noActivitiesDesc")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}