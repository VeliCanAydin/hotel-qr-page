"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Pencil, Plus, Trash2, Clock, DollarSign, CalendarCheck } from "lucide-react"
import {
  createWellnessService,
  updateWellnessService,
  deleteWellnessService,
  type WellnessServiceInput,
} from "@/lib/actions/wellness-services"

type WellnessService = WellnessServiceInput

const EMPTY: Omit<WellnessService, 'id'> = {
  name: '',
  description: '',
  image: '',
  imageAlt: '',
  hours: '',
  isPaid: false,
  requiresReservation: false,
  orderIndex: 0,
}

export default function WellnessClient({ initialServices }: { initialServices: WellnessService[] }) {
  const [services, setServices] = useState(initialServices)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<WellnessService>({ id: '', ...EMPTY })

  function openCreate() {
    setEditingId(null)
    setForm({ id: crypto.randomUUID(), ...EMPTY, orderIndex: services.length })
    setDialogOpen(true)
  }

  function openEdit(service: WellnessService) {
    setEditingId(service.id)
    setForm({ ...service })
    setDialogOpen(true)
  }

  function setField<K extends keyof WellnessService>(key: K, value: WellnessService[K]) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (editingId) {
      const { id, ...data } = form
      setServices((prev) => prev.map((s) => (s.id === id ? form : s)))
      setDialogOpen(false)
      toast.promise(updateWellnessService(id, data), {
        loading: 'Saving...',
        success: `${form.name} updated`,
        error: 'Failed to save',
      })
    } else {
      setServices((prev) => [...prev, form])
      setDialogOpen(false)
      toast.promise(createWellnessService(form), {
        loading: 'Creating...',
        success: `${form.name} created`,
        error: 'Failed to create',
      })
    }
  }

  function handleDelete(service: WellnessService) {
    setServices((prev) => prev.filter((s) => s.id !== service.id))
    toast.promise(deleteWellnessService(service.id), {
      loading: 'Deleting...',
      success: `${service.name} deleted`,
      error: 'Failed to delete',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Wellness</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage wellness activities and schedules
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Activity
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <CardDescription className="mt-1 text-xs line-clamp-2">
                    {service.description}
                  </CardDescription>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(service)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(service)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {service.hours}
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                {service.isPaid ? 'Paid' : 'Complimentary'}
              </div>
              {service.requiresReservation && (
                <div className="flex items-center gap-1.5">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Reservation required
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setField('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image Path</Label>
                <Input
                  value={form.image}
                  onChange={(e) => setField('image', e.target.value)}
                  placeholder="/wellness/image.jpeg"
                />
              </div>
              <div className="space-y-2">
                <Label>Image Alt</Label>
                <Input
                  value={form.imageAlt}
                  onChange={(e) => setField('imageAlt', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hours</Label>
              <Input
                value={form.hours}
                onChange={(e) => setField('hours', e.target.value)}
                placeholder="e.g. 07:00 - 22:00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPaid}
                  onChange={(e) => setField('isPaid', e.target.checked)}
                  className="h-4 w-4 rounded border"
                />
                <span className="text-sm">Paid Activity</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.requiresReservation}
                  onChange={(e) => setField('requiresReservation', e.target.checked)}
                  className="h-4 w-4 rounded border"
                />
                <span className="text-sm">Reservation Required</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editingId ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
