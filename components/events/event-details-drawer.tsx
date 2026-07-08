"use client"

import { CalendarDays, Clock3, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { categoryColors, type HotelEvent } from "@/lib/types/events"

type EventDetailsDrawerProps = {
  event: HotelEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  primaryActionLabel?: string
  primaryAction?: () => void
  primaryActionDisabled?: boolean
  showDetails?: boolean
  showPrimaryAction?: boolean
  children?: React.ReactNode
}

export function EventDetailsDrawer({
  event,
  open,
  onOpenChange,
  primaryActionLabel,
  primaryAction,
  primaryActionDisabled = false,
  showDetails = true,
  showPrimaryAction = true,
  children,
}: EventDetailsDrawerProps) {
  const t = useTranslations("events")

  if (!event) {
    return null
  }

  const categoryColor = categoryColors[event.category]

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] overflow-hidden">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          {showDetails ? (
            <DrawerHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", categoryColor)} />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(`categories.${event.category}`)}</span>
              </div>
              <DrawerTitle className="text-xl sm:text-2xl">{event.title}</DrawerTitle>
              <DrawerDescription className="text-sm sm:text-base">{event.description}</DrawerDescription>
            </DrawerHeader>
          ) : null}

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {showDetails ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock3 className="h-5 w-5" />
                  <span>
                    {event.startTime} - {event.endTime}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </div>
            ) : null}

            {children ? <div className={showDetails ? "mt-4 space-y-3" : "space-y-3"}>{children}</div> : null}
          </div>

          <DrawerFooter className="border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button type="button" variant="outline" className="w-full rounded-full sm:w-auto">
                {t("close")}
              </Button>
            </DrawerClose>
            {showPrimaryAction ? (
              <Button
                type="button"
                className="w-full rounded-full sm:w-auto"
                disabled={primaryActionDisabled}
                onClick={() => primaryAction?.()}
              >
                <CalendarDays className="mr-2 size-4" />
                {primaryActionLabel ?? t("addToCalendar")}
              </Button>
            ) : null}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}