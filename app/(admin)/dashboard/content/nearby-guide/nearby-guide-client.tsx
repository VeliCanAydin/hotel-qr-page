"use client"

import { useState } from "react"
import { BadgeCheck, BusFront, CarTaxiFront, MapPinned, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { nearbyGuideIconMap, type NearbyGuideIconKey, type NearbyGuideItem, type NearbyGuideSection } from "@/lib/data/nearby-guide"
import { createNearbyGuideItem, deleteNearbyGuideItem, updateNearbyGuideItem } from "@/lib/actions/nearby-guide"

type NearbyGuideForm = NearbyGuideItem

const SECTION_OPTIONS: NearbyGuideSection[] = ["Nearby Essentials", "Tourist Attractions"]

const ICON_OPTIONS: Array<{ value: NearbyGuideIconKey; label: string }> = [
  { value: "pill", label: "Pharmacy" },
  { value: "basket", label: "Market" },
  { value: "bus", label: "Bus Stop" },
  { value: "taxi", label: "Taxi Stand" },
  { value: "badge", label: "ATM" },
  { value: "alert", label: "Health Center" },
  { value: "tree", label: "Beach / Park" },
  { value: "map", label: "Map Pin" },
  { value: "landmark", label: "Landmark" },
]

function createEmptyItem(section: NearbyGuideSection = "Nearby Essentials", orderIndex = 0): NearbyGuideForm {
  return {
    id: crypto.randomUUID(),
    name: "",
    distance: "",
    eta: "",
    note: "",
    phone: null,
    mapQuery: "",
    tone: section === "Nearby Essentials" ? "emerald" : "sky",
    section,
    iconKey: section === "Nearby Essentials" ? "pill" : "map",
    orderIndex,
  }
}

function getToneClasses(tone: string) {
  switch (tone) {
    case "emerald":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/35 dark:text-emerald-300 dark:ring-emerald-900/60"
    case "sky":
      return "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/35 dark:text-sky-300 dark:ring-sky-900/60"
    case "amber":
      return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/35 dark:text-amber-300 dark:ring-amber-900/60"
    case "rose":
      return "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/35 dark:text-rose-300 dark:ring-rose-900/60"
    case "violet":
      return "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/35 dark:text-violet-300 dark:ring-violet-900/60"
    case "red":
      return "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/35 dark:text-red-300 dark:ring-red-900/60"
    default:
      return "bg-muted text-foreground"
  }
}

function SectionCard({
  title,
  items,
  onEdit,
  onDelete,
}: {
  title: NearbyGuideSection
  items: NearbyGuideItem[]
  onEdit: (item: NearbyGuideItem) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Update the items that appear on the guest-facing page.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = nearbyGuideIconMap[item.iconKey]

          return (
            <Card key={item.id} className="overflow-hidden border-border/60 shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-11 items-center justify-center rounded-2xl ring-1 ${getToneClasses(item.tone)}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium leading-none">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.distance}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 rounded-full">{item.section === "Nearby Essentials" ? "Essentials" : "Attraction"}</Badge>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="size-3.5" />
                    <span>{item.note}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinned className="size-3.5" />
                    <span>{item.eta}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button variant="ghost" size="sm" className="gap-2 px-2" onClick={() => onEdit(item)}>
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 px-2 text-destructive hover:text-destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default function NearbyGuideClient({ initialItems }: { initialItems: NearbyGuideItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<NearbyGuideForm>(createEmptyItem())

  const essentials = items.filter((item) => item.section === "Nearby Essentials")
  const attractions = items.filter((item) => item.section === "Tourist Attractions")

  function openCreate(section: NearbyGuideSection = "Nearby Essentials") {
    setEditingId(null)
    const nextOrderIndex = items
      .filter((item) => item.section === section)
      .reduce((max, item) => Math.max(max, item.orderIndex), -1) + 1
    setForm(createEmptyItem(section, nextOrderIndex))
    setDialogOpen(true)
  }

  function openEdit(item: NearbyGuideItem) {
    setEditingId(item.id)
    setForm(item)
    setDialogOpen(true)
  }

  function setField<K extends keyof NearbyGuideForm>(key: K, value: NearbyGuideForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) return

    const payload: NearbyGuideForm = {
      ...form,
      phone: form.phone?.trim() ? form.phone.trim() : null,
      mapQuery: form.mapQuery.trim(),
      name: form.name.trim(),
      distance: form.distance.trim(),
      eta: form.eta.trim(),
      note: form.note.trim(),
      tone: form.tone.trim(),
    }

    try {
      if (editingId) {
        await updateNearbyGuideItem(editingId, payload)
        setItems((prev) => prev.map((item) => (item.id === editingId ? payload : item)))
        toast.success(`${payload.name} updated`)
      } else {
        await createNearbyGuideItem(payload)
        setItems((prev) => [...prev, payload])
        toast.success(`${payload.name} created`)
      }

      setDialogOpen(false)
    } catch {
      toast.error('Failed to save item')
    }
  }

  async function handleDelete(id: string) {
    const target = items.find((item) => item.id === id)
    try {
      await deleteNearbyGuideItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      if (target) {
        toast.success(`${target.name} removed`)
      }
    } catch {
      toast.error('Failed to delete item')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-gradient-to-br from-background via-background to-muted/30 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
              Content Management
            </Badge>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Nearby Guide</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Manage nearby essentials and tourist attractions from one place.
              </p>
            </div>
          </div>

          <Button className="rounded-full" onClick={() => openCreate("Nearby Essentials")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

      </div>

      <Tabs defaultValue="essentials" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-full p-1">
          <TabsTrigger value="essentials" className="rounded-full">
            Nearby Essentials
          </TabsTrigger>
          <TabsTrigger value="attractions" className="rounded-full">
            Tourist Attractions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="essentials" className="mt-4">
          <SectionCard title="Nearby Essentials" items={essentials} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>

        <TabsContent value="attractions" className="mt-4">
          <SectionCard title="Tourist Attractions" items={attractions} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Nearby Item" : "Add Nearby Item"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setField("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={form.section} onValueChange={(value) => setField("section", value as NearbyGuideSection)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={form.iconKey} onValueChange={(value) => setField("iconKey", value as NearbyGuideIconKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Distance</Label>
              <Input value={form.distance} onChange={(e) => setField("distance", e.target.value)} placeholder="280 m" />
            </div>
            <div className="space-y-2">
              <Label>ETA</Label>
              <Input value={form.eta} onChange={(e) => setField("eta", e.target.value)} placeholder="4 min walk" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Note</Label>
              <Textarea value={form.note} onChange={(e) => setField("note", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Map Query</Label>
              <Input value={form.mapQuery} onChange={(e) => setField("mapQuery", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Phone</Label>
              <Input value={form.phone ?? ""} onChange={(e) => setField("phone", e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editingId ? "Save Changes" : "Create Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}