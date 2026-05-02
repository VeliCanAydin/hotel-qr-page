"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { categoryLabels, type RoomServiceItem } from "@/lib/data/roomServiceData"
import {
  createRoomServiceItem,
  updateRoomServiceItem,
  deleteRoomServiceItem,
} from "@/lib/actions/room-service"

type Category = RoomServiceItem["category"]
type TabValue = Category | "all"

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "food", label: "Food" },
  { value: "beverages", label: "Beverages" },
  { value: "other-services", label: "Other Services" },
]

const EMPTY_FORM: Omit<RoomServiceItem, "id"> = {
  name: "",
  description: "",
  price: 0,
  category: "food",
}

export default function RoomServiceClient({ initialItems }: { initialItems: RoomServiceItem[] }) {
  const [items, setItems] = useState<RoomServiceItem[]>(initialItems)
  const [activeTab, setActiveTab] = useState<TabValue>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<RoomServiceItem | null>(null)
  const [form, setForm] = useState<Omit<RoomServiceItem, "id">>(EMPTY_FORM)

  const filtered = useMemo(
    () => (activeTab === "all" ? items : items.filter((i) => i.category === activeTab)),
    [items, activeTab]
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length }
    items.forEach((i) => { c[i.category] = (c[i.category] || 0) + 1 })
    return c
  }, [items])

  function openAdd() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(item: RoomServiceItem) {
    setEditingItem(item)
    setForm({ name: item.name, description: item.description, price: item.price, category: item.category })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (editingItem) {
      const updated = { ...editingItem, ...form }
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)))
      setDialogOpen(false)
      toast.promise(updateRoomServiceItem(editingItem.id, form), {
        loading: "Saving...", success: "Item updated", error: "Failed to save",
      })
    } else {
      const newItem: RoomServiceItem = { id: crypto.randomUUID(), ...form }
      setItems((prev) => [...prev, newItem])
      setDialogOpen(false)
      toast.promise(createRoomServiceItem(newItem), {
        loading: "Saving...", success: "Item added", error: "Failed to add",
      })
    }
  }

  function handleDelete() {
    if (!deleteId) return
    const id = deleteId
    const item = items.find((i) => i.id === id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    setDeleteId(null)
    toast.promise(deleteRoomServiceItem(id), {
      loading: "Deleting...", success: `"${item?.name}" deleted`, error: "Failed to delete",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Room Service</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage food, beverages and in-room service items</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />Add Item
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              {tab.label}
              <Badge variant="secondary" className="text-xs h-5 px-1.5">{counts[tab.value] ?? 0}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden lg:table-cell">Description</TableHead>
                  <TableHead className="w-[90px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{categoryLabels[item.category]}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {item.price === 0 ? <Badge variant="secondary">Free</Badge> : `$${item.price.toFixed(2)}`}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm max-w-xs truncate">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No items in this category
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Club Sandwich"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description" rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" min="0" step="0.01" value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v as Category }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="other-services">Other Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editingItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the item from room service.</AlertDialogDescription>
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
