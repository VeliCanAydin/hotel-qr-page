"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Pencil, Clock, Users } from "lucide-react"

type WellnessClass = {
  id: string
  name: string
  description: string
  instructor: string
  duration: string
  schedule: string
  capacity: number
  level: "All Levels" | "Beginner" | "Intermediate" | "Advanced"
}

const INITIAL_CLASSES: WellnessClass[] = [
  {
    id: "yoga",
    name: "Morning Yoga",
    description:
      "Start your day with a gentle yoga flow focusing on breathing, flexibility, and mindfulness. Suitable for all levels.",
    instructor: "Maya Chen",
    duration: "60 min",
    schedule: "Daily 07:00 – 08:00",
    capacity: 15,
    level: "All Levels",
  },
  {
    id: "pilates",
    name: "Pilates",
    description:
      "Core-strengthening Pilates class using mat and resistance bands. Build strength, flexibility, and body awareness.",
    instructor: "Sofia Martinez",
    duration: "50 min",
    schedule: "Mon, Wed, Fri 08:00 – 08:50",
    capacity: 12,
    level: "Beginner",
  },
  {
    id: "aqua-aerobics",
    name: "Aqua Aerobics",
    description:
      "Fun water-based cardio workout in the pool. Low impact but high energy — perfect for all fitness levels.",
    instructor: "James Wilson",
    duration: "45 min",
    schedule: "Daily 11:00 – 11:45",
    capacity: 20,
    level: "All Levels",
  },
  {
    id: "fitness",
    name: "Fitness Center",
    description:
      "Fully equipped gym with cardio machines, free weights, and cable stations. Personal training sessions available on request.",
    instructor: "On-request",
    duration: "Open access",
    schedule: "06:00 – 22:00",
    capacity: 30,
    level: "All Levels",
  },
  {
    id: "meditation",
    name: "Guided Meditation",
    description:
      "Evening meditation sessions to wind down and reconnect. Techniques include breathwork, body scan, and visualization.",
    instructor: "Leila Akhtar",
    duration: "30 min",
    schedule: "Daily 19:00 – 19:30",
    capacity: 10,
    level: "All Levels",
  },
]

const LEVEL_COLORS: Record<WellnessClass["level"], string> = {
  "All Levels": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Beginner: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Intermediate: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}

export default function WellnessAdminPage() {
  const [classes, setClasses] = useState<WellnessClass[]>(INITIAL_CLASSES)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<WellnessClass | null>(null)
  const [form, setForm] = useState<WellnessClass | null>(null)

  function openEdit(wc: WellnessClass) {
    setEditingClass(wc)
    setForm({ ...wc })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form || !form.name.trim()) return
    setClasses((prev) => prev.map((c) => (c.id === form.id ? form : c)))
    setDialogOpen(false)
    toast.success(`${form.name} updated`)
  }

  function setFormField<K extends keyof WellnessClass>(key: K, value: WellnessClass[K]) {
    setForm((p) => (p ? { ...p, [key]: value } : p))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Wellness</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage wellness classes, fitness activities, and schedules
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((wc) => (
          <Card key={wc.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{wc.name}</CardTitle>
                  <CardDescription className="mt-1 text-xs line-clamp-2">
                    {wc.description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => openEdit(wc)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {wc.schedule} · {wc.duration}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {wc.instructor} · Max {wc.capacity} guests
              </div>
              <Badge className={`text-xs border-0 mt-1 ${LEVEL_COLORS[wc.level]}`}>
                {wc.level}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Wellness Class</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setFormField("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setFormField("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <Input
                    value={form.instructor}
                    onChange={(e) => setFormField("instructor", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={form.duration}
                    onChange={(e) => setFormField("duration", e.target.value)}
                    placeholder="e.g. 60 min"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Schedule</Label>
                <Input
                  value={form.schedule}
                  onChange={(e) => setFormField("schedule", e.target.value)}
                  placeholder="e.g. Daily 07:00 – 08:00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Capacity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(e) => setFormField("capacity", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    value={form.level}
                    onChange={(e) => setFormField("level", e.target.value as WellnessClass["level"])}
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form?.name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
