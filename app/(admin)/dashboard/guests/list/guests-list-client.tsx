"use client"

import { useState, useMemo } from "react"
import { FileText, Search } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Reservation } from "@/lib/actions/reservations"

type StatusFilter = "all" | "confirmed" | "checked-in" | "checked-out"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all",         label: "All"         },
  { value: "confirmed",   label: "Confirmed"   },
  { value: "checked-in",  label: "Checked In"  },
  { value: "checked-out", label: "Checked Out" },
]

const STATUS_LABEL: Record<string, string> = {
  confirmed:    "Confirmed",
  "checked-in": "Checked In",
  "checked-out":"Checked Out",
}

const STATUS_STYLE: Record<string, string> = {
  confirmed:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "checked-in": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
  "checked-out":"bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y}`
}

export default function GuestsListClient({
  initialReservations,
}: {
  initialReservations: Reservation[]
}) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [detailGuest, setDetailGuest] = useState<Reservation | null>(null)

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: initialReservations.length }
    initialReservations.forEach((r) => {
      c[r.status] = (c[r.status] || 0) + 1
    })
    return c
  }, [initialReservations])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return initialReservations.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false
      if (!q) return true
      return (
        r.guestName.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.reservationCode.toLowerCase().includes(q)
      )
    })
  }, [initialReservations, search, statusFilter])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Guest List</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All reservations — current and upcoming stays
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">{counts[f.value] ?? 0}</span>
            </Button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Guest, room number, reservation code…"
            className="pl-8 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Room</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead className="hidden md:table-cell">Code</TableHead>
              <TableHead className="hidden md:table-cell">Room / Board</TableHead>
              <TableHead className="hidden md:table-cell">Guests</TableHead>
              <TableHead className="w-16 text-center">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No guests found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.roomNumber}</TableCell>
                  <TableCell>{r.guestName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(STATUS_STYLE[r.status] ?? "bg-muted text-muted-foreground")}
                    >
                      {STATUS_LABEL[r.status] ?? r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">{formatDate(r.checkIn)}</TableCell>
                  <TableCell className="text-sm tabular-nums">{formatDate(r.checkOut)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">
                      {r.reservationCode}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm capitalize">{r.roomType}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {r.boardType.replace(/-/g, " ")}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm tabular-nums">
                    {r.adults}A{r.children > 0 ? ` · ${r.children}C` : ""}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setDetailGuest(r)}
                      aria-label="View details"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!detailGuest} onOpenChange={(open) => !open && setDetailGuest(null)}>
        {detailGuest && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Room {detailGuest.roomNumber} — {detailGuest.guestName}
              </DialogTitle>
              <DialogDescription>
                {detailGuest.reservationCode} &middot;{" "}
                {formatDate(detailGuest.checkIn)} → {formatDate(detailGuest.checkOut)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={cn(STATUS_STYLE[detailGuest.status] ?? "")}
                >
                  {STATUS_LABEL[detailGuest.status] ?? detailGuest.status}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Room Details
                </p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="capitalize">{detailGuest.roomType}</dd>
                  <dt className="text-muted-foreground">Floor</dt>
                  <dd>Floor {detailGuest.floor}</dd>
                  <dt className="text-muted-foreground">View</dt>
                  <dd>{detailGuest.view}</dd>
                  <dt className="text-muted-foreground">Bed</dt>
                  <dd>{detailGuest.bedType}</dd>
                </dl>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Stay
                </p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <dt className="text-muted-foreground">Board</dt>
                  <dd className="capitalize">{detailGuest.boardType.replace(/-/g, " ")}</dd>
                  <dt className="text-muted-foreground">Adults</dt>
                  <dd>{detailGuest.adults}</dd>
                  <dt className="text-muted-foreground">Children</dt>
                  <dd>{detailGuest.children}</dd>
                </dl>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Contact
                </p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${detailGuest.email}`}
                      className="underline underline-offset-2 break-all"
                    >
                      {detailGuest.email}
                    </a>
                  </dd>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{detailGuest.phone}</dd>
                </dl>
              </div>

              {detailGuest.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                      Notes
                    </p>
                    <p className="text-sm italic text-muted-foreground">
                      &ldquo;{detailGuest.notes}&rdquo;
                    </p>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailGuest(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
