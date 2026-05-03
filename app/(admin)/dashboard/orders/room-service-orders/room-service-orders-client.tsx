"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import type { RoomServiceOrder, OrderItem } from "@/lib/actions/room-service-orders"

type StatusFilter = "all" | "pending" | "confirmed" | "delivered" | "cancelled"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}

function parseItems(raw: string): OrderItem[] {
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function formatItems(raw: string): string {
  const items = parseItems(raw)
  if (items.length === 0) return "—"
  const summary = items.map((i) => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(", ")
  return summary.length > 60 ? summary.slice(0, 57) + "…" : summary
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

  const uniqueRooms = useMemo(() => {
    const rooms = [...new Set(initialOrders.map((o) => o.roomNumber))].sort()
    return rooms
  }, [initialOrders])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return initialOrders.filter((order) => {
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
  }, [initialOrders, search, statusFilter, roomFilter])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: initialOrders.length }
    initialOrders.forEach((o) => {
      c[o.status] = (c[o.status] || 0) + 1
    })
    return c
  }, [initialOrders])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Room Service Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all guest room service orders
        </p>
      </div>

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
                <SelectItem key={room} value={room}>
                  Room {room}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead className="hidden lg:table-cell">Reservation</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="hidden md:table-cell">Note</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="tabular-nums text-muted-foreground text-sm">
                  #{order.id}
                </TableCell>
                <TableCell className="font-medium">{order.roomNumber}</TableCell>
                <TableCell className="capitalize">{order.guestSurname}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground font-mono">
                  {order.reservationCode}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                  {formatItems(order.items)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  ${order.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[150px] truncate">
                  {order.note || "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs font-medium border-0 capitalize ${STATUS_STYLE[order.status] ?? ""}`}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-12"
                >
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
