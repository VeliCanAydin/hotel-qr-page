"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react"

type EventCategory = "entertainment" | "dining" | "wellness" | "kids" | "sports" | "music"

type HotelEvent = {
  id: string
  title: string
  description: string
  location: string
  date: string
  startTime: string
  endTime: string
  category: EventCategory
  color?: string | null
}

const EMPTY_EVENT: Omit<HotelEvent, "id"> = {
  title: "",
  description: "",
  location: "",
  date: new Date().toISOString().slice(0, 10),
  startTime: "09:00",
  endTime: "10:00",
  category: "entertainment",
}

const CATEGORY_COLORS: Record<EventCategory, string> = {
  entertainment: "bg-purple-100 text-purple-800",
  dining: "bg-orange-100 text-orange-800",
  wellness: "bg-green-100 text-green-800",
  kids: "bg-pink-100 text-pink-800",
  sports: "bg-blue-100 text-blue-800",
  music: "bg-red-100 text-red-800",
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState<HotelEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<HotelEvent | null>(null)
  const [form, setForm] = useState<Omit<HotelEvent, "id">>(EMPTY_EVENT)
  const [saving, setSaving] = useState(false)

  async function loadEvents() {
    const res = await fetch("/api/events")
    const data = await res.json()
    setEvents(data)
    setLoading(false)
  }

  useEffect(() => { loadEvents() }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY_EVENT)
    setDialogOpen(true)
  }

  function openEdit(event: HotelEvent) {
    setEditing(event)
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      category: event.category,
      color: event.color,
    })
    setDialogOpen(true)
  }

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const url = editing ? `/api/events/${editing.id}` : "/api/events"
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success(editing ? "Event updated" : "Event created")
      setDialogOpen(false)
      loadEvents()
    } catch {
      toast.error("Failed to save event")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Event deleted")
      loadEvents()
    } catch {
      toast.error("Failed to delete event")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage hotel events and activities
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : events.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No events yet. Add your first event.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.date} · {event.startTime} – {event.endTime} · {event.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={CATEGORY_COLORS[event.category]} variant="outline">
                      {event.category}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setField("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setField("date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setField("location", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setField("startTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setField("endTime", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={form.category}
                onChange={(e) => setField("category", e.target.value as EventCategory)}
              >
                <option value="entertainment">Entertainment</option>
                <option value="dining">Dining</option>
                <option value="wellness">Wellness</option>
                <option value="kids">Kids</option>
                <option value="sports">Sports</option>
                <option value="music">Music</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
