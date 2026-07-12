"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Clock, X } from "lucide-react"
import {
  createBar, updateBar, deleteBar,
  createBarMenuItem, updateBarMenuItem, deleteBarMenuItem, createBarMenuCategory,
} from "@/lib/actions/bars"

type BarRow = {
  id: string; name: string; description: string; highlights: string; image: string
  openTime: string | null; closeTime: string | null; orderIndex: number
}
type ItemRow = {
  id: string; barId: string; name: string; description: string
  priceText: string; category: string; orderIndex: number
}
type Category = { id: string; label: string }
type ItemForm = { name: string; description: string; priceText: string; category: string }

const EMPTY_ITEM: ItemForm = { name: '', description: '', priceText: '', category: '' }

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function formatHours(openTime: string | null, closeTime: string | null) {
  return [openTime?.slice(0, 5), closeTime?.slice(0, 5)].filter(Boolean).join(' – ') || '—'
}

export default function BarsClient({
  initialBars,
  initialItems,
  initialCategories,
}: {
  initialBars: BarRow[]
  initialItems: ItemRow[]
  initialCategories: Category[]
}) {
  const [bars, setBars] = useState<BarRow[]>(initialBars)
  const [items, setItems] = useState<ItemRow[]>(initialItems)
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  // Bar dialog
  const [barDialogOpen, setBarDialogOpen] = useState(false)
  const [isAddMode, setIsAddMode] = useState(false)
  const [barForm, setBarForm] = useState<BarRow | null>(null)
  const [confirmDeleteBarId, setConfirmDeleteBarId] = useState<string | null>(null)

  // Item dialog
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [itemBarId, setItemBarId] = useState('')
  const [editingItem, setEditingItem] = useState<ItemRow | null>(null)
  const [itemForm, setItemForm] = useState<ItemForm>(EMPTY_ITEM)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const itemsByBar = useMemo(() => {
    const map: Record<string, ItemRow[]> = {}
    for (const item of items) (map[item.barId] ??= []).push(item)
    return map
  }, [items])

  // ── Bar handlers ──
  function openAddBar() {
    setIsAddMode(true)
    setBarForm({ id: '', name: '', description: '', highlights: '', image: '', openTime: null, closeTime: null, orderIndex: bars.length })
    setBarDialogOpen(true)
  }

  function openEditBar(bar: BarRow) {
    setIsAddMode(false)
    setBarForm({
      ...bar,
      openTime: bar.openTime?.slice(0, 5) ?? null,
      closeTime: bar.closeTime?.slice(0, 5) ?? null,
    })
    setBarDialogOpen(true)
  }

  function handleBarSave() {
    if (!barForm?.name.trim()) return
    if (isAddMode) {
      const newBar = { ...barForm, id: slugify(barForm.name) }
      setBars((prev) => [...prev, newBar])
      setBarDialogOpen(false)
      toast.promise(createBar(newBar), { loading: 'Creating...', success: 'Bar created', error: 'Failed to create' })
    } else {
      setBars((prev) => prev.map((b) => b.id === barForm.id ? barForm : b))
      setBarDialogOpen(false)
      const { id, ...data } = barForm
      toast.promise(updateBar(id, data), { loading: 'Saving...', success: 'Bar updated', error: 'Failed to save' })
    }
  }

  function handleBarDelete() {
    if (!confirmDeleteBarId) return
    const id = confirmDeleteBarId
    setConfirmDeleteBarId(null)
    setBarDialogOpen(false)
    setBars((prev) => prev.filter((b) => b.id !== id))
    setItems((prev) => prev.filter((i) => i.barId !== id))
    toast.promise(deleteBar(id), { loading: 'Deleting...', success: 'Bar deleted', error: 'Failed to delete' })
  }

  // ── Item handlers ──
  function openAddItem(barId: string) {
    setItemBarId(barId)
    setEditingItem(null)
    setItemForm({ ...EMPTY_ITEM, category: categories[0]?.id ?? '' })
    setAddingCategory(false)
    setItemDialogOpen(true)
  }

  function openEditItem(item: ItemRow) {
    setItemBarId(item.barId)
    setEditingItem(item)
    setItemForm({ name: item.name, description: item.description, priceText: item.priceText, category: item.category })
    setAddingCategory(false)
    setItemDialogOpen(true)
  }

  async function handleItemSave() {
    if (!itemForm.name.trim() || !itemForm.category) return
    if (editingItem) {
      setItems((prev) => prev.map((i) => i.id === editingItem.id ? { ...editingItem, ...itemForm } : i))
      setItemDialogOpen(false)
      toast.promise(updateBarMenuItem(editingItem.id, itemForm), { loading: 'Saving...', success: 'Item updated', error: 'Failed to save' })
    } else {
      const tempId = `temp-${Date.now()}`
      const barItems = itemsByBar[itemBarId] ?? []
      setItems((prev) => [...prev, { ...itemForm, id: tempId, barId: itemBarId, orderIndex: barItems.length }])
      setItemDialogOpen(false)
      try {
        const realId = await createBarMenuItem(itemBarId, { ...itemForm, orderIndex: barItems.length })
        setItems((prev) => prev.map((i) => i.id === tempId ? { ...i, id: realId } : i))
        toast.success('Item added')
      } catch {
        setItems((prev) => prev.filter((i) => i.id !== tempId))
        toast.error('Failed to add item')
      }
    }
  }

  function handleItemDelete() {
    if (!deleteItemId) return
    const id = deleteItemId
    setDeleteItemId(null)
    setItems((prev) => prev.filter((i) => i.id !== id))
    toast.promise(deleteBarMenuItem(id), { loading: 'Removing...', success: 'Item removed', error: 'Failed to remove' })
  }

  function handleAddCategory() {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    const id = slugify(trimmed)
    if (!categories.some((c) => c.id === id)) {
      setCategories((prev) => [...prev, { id, label: trimmed }])
      toast.promise(createBarMenuCategory(id, trimmed), { loading: 'Adding...', success: 'Category added', error: 'Failed' })
    }
    setItemForm((p) => ({ ...p, category: id }))
    setAddingCategory(false)
    setNewCategoryName('')
  }

  // ── Render ──
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bar Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage bar details and drink menus</p>
      </div>

      <Tabs defaultValue="info" onValueChange={() => setCategoryFilter('all')}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="info">Bar Info</TabsTrigger>
          {bars.map((bar) => (
            <TabsTrigger key={bar.id} value={`menu-${bar.id}`}>{bar.name}</TabsTrigger>
          ))}
        </TabsList>

        {/* Bar Info Tab */}
        <TabsContent value="info" className="mt-4">
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bars.map((bar) => (
                <Card key={bar.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{bar.name}</CardTitle>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => openEditBar(bar)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatHours(bar.openTime, bar.closeTime)}</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{bar.description}</p>
                    <p className="text-muted-foreground text-xs">{(itemsByBar[bar.id] ?? []).length} menu items</p>
                  </CardContent>
                </Card>
              ))}
              <button
                onClick={openAddBar}
                className="rounded-lg border-2 border-dashed bg-muted/20 min-h-[180px] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Add Bar</span>
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Per-Bar Menu Tabs */}
        {bars.map((bar) => {
          const barItems = itemsByBar[bar.id] ?? []
          const filtered = categoryFilter === 'all' ? barItems : barItems.filter((i) => i.category === categoryFilter)
          const usedCategories = categories.filter((c) => barItems.some((i) => i.category === c.id))
          return (
            <TabsContent key={bar.id} value={`menu-${bar.id}`} className="mt-4 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <p className="text-sm text-muted-foreground">{bar.name}</p>
                </div>
                <Button size="sm" onClick={() => openAddItem(bar.id)}>
                  <Plus className="h-4 w-4 mr-2" />Add Item
                </Button>
              </div>

              {barItems.length === 0 ? (
                <div className="rounded-lg border border-dashed p-12 flex flex-col items-center gap-3 text-muted-foreground">
                  <p className="font-medium">No menu items yet</p>
                  <Button variant="outline" size="sm" onClick={() => openAddItem(bar.id)}>
                    <Plus className="h-4 w-4 mr-2" />Add your first item
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Button variant={categoryFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter('all')}>
                      All ({barItems.length})
                    </Button>
                    {usedCategories.map((cat) => (
                      <Button key={cat.id} variant={categoryFilter === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter(cat.id)}>
                        {cat.label} ({barItems.filter((i) => i.category === cat.id).length})
                      </Button>
                    ))}
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="hidden lg:table-cell">Description</TableHead>
                          <TableHead className="w-20 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {categories.find((c) => c.id === item.category)?.label ?? item.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {item.priceText || <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm max-w-xs truncate">{item.description}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditItem(item)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteItemId(item.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      {/* ── Bar Add/Edit Dialog ── */}
      <Dialog open={barDialogOpen} onOpenChange={setBarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isAddMode ? 'Add Bar' : 'Edit Bar'}</DialogTitle>
          </DialogHeader>
          {barForm && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={barForm.name} onChange={(e) => setBarForm((p) => p && { ...p, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={barForm.description} onChange={(e) => setBarForm((p) => p && { ...p, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Highlights (comma separated)</Label>
                <Input value={barForm.highlights} placeholder="e.g. Sea view, Live music"
                  onChange={(e) => setBarForm((p) => p && { ...p, highlights: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Image Path</Label>
                <Input value={barForm.image} placeholder="/bars/d-bar.jpg" onChange={(e) => setBarForm((p) => p && { ...p, image: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Opening Hours</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={barForm.openTime ?? ''}
                    onChange={(e) => setBarForm((p) => p && { ...p, openTime: e.target.value || null })}
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                  />
                  <span className="text-muted-foreground text-sm shrink-0">–</span>
                  <input
                    type="time"
                    value={barForm.closeTime ?? ''}
                    onChange={(e) => setBarForm((p) => p && { ...p, closeTime: e.target.value || null })}
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
            {!isAddMode && barForm && (
              <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteBarId(barForm.id)}>
                Delete Bar
              </Button>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setBarDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleBarSave} disabled={!barForm?.name.trim()}>
                {isAddMode ? 'Create Bar' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Bar Confirm */}
      <AlertDialog open={!!confirmDeleteBarId} onOpenChange={(open) => !open && setConfirmDeleteBarId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bar</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the bar and all its menu items.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleBarDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Item Confirm */}
      <AlertDialog open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this item from the menu.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleItemDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Item Add/Edit Dialog ── */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={itemForm.name} onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Mojito" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={itemForm.description} onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (empty = included)</Label>
                <Input value={itemForm.priceText} placeholder="e.g. 8€"
                  onChange={(e) => setItemForm((p) => ({ ...p, priceText: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                {addingCategory ? (
                  <div className="flex gap-2">
                    <Input autoFocus value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Cocktails"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory() } }} />
                    <Button type="button" size="icon" variant="default" onClick={handleAddCategory} disabled={!newCategoryName.trim()}><Plus className="h-4 w-4" /></Button>
                    <Button type="button" size="icon" variant="ghost" onClick={() => { setAddingCategory(false); setNewCategoryName('') }}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <Select value={itemForm.category} onValueChange={(v) => {
                    if (v === '__add_new__') { setAddingCategory(true); setNewCategoryName('') }
                    else setItemForm((p) => ({ ...p, category: v }))
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                      <SelectSeparator />
                      <SelectItem value="__add_new__">
                        <span className="flex items-center gap-2 text-muted-foreground"><Plus className="h-3.5 w-3.5" />Add Category...</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleItemSave} disabled={!itemForm.name.trim() || !itemForm.category}>
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
