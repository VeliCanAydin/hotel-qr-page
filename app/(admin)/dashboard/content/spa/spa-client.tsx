"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Pencil, Plus, Trash2, Clock, DollarSign, CalendarCheck } from "lucide-react"
import {
  createSpaService,
  updateSpaService,
  deleteSpaService,
  type SpaServiceInput,
} from "@/lib/actions/spa-services"

type SpaService = SpaServiceInput

const EMPTY: Omit<SpaService, 'id'> = {
  name: '',
  description: '',
  image: '',
  imageAlt: '',
  hours: '',
  isFree: true,
  price: '',
  requiresReservation: false,
  tags: '',
  orderIndex: 0,
}

export default function SpaClient({ initialServices }: { initialServices: SpaService[] }) {
  const [services, setServices] = useState(initialServices)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SpaService>({ id: '', ...EMPTY })

  function openCreate() {
    setEditingId(null)
    setForm({ id: crypto.randomUUID(), ...EMPTY, orderIndex: services.length })
    setDialogOpen(true)
  }

  function openEdit(service: SpaService) {
    setEditingId(service.id)
    setForm({ ...service })
    setDialogOpen(true)
  }

  function setField<K extends keyof SpaService>(key: K, value: SpaService[K]) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (editingId) {
      const { id, ...data } = form
      setServices((prev) => prev.map((s) => (s.id === id ? form : s)))
      setDialogOpen(false)
      toast.promise(updateSpaService(id, data), {
        loading: 'Saving...',
        success: `${form.name} updated`,
        error: 'Failed to save',
      })
    } else {
      setServices((prev) => [...prev, form])
      setDialogOpen(false)
      toast.promise(createSpaService(form), {
        loading: 'Creating...',
        success: `${form.name} created`,
        error: 'Failed to create',
      })
    }
  }

  function handleDelete(service: SpaService) {
    setServices((prev) => prev.filter((s) => s.id !== service.id))
    toast.promise(deleteSpaService(service.id), {
      loading: 'Deleting...',
      success: `${service.name} deleted`,
      error: 'Failed to delete',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Spa Services</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage spa and wellness service details
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Service
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <CardDescription className="mt-1 text-xs leading-relaxed line-clamp-2">
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
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {service.hours}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  {service.isFree ? 'Complimentary' : service.price}
                </span>
                {service.requiresReservation && (
                  <span className="flex items-center gap-1">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    Reservation required
                  </span>
                )}
              </div>
              {service.tags && (
                <div className="flex flex-wrap gap-1">
                  {service.tags.split(',').filter(Boolean).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Spa Service' : 'Add Spa Service'}</DialogTitle>
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
                  placeholder="/spa/image.jpeg"
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
              <Label>Opening Hours</Label>
              <Input
                value={form.hours}
                onChange={(e) => setField('hours', e.target.value)}
                placeholder="e.g. 08:00 – 20:00"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => setField('tags', e.target.value)}
                placeholder="e.g. Classic, Aroma, Relax"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) => setField('isFree', e.target.checked)}
                  className="h-4 w-4 rounded border"
                />
                <span className="text-sm">Complimentary</span>
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
            {!form.isFree && (
              <div className="space-y-2">
                <Label>Price Info</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  placeholder="e.g. Starting from $60"
                />
              </div>
            )}
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
