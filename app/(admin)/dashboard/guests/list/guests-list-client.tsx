"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { FileText, LogIn, LogOut, Pencil, Plus, Search, Trash2 } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  createReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
  type Reservation,
  type ReservationInput,
  type ReservationStatus,
} from "@/lib/actions/reservations"

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

const ROOM_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "deluxe",   label: "Deluxe"   },
  { value: "suite",    label: "Suite"    },
  { value: "villa",    label: "Villa"    },
]

const BOARD_TYPES = [
  { value: "room-only",     label: "Room Only"       },
  { value: "bed-breakfast", label: "Bed & Breakfast" },
  { value: "half-board",    label: "Half Board"      },
  { value: "full-board",    label: "Full Board"      },
  { value: "all-inclusive", label: "All Inclusive"   },
]

const EMPTY_FORM: ReservationInput = {
  roomNumber: "",
  surname: "",
  guestName: "",
  roomType: "standard",
  boardType: "all-inclusive",
  checkIn: "",
  checkOut: "",
  adults: 2,
  children: 0,
  floor: 1,
  view: "",
  bedType: "",
  email: "",
  phone: "",
  notes: "",
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
  const [reservationList, setReservationList] = useState(initialReservations)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [detailGuest, setDetailGuest] = useState<Reservation | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ReservationInput>(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: reservationList.length }
    reservationList.forEach((r) => {
      c[r.status] = (c[r.status] || 0) + 1
    })
    return c
  }, [reservationList])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return reservationList.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false
      if (!q) return true
      return (
        r.guestName.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.reservationCode.toLowerCase().includes(q)
      )
    })
  }, [reservationList, search, statusFilter])

  function setField<K extends keyof ReservationInput>(key: K, value: ReservationInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  function openEdit(reservation: Reservation) {
    setEditingId(reservation.id)
    setForm({
      roomNumber: reservation.roomNumber,
      surname: reservation.surname,
      guestName: reservation.guestName,
      roomType: reservation.roomType,
      boardType: reservation.boardType,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      adults: reservation.adults,
      children: reservation.children,
      floor: reservation.floor,
      view: reservation.view,
      bedType: reservation.bedType,
      email: reservation.email,
      phone: reservation.phone,
      notes: reservation.notes,
    })
    setDetailGuest(null)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!form.guestName.trim() || !form.surname.trim() || !form.roomNumber.trim()) {
      toast.error("Guest name, surname and room number are required")
      return
    }
    if (!form.checkIn || !form.checkOut) {
      toast.error("Check-in and check-out dates are required")
      return
    }
    if (form.checkOut <= form.checkIn) {
      toast.error("Check-out must be after check-in")
      return
    }

    setIsSaving(true)
    const promise = editingId
      ? updateReservation(editingId, form)
      : createReservation(form)

    toast.promise(promise, {
      loading: "Saving...",
      success: editingId ? "Reservation updated" : "Reservation created",
      error: (err) => (err instanceof Error ? err.message : "Failed to save"),
    })

    try {
      const saved = await promise
      setReservationList((prev) =>
        editingId
          ? prev.map((r) => (r.id === saved.id ? saved : r))
          : [saved, ...prev]
      )
      setFormOpen(false)
    } catch {
      // toast.promise already surfaced the error
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange(reservation: Reservation, status: ReservationStatus) {
    const promise = updateReservationStatus(reservation.id, status)
    toast.promise(promise, {
      loading: "Updating...",
      success: `Room ${reservation.roomNumber} — ${STATUS_LABEL[status]}`,
      error: "Failed to update status",
    })
    try {
      const updated = await promise
      setReservationList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      setDetailGuest((current) => (current?.id === updated.id ? updated : current))
    } catch {
      // toast.promise already surfaced the error
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)
    setDetailGuest(null)
    setReservationList((prev) => prev.filter((r) => r.id !== target.id))
    toast.promise(deleteReservation(target.id), {
      loading: "Deleting...",
      success: `Reservation ${target.reservationCode} deleted`,
      error: "Failed to delete",
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Guest List</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All reservations — current and upcoming stays
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Reservation
        </Button>
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
              <TableHead className="w-24 text-center">Actions</TableHead>
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
                    <div className="flex items-center justify-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setDetailGuest(r)}
                        aria-label="View details"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(r)}
                        aria-label="Edit reservation"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail dialog */}
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
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className={cn(STATUS_STYLE[detailGuest.status] ?? "")}
                  >
                    {STATUS_LABEL[detailGuest.status] ?? detailGuest.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {detailGuest.status === "confirmed" && (
                    <Button size="sm" onClick={() => handleStatusChange(detailGuest, "checked-in")}>
                      <LogIn className="h-4 w-4 mr-1" />
                      Check In
                    </Button>
                  )}
                  {detailGuest.status === "checked-in" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(detailGuest, "checked-out")}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Check Out
                    </Button>
                  )}
                </div>
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

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(detailGuest)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => openEdit(detailGuest)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setDetailGuest(null)}>
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Reservation" : "New Reservation"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the reservation details. The reservation code stays the same."
                : "The reservation code is generated automatically. Guests log in with room number + surname."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="guestName">Guest name</Label>
                <Input
                  id="guestName"
                  placeholder="Mr. & Mrs. Johnson"
                  value={form.guestName}
                  onChange={(e) => setField("guestName", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="surname">Surname (login)</Label>
                <Input
                  id="surname"
                  placeholder="johnson"
                  value={form.surname}
                  onChange={(e) => setField("surname", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="roomNumber">Room number</Label>
                <Input
                  id="roomNumber"
                  placeholder="204"
                  value={form.roomNumber}
                  onChange={(e) => setField("roomNumber", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Room type</Label>
                <Select value={form.roomType} onValueChange={(v) => setField("roomType", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Board</Label>
                <Select value={form.boardType} onValueChange={(v) => setField("boardType", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARD_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="checkIn">Check-in</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={form.checkIn}
                  onChange={(e) => setField("checkIn", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="checkOut">Check-out</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={form.checkOut}
                  onChange={(e) => setField("checkOut", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min={1}
                  max={12}
                  value={form.adults}
                  onChange={(e) => setField("adults", Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min={0}
                  max={12}
                  value={form.children}
                  onChange={(e) => setField("children", Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  min={0}
                  value={form.floor}
                  onChange={(e) => setField("floor", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="view">View</Label>
                <Input
                  id="view"
                  placeholder="Sea View"
                  value={form.view}
                  onChange={(e) => setField("view", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bedType">Bed</Label>
                <Input
                  id="bedType"
                  placeholder="King"
                  value={form.bedType}
                  onChange={(e) => setField("bedType", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="guest@example.com"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+90 555 000 00 00"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Special requests, allergies…"
                rows={2}
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : editingId ? "Save Changes" : "Create Reservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        {deleteTarget && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Reservation</DialogTitle>
              <DialogDescription>
                Delete reservation {deleteTarget.reservationCode} for Room{" "}
                {deleteTarget.roomNumber} ({deleteTarget.guestName})? The guest will no longer
                be able to log in to the portal. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
