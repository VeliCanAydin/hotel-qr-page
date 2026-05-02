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
import { Pencil, Clock, DollarSign, CalendarCheck } from "lucide-react"

type SpaService = {
  id: string
  name: string
  description: string
  hours: string
  isFree: boolean
  price: string
  requiresReservation: boolean
  tags: string[]
}

const INITIAL_SERVICES: SpaService[] = [
  {
    id: "turkish-bath",
    name: "Turkish Bath",
    description:
      "Experience the centuries-old tradition of the hammam. Our Turkish Bath offers deep cleansing and relaxation with skilled attendants providing foam massage and exfoliation.",
    hours: "08:00 – 20:00",
    isFree: true,
    price: "",
    requiresReservation: false,
    tags: ["Complimentary", "Daily"],
  },
  {
    id: "massage",
    name: "Massage & Aromatherapy",
    description:
      "Choose from a wide range of therapeutic massages. Our expert therapists use premium oils and techniques to relieve tension and restore balance.",
    hours: "09:00 – 21:00",
    isFree: false,
    price: "Starting from $60",
    requiresReservation: true,
    tags: ["Classic", "Aroma", "Relax", "Hot Stone", "Chocolate", "Algae", "Waist", "Medical"],
  },
  {
    id: "sauna",
    name: "Sauna & Steam Room",
    description:
      "Unwind in our Finnish sauna or steam room. Both facilities are designed to help you detox, relax muscles, and improve circulation.",
    hours: "09:00 – 18:00",
    isFree: true,
    price: "",
    requiresReservation: false,
    tags: ["Complimentary", "Finnish Sauna", "Steam Room"],
  },
  {
    id: "salt-room",
    name: "Salt Room Therapy",
    description:
      "Halotherapy session in our specially designed salt cave. Beneficial for respiratory health, skin conditions, and deep relaxation.",
    hours: "08:00 – 19:30",
    isFree: false,
    price: "Starting from $40",
    requiresReservation: true,
    tags: ["Halotherapy", "Respiratory", "Wellness"],
  },
]

export default function SpaAdminPage() {
  const [services, setServices] = useState<SpaService[]>(INITIAL_SERVICES)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<SpaService | null>(null)
  const [form, setForm] = useState<SpaService | null>(null)

  function openEdit(service: SpaService) {
    setEditingService(service)
    setForm({ ...service })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form || !form.name.trim()) return
    setServices((prev) => prev.map((s) => (s.id === form.id ? form : s)))
    setDialogOpen(false)
    toast.success(`${form.name} updated`)
  }

  function setFormField<K extends keyof SpaService>(key: K, value: SpaService[K]) {
    setForm((p) => (p ? { ...p, [key]: value } : p))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Spa Services</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage spa and wellness service details
        </p>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => openEdit(service)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
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
                  {service.isFree ? "Complimentary" : service.price}
                </span>
                {service.requiresReservation && (
                  <span className="flex items-center gap-1">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    Reservation required
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {service.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Spa Service</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setFormField("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setFormField("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Opening Hours</Label>
                <Input
                  value={form.hours}
                  onChange={(e) => setFormField("hours", e.target.value)}
                  placeholder="e.g. 08:00 – 20:00"
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={form.tags.join(", ")}
                  onChange={(e) =>
                    setFormField(
                      "tags",
                      e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                    )
                  }
                  placeholder="e.g. Classic, Aroma, Relax"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-free"
                    checked={form.isFree}
                    onChange={(e) => setFormField("isFree", e.target.checked)}
                    className="h-4 w-4 rounded border"
                  />
                  <Label htmlFor="is-free" className="cursor-pointer">
                    Complimentary
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reservation"
                    checked={form.requiresReservation}
                    onChange={(e) => setFormField("requiresReservation", e.target.checked)}
                    className="h-4 w-4 rounded border"
                  />
                  <Label htmlFor="reservation" className="cursor-pointer">
                    Reservation Required
                  </Label>
                </div>
              </div>
              {!form.isFree && (
                <div className="space-y-2">
                  <Label>Price Info</Label>
                  <Input
                    value={form.price}
                    onChange={(e) => setFormField("price", e.target.value)}
                    placeholder="e.g. Starting from $60"
                  />
                </div>
              )}
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
