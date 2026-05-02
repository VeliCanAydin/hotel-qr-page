"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Utensils, X } from "lucide-react"

type Restaurant = {
  id: string
  src: string
  alt: string
  title: string
  description: string
  hasReservation: boolean
  openingHours: string
  cuisine: string
  highlights: string[]
  order: number
}

export default function RestaurantsAdminPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Restaurant | null>(null)
  const [form, setForm] = useState<Omit<Restaurant, "id">>({
    src: "",
    alt: "",
    title: "",
    description: "",
    hasReservation: false,
    openingHours: "",
    cuisine: "",
    highlights: [],
    order: 0,
  })
  const [highlightInput, setHighlightInput] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch("/api/restaurants")
    setRestaurants(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openEdit(r: Restaurant) {
    setEditing(r)
    setForm({
      src: r.src,
      alt: r.alt,
      title: r.title,
      description: r.description,
      hasReservation: r.hasReservation,
      openingHours: r.openingHours,
      cuisine: r.cuisine,
      highlights: [...r.highlights],
      order: r.order,
    })
    setHighlightInput("")
    setDialogOpen(true)
  }

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  function addHighlight() {
    const val = highlightInput.trim()
    if (!val) return
    setForm((p) => ({ ...p, highlights: [...p.highlights, val] }))
    setHighlightInput("")
  }

  function removeHighlight(i: number) {
    setForm((p) => ({ ...p, highlights: p.highlights.filter((_, idx) => idx !== i) }))
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch(`/api/restaurants/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success("Restaurant updated")
      setDialogOpen(false)
      load()
    } catch {
      toast.error("Failed to update restaurant")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Restaurants</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage restaurant listings shown to guests</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">{r.title}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                <p className="text-xs">
                  <span className="font-medium">Hours:</span> {r.openingHours}
                </p>
                <p className="text-xs">
                  <span className="font-medium">Cuisine:</span> {r.cuisine}
                </p>
                {r.hasReservation && (
                  <Badge variant="secondary" className="text-xs">Reservation Required</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Restaurant — {editing?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setField("title", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cuisine</Label>
                <Input value={form.cuisine} onChange={(e) => setField("cuisine", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setField("description", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Opening Hours</Label>
                <Input value={form.openingHours} onChange={(e) => setField("openingHours", e.target.value)} />
              </div>
              <div className="space-y-2 flex items-end gap-3">
                <div className="flex items-center gap-2 pb-1">
                  <input
                    type="checkbox"
                    id="reservation"
                    checked={form.hasReservation}
                    onChange={(e) => setField("hasReservation", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="reservation">Reservation Required</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Highlights</Label>
              <div className="flex gap-2">
                <Input
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                  placeholder="Add highlight and press Enter"
                />
                <Button type="button" variant="outline" onClick={addHighlight}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.highlights.map((h, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {h}
                    <button onClick={() => removeHighlight(i)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
