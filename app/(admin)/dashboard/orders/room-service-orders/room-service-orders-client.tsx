"use client"

import { useEffect, useRef, useState, useMemo, useOptimistic, useTransition } from "react"
import { toast } from "sonner"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Search, CheckCircle2, PackageCheck, XCircle, Loader2,
  User, ShieldCheck, FileText,
} from "lucide-react"
import type { RoomServiceOrder, OrderItem } from "@/lib/actions/room-service-orders"
import { updateOrderStatus } from "@/lib/actions/room-service-orders"

type StatusFilter = "all" | "pending" | "confirmed" | "delivered" | "cancelled"
type OrderStatus = "confirmed" | "delivered" | "cancelled"

type PendingAction = {
  orderId: number
  action: OrderStatus
  roomNumber: string
} | null

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}

const DIALOG_COPY: Record<OrderStatus, { title: string; description: (room: string) => string; confirm: string }> = {
  confirmed: {
    title: "Confirm Order",
    description: (room) => `Confirm the order for Room ${room}? The guest will be notified that their order is being prepared.`,
    confirm: "Yes, confirm",
  },
  delivered: {
    title: "Mark as Delivered",
    description: (room) => `Mark the order for Room ${room} as delivered?`,
    confirm: "Yes, delivered",
  },
  cancelled: {
    title: "Cancel Order",
    description: (room) => `Cancel the order for Room ${room}? This action cannot be undone.`,
    confirm: "Yes, cancel",
  },
}

function parseItems(raw: string): OrderItem[] {
  try { return JSON.parse(raw) } catch { return [] }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function RoomServiceOrdersClient({
  initialOrders,
}: {
  initialOrders: RoomServiceOrder[]
}) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [roomFilter, setRoomFilter] = useState<string>("all")
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [detailOrder, setDetailOrder] = useState<RoomServiceOrder | null>(null)
  const [isPending, startTransition] = useTransition()

  // Poll for new orders and announce ones we haven't seen in this session.
  useAutoRefresh(30_000)
  const knownOrderIds = useRef<Set<number> | null>(null)
  useEffect(() => {
    const previous = knownOrderIds.current
    knownOrderIds.current = new Set(initialOrders.map((o) => o.id))
    if (!previous) return

    const fresh = initialOrders.filter((o) => !previous.has(o.id))
    if (fresh.length === 1) {
      toast.info(`New order — Room ${fresh[0].roomNumber}`, {
        description: `${fresh[0].guestSurname} · $${fresh[0].totalAmount.toFixed(2)}`,
      })
    } else if (fresh.length > 1) {
      toast.info(`${fresh.length} new orders received`)
    }
  }, [initialOrders])

  const [optimisticOrders, applyOptimistic] = useOptimistic(
    initialOrders,
    (prev, update: { orderId: number; status: string; cancellationReason?: string; cancelledBy?: string }) =>
      prev.map((o) =>
        o.id === update.orderId
          ? {
              ...o,
              status: update.status,
              ...(update.cancellationReason !== undefined ? { cancellationReason: update.cancellationReason } : {}),
              ...(update.cancelledBy !== undefined ? { cancelledBy: update.cancelledBy } : {}),
            }
          : o
      )
  )

  const uniqueRooms = useMemo(
    () => [...new Set(initialOrders.map((o) => o.roomNumber))].sort(),
    [initialOrders]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return optimisticOrders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false
      if (roomFilter !== "all" && order.roomNumber !== roomFilter) return false
      if (q) {
        return (
          order.roomNumber.toLowerCase().includes(q) ||
          order.guestSurname.toLowerCase().includes(q) ||
          order.reservationCode.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [optimisticOrders, search, statusFilter, roomFilter])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: optimisticOrders.length }
    optimisticOrders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1 })
    return c
  }, [optimisticOrders])

  function openActionDialog(orderId: number, action: OrderStatus, roomNumber: string) {
    setPendingAction({ orderId, action, roomNumber })
    setCancelReason("")
  }

  function closeActionDialog() {
    if (isPending) return
    setPendingAction(null)
    setCancelReason("")
  }

  function handleConfirm() {
    if (!pendingAction) return
    const { orderId, action } = pendingAction
    const reason = action === "cancelled" ? cancelReason : undefined
    startTransition(async () => {
      applyOptimistic({ orderId, status: action, cancellationReason: reason, cancelledBy: action === "cancelled" ? "staff" : undefined })
      await updateOrderStatus(orderId, action, reason)
    })
    setPendingAction(null)
    setCancelReason("")
  }

  // When detail dialog is open on an optimistic order, keep it in sync
  const liveDetailOrder = detailOrder
    ? (optimisticOrders.find((o) => o.id === detailOrder.id) ?? detailOrder)
    : null

  const copy = pendingAction ? DIALOG_COPY[pendingAction.action] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Room Service Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage guest room service orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s.value}
              variant={statusFilter === s.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label}
              <Badge variant="secondary" className="ml-2 text-xs h-4 px-1">
                {counts[s.value] ?? 0}
              </Badge>
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search room, guest, reservation…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Select value={roomFilter} onValueChange={setRoomFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Rooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {uniqueRooms.map((room) => (
                <SelectItem key={room} value={room}>Room {room}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">#</TableHead>
              <TableHead className="hidden md:table-cell">Reservation</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="w-16 text-center">Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="tabular-nums text-muted-foreground text-sm">
                  #{order.id}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono">
                  {order.reservationCode}
                </TableCell>
                <TableCell className="font-medium">{order.roomNumber}</TableCell>
                <TableCell className="capitalize">{order.guestSurname}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  ${order.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setDetailOrder(order)}
                    title="View details"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs font-medium border-0 capitalize ${STATUS_STYLE[order.status] ?? ""}`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-0.5">
                    {order.status === "pending" && (
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={() => openActionDialog(order.id, "confirmed", order.roomNumber)}
                        disabled={isPending}
                        title="Confirm order"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    {order.status === "confirmed" && (
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={() => openActionDialog(order.id, "delivered", order.roomNumber)}
                        disabled={isPending}
                        title="Mark as delivered"
                      >
                        <PackageCheck className="h-4 w-4" />
                      </Button>
                    )}
                    {(order.status === "pending" || order.status === "confirmed") && (
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => openActionDialog(order.id, "cancelled", order.roomNumber)}
                        disabled={isPending}
                        title="Cancel order"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={liveDetailOrder !== null} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          {liveDetailOrder && (() => {
            const items = parseItems(liveDetailOrder.items)
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Order #{liveDetailOrder.id} — Room {liveDetailOrder.roomNumber}</DialogTitle>
                  <DialogDescription>
                    {liveDetailOrder.guestSurname} · {liveDetailOrder.reservationCode} · {formatDate(liveDetailOrder.createdAt)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Items</p>
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between text-sm">
                          <span>
                            {item.name}
                            <span className="ml-1.5 text-muted-foreground">× {item.quantity}</span>
                          </span>
                          <span className="tabular-nums font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between text-sm font-semibold border-t pt-2">
                      <span>Total</span>
                      <span className="tabular-nums">${liveDetailOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Note */}
                  {liveDetailOrder.note && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Note</p>
                        <p className="text-sm italic text-muted-foreground">&ldquo;{liveDetailOrder.note}&rdquo;</p>
                      </div>
                    </>
                  )}

                  {/* Cancellation info */}
                  {liveDetailOrder.status === "cancelled" && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cancellation</p>
                        <div className="flex items-center gap-1.5 text-sm">
                          {liveDetailOrder.cancelledBy === "guest" ? (
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-muted-foreground">
                            {liveDetailOrder.cancelledBy === "guest" ? "Cancelled by guest" : "Cancelled by staff"}
                          </span>
                        </div>
                        {liveDetailOrder.cancellationReason && (
                          <p className="text-sm italic text-muted-foreground">
                            &ldquo;{liveDetailOrder.cancellationReason}&rdquo;
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDetailOrder(null)}>Close</Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={pendingAction !== null} onOpenChange={(open) => !open && closeActionDialog()}>
        <DialogContent className="sm:max-w-md">
          {copy && pendingAction && (
            <>
              <DialogHeader>
                <DialogTitle>{copy.title}</DialogTitle>
                <DialogDescription>
                  {copy.description(pendingAction.roomNumber)}
                </DialogDescription>
              </DialogHeader>

              {pendingAction.action === "cancelled" && (
                <div className="space-y-2">
                  <Label htmlFor="cancel-reason">
                    Cancellation reason{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    id="cancel-reason"
                    placeholder="e.g. Guest requested cancellation, item unavailable…"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={closeActionDialog} disabled={isPending}>
                  No, go back
                </Button>
                <Button
                  variant={pendingAction.action === "cancelled" ? "destructive" : "default"}
                  onClick={handleConfirm}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.confirm}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
