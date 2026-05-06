"use client"

import { Fragment, useState, useOptimistic, useTransition } from "react"
import { format } from "date-fns"
import { XCircle, Loader2, X } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { cancelGuestOrder, type OrderItem, type RoomServiceOrder } from "@/lib/actions/room-service-orders"

const STEPS = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "delivered", label: "Delivered" },
] as const

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  delivered: 2,
}

export default function GuestOrderCard({ order }: { order: RoomServiceOrder }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isPending, startTransition] = useTransition()

  const [optimisticOrder, applyOptimistic] = useOptimistic(
    order,
    (prev, update: Partial<RoomServiceOrder>) => ({ ...prev, ...update })
  )

  const items = JSON.parse(optimisticOrder.items) as OrderItem[]
  const isCancelled = optimisticOrder.status === "cancelled"
  const activeStep = STATUS_INDEX[optimisticOrder.status] ?? 0

  function openDialog() {
    setReason("")
    setDialogOpen(true)
  }

  function closeDialog() {
    if (isPending) return
    setDialogOpen(false)
    setReason("")
  }

  function handleCancel() {
    const trimmedReason = reason.trim()
    setDialogOpen(false)
    startTransition(async () => {
      applyOptimistic({ status: "cancelled", cancellationReason: trimmedReason, cancelledBy: "guest" })
      await cancelGuestOrder(order.id, trimmedReason || undefined)
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="px-4 pt-4 pb-3 gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Order #{optimisticOrder.id}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(optimisticOrder.createdAt), "MMM d, yyyy · HH:mm")}
              </p>
            </div>
            {optimisticOrder.status === "pending" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 -mt-1 -mr-1 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={openDialog}
                disabled={isPending}
                aria-label="Cancel order"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {isCancelled ? (
            <CancelledBanner
              reason={optimisticOrder.cancellationReason}
              cancelledBy={optimisticOrder.cancelledBy}
            />
          ) : (
            <Timeline activeStep={activeStep} />
          )}
        </CardHeader>

        <CardContent className="px-4 pb-4 space-y-3">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.name}
                  <span className="ml-1 font-medium text-foreground">× {item.quantity}</span>
                </span>
                <span className="font-medium tabular-nums">
                  €{(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          {optimisticOrder.note && (
            <p className="text-xs text-muted-foreground border-t pt-2 italic">
              &ldquo;{optimisticOrder.note}&rdquo;
            </p>
          )}

          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-semibold">
              Total: €{optimisticOrder.totalAmount.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Order #{order.id}</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`reason-${order.id}`}>
              Reason{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id={`reason-${order.id}`}
              placeholder="e.g. Changed my mind, ordered by mistake…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isPending}>
              No, go back
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Timeline({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex items-start px-1">
      {STEPS.map((step, i) => {
        const isCompleted = i < activeStep
        const isActive = i === activeStep
        return (
          <Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  "h-3 w-3 rounded-full border-2 transition-colors",
                  isCompleted && "bg-primary border-primary",
                  isActive && "bg-primary border-primary ring-2 ring-primary/20",
                  !isCompleted && !isActive && "bg-muted border-border"
                )}
              />
              <span
                className={cn(
                  "text-[10px] leading-none whitespace-nowrap",
                  isCompleted || isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mt-[5px] mx-1 rounded-full transition-colors",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

function CancelledBanner({
  reason,
  cancelledBy,
}: {
  reason: string | null
  cancelledBy: string | null
}) {
  const byLabel =
    cancelledBy === "guest"
      ? "you"
      : cancelledBy === "staff"
      ? "the hotel"
      : cancelledBy

  return (
    <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-2.5 py-1.5">
      <X
        className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5"
        strokeWidth={2.5}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-destructive">
          Cancelled{byLabel ? ` by ${byLabel}` : ""}
        </p>
        {reason && (
          <p className="text-xs text-muted-foreground italic mt-0.5 break-words">
            &ldquo;{reason}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}
