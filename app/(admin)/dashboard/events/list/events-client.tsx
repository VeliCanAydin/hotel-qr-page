"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { HotelEvent } from "@/lib/data/events"
import { createEvent, updateEvent, deleteEvent } from "@/lib/actions/events"

type EventCategory = HotelEvent["category"]

const CATEGORIES: { value: EventCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "entertainment", label: "Entertainment" },
  { value: "dining", label: "Dining" },
  { value: "wellness", label: "Wellness" },
  { value: "kids", label: "Kids" },
  { value: "sports", label: "Sports" },
  { value: "music", label: "Music" },
]

const CATEGORY_BG: Record<EventCategory, string> = {
  entertainment: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  dining: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  wellness: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  kids: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  sports: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  music: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}

const EMPTY_FORM: Omit<HotelEvent, "id"> = {
  title: "",
  description: "",
  location: "",
  date: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  endTime: "10:00",
  category: "entertainment",
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y}`
}

export default function EventsClient({ initialEvents }: { initialEvents: HotelEvent[] }) {
  const [events, setEvents] = useState<HotelEvent[]>(initialEvents)
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | "all">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<HotelEvent | null>(null)
  const [form, setForm] = useState<Omit<HotelEvent, "id">>(EMPTY_FORM)

  const filtered = useMemo(
    () => (categoryFilter === "all" ? events : events.filter((e) => e.category === categoryFilter)),
    [events, categoryFilter]
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: events.length }
    events.forEach((e) => { c[e.category] = (c[e.category] || 0) + 1 })
    return c
  }, [events])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
    [filtered]
  )

  function openAdd() {
    setEditingEvent(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(event: HotelEvent) {
    setEditingEvent(event)
    setForm({
      title: event.title, description: event.description, location: event.location,
      date: event.date, startTime: event.startTime, endTime: event.endTime, category: event.category,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.title.trim() || !form.date) return
    if (editingEvent) {
      const updated = { ...editingEvent, ...form }
      setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? updated : e)))
      setDialogOpen(false)
      toast.promise(updateEvent(editingEvent.id, form), {
        loading: "Saving...", success: "Event updated", error: "Failed to update",
      })
    } else {
      const newEvent: HotelEvent = { id: crypto.randomUUID(), ...form }
      setEvents((prev) => [...prev, newEvent])
      setDialogOpen(false)
      toast.promise(createEvent(newEvent), {
        loading: "Saving...", success: "Event added", error: "Failed to add",
      })
    }
  }

  function handleDelete() {
    if (!deleteId) return
    const id = deleteId
    const event = events.find((e) => e.id === id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setDeleteId(null)
    toast.promise(deleteEvent(id), {
      loading: "Deleting...", success: `"${event?.title}" deleted`, error: "Failed to delete",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Events Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage hotel events and activities schedule</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />Add Event
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button key={cat.value} variant={categoryFilter === cat.value ? "default" : "outline"} size="sm"
            onClick={() => setCategoryFilter(cat.value)}
          >
            {cat.label}
            <Badge variant="secondary" className="ml-2 text-xs h-4 px-1">{counts[cat.value] ?? 0}</Badge>
          </Button>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[90px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-muted-foreground hidden sm:block truncate max-w-xs">
                    {event.description}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums text-sm">{formatDate(event.date)}</TableCell>
                <TableCell className="tabular-nums text-sm whitespace-nowrap">
                  {event.startTime} – {event.endTime}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {event.location}
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs font-medium border-0 ${CATEGORY_BG[event.category]}`}>
                    {event.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(event)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(event.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No events found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Event title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="e.g. Pool Deck" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v as EventCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="dining">Dining</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title.trim() || !form.date}>
              {editingEvent ? "Save Changes" : "Add Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the event from the calendar.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
