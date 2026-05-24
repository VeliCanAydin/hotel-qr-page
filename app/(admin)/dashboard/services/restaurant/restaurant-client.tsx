"use client"

import { useState, useMemo, useRef } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SelectSeparator } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Plus, Pencil, Trash2, Leaf, Clock, X, Upload, Loader2, ImageOff, Play, Save, LayoutList } from "lucide-react"
import { createRestaurant, updateRestaurant, deleteRestaurant } from "@/lib/actions/restaurants"
import {
  createMenuTemplate, saveCurrentMenuAsTemplate, loadMenuTemplate,
  deleteMenuTemplate, getTemplateItems, addTemplateItem, updateTemplateItem, removeTemplateItem,
} from "@/lib/actions/menu-templates"
import { createMenuCategory } from "@/lib/actions/menu-items"
import { ALLERGENS } from '@/lib/data/allergens'

type RestaurantRow = {
  id: string; name: string; cuisine: string; openTime: string | null; closeTime: string | null
  description: string; reservation: boolean; orderIndex: number
}
type TemplateRow = {
  id: string; name: string; restaurantId: string; createdAt: Date | string; itemCount: number
}
type TemplateItemRow = {
  id: string; templateId: string; name: string; description: string
  category: string; price: number; isVegetarian: boolean; imageUrl: string | null; orderIndex: number
  allergens?: string[]
}
type MenuItemRow = { id: string; restaurantId: string }
type Category = { id: string; label: string }
type MenuForm = { name: string; description: string; price: number; isVegetarian: boolean; category: string; allergens?: string[] }

const PROTECTED_IDS = ['a-la-carte', 'main-restaurant', 'snack-restaurant']
const EMPTY_FORM: MenuForm = { name: '', description: '', price: 0, isVegetarian: false, category: '', allergens: [] }

export default function RestaurantClient({
  initialRestaurants,
  initialMenuItems,
  initialTemplatesByRestaurant,
  initialCategories,
}: {
  initialRestaurants: RestaurantRow[]
  initialMenuItems: MenuItemRow[]
  initialTemplatesByRestaurant: Record<string, TemplateRow[]>
  initialCategories: Category[]
}) {
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>(initialRestaurants)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [templatesByRestaurant, setTemplatesByRestaurant] = useState<Record<string, TemplateRow[]>>(initialTemplatesByRestaurant)
  const [mainTab, setMainTab] = useState("info")

  // Restaurant dialog
  const [restaurantDialogOpen, setRestaurantDialogOpen] = useState(false)
  const [isAddMode, setIsAddMode] = useState(false)
  const [restaurantForm, setRestaurantForm] = useState<RestaurantRow | null>(null)
  const [confirmDeleteRestaurantId, setConfirmDeleteRestaurantId] = useState<string | null>(null)

  // Save/Add template dialogs
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [saveTemplateRestaurantId, setSaveTemplateRestaurantId] = useState('')
  const [saveTemplateName, setSaveTemplateName] = useState('')
  const [saveTemplateLoading, setSaveTemplateLoading] = useState(false)
  const [addTemplateOpen, setAddTemplateOpen] = useState(false)
  const [addTemplateRestaurantId, setAddTemplateRestaurantId] = useState('')
  const [addTemplateName, setAddTemplateName] = useState('')
  const [addTemplateLoading, setAddTemplateLoading] = useState(false)

  // Load/Delete template
  const [loadConfirmOpen, setLoadConfirmOpen] = useState(false)
  const [pendingLoad, setPendingLoad] = useState<{ templateId: string; restaurantId: string } | null>(null)
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null)
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null)
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null)

  // Template edit dialog
  const [templateEditOpen, setTemplateEditOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TemplateRow | null>(null)
  const [templateItems, setTemplateItems] = useState<TemplateItemRow[]>([])
  const [templateItemsLoading, setTemplateItemsLoading] = useState(false)
  const [templateIsDirty, setTemplateIsDirty] = useState(false)
  const [unsavedChangesAlertOpen, setUnsavedChangesAlertOpen] = useState(false)
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all')

  // Template item form
  const [templateItemDialogOpen, setTemplateItemDialogOpen] = useState(false)
  const [editingTemplateItem, setEditingTemplateItem] = useState<TemplateItemRow | null>(null)
  const [templateItemForm, setTemplateItemForm] = useState<MenuForm>(EMPTY_FORM)
  const [templateItemImageUrl, setTemplateItemImageUrl] = useState('')
  const [templateItemImageUploading, setTemplateItemImageUploading] = useState(false)
  const templateItemFileInputRef = useRef<HTMLInputElement>(null)
  const [addingTemplateCategory, setAddingTemplateCategory] = useState(false)
  const [newTemplateCategoryName, setNewTemplateCategoryName] = useState('')
  const [deleteTemplateItemId, setDeleteTemplateItemId] = useState<string | null>(null)

  const activeItemCountByRestaurant = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of initialMenuItems) {
      counts[item.restaurantId] = (counts[item.restaurantId] ?? 0) + 1
    }
    return counts
  }, [initialMenuItems])

  const filteredTemplateItems = useMemo(
    () => templateCategoryFilter === 'all' ? templateItems : templateItems.filter((i) => i.category === templateCategoryFilter),
    [templateItems, templateCategoryFilter]
  )
  const templateItemCounts = useMemo(() => {
    const c: Record<string, number> = { all: templateItems.length }
    templateItems.forEach((i) => { c[i.category] = (c[i.category] || 0) + 1 })
    return c
  }, [templateItems])

  // ── Restaurant handlers ──
  function openAddRestaurant() {
    setIsAddMode(true)
    setRestaurantForm({ id: '', name: '', cuisine: '', openTime: null, closeTime: null, description: '', reservation: false, orderIndex: restaurants.length })
    setRestaurantDialogOpen(true)
  }

  function openEditRestaurant(r: RestaurantRow) {
    setIsAddMode(false)
    setRestaurantForm({
      ...r,
      openTime: r.openTime?.slice(0, 5) ?? null,
      closeTime: r.closeTime?.slice(0, 5) ?? null,
    })
    setRestaurantDialogOpen(true)
  }

  function handleRestaurantSave() {
    if (!restaurantForm?.name.trim()) return
    if (isAddMode) {
      const id = restaurantForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const newR = { ...restaurantForm, id }
      setRestaurants((prev) => [...prev, newR])
      setTemplatesByRestaurant((prev) => ({ ...prev, [id]: [] }))
      setRestaurantDialogOpen(false)
      toast.promise(createRestaurant(newR), { loading: 'Creating...', success: 'Restaurant created', error: 'Failed to create' })
    } else {
      setRestaurants((prev) => prev.map((r) => r.id === restaurantForm.id ? restaurantForm : r))
      setRestaurantDialogOpen(false)
      const { id, ...data } = restaurantForm
      toast.promise(updateRestaurant(id, data), { loading: 'Saving...', success: 'Restaurant updated', error: 'Failed to save' })
    }
  }

  function handleRestaurantDelete() {
    if (!confirmDeleteRestaurantId) return
    const id = confirmDeleteRestaurantId
    setConfirmDeleteRestaurantId(null)
    setRestaurantDialogOpen(false)
    setRestaurants((prev) => prev.filter((r) => r.id !== id))
    setTemplatesByRestaurant((prev) => { const n = { ...prev }; delete n[id]; return n })
    toast.promise(deleteRestaurant(id), { loading: 'Deleting...', success: 'Restaurant deleted', error: 'Failed to delete' })
  }

  // ── Template list handlers ──
  function openSaveAsTemplate(restaurantId: string) {
    setSaveTemplateRestaurantId(restaurantId)
    setSaveTemplateName('')
    setSaveTemplateOpen(true)
  }

  async function handleSaveAsTemplate() {
    if (!saveTemplateName.trim()) return
    setSaveTemplateLoading(true)
    try {
      const id = await saveCurrentMenuAsTemplate(saveTemplateRestaurantId, saveTemplateName.trim())
      const newT: TemplateRow = { id, name: saveTemplateName.trim(), restaurantId: saveTemplateRestaurantId, createdAt: new Date(), itemCount: activeItemCountByRestaurant[saveTemplateRestaurantId] ?? 0 }
      setTemplatesByRestaurant((prev) => ({ ...prev, [saveTemplateRestaurantId]: [...(prev[saveTemplateRestaurantId] ?? []), newT] }))
      setSaveTemplateOpen(false)
      toast.success('Template saved')
    } catch {
      toast.error('Failed to save template')
    } finally {
      setSaveTemplateLoading(false)
    }
  }

  function openAddTemplate(restaurantId: string) {
    setAddTemplateRestaurantId(restaurantId)
    setAddTemplateName('')
    setAddTemplateOpen(true)
  }

  async function handleAddTemplate() {
    if (!addTemplateName.trim()) return
    setAddTemplateLoading(true)
    try {
      const id = await createMenuTemplate(addTemplateRestaurantId, addTemplateName.trim())
      const newT: TemplateRow = { id, name: addTemplateName.trim(), restaurantId: addTemplateRestaurantId, createdAt: new Date(), itemCount: 0 }
      setTemplatesByRestaurant((prev) => ({ ...prev, [addTemplateRestaurantId]: [...(prev[addTemplateRestaurantId] ?? []), newT] }))
      setAddTemplateOpen(false)
      toast.success('Template created')
    } catch {
      toast.error('Failed to create template')
    } finally {
      setAddTemplateLoading(false)
    }
  }

  function openLoadConfirm(templateId: string, restaurantId: string) {
    setPendingLoad({ templateId, restaurantId })
    setLoadConfirmOpen(true)
  }

  async function handleLoadTemplate() {
    if (!pendingLoad) return
    const { templateId, restaurantId } = pendingLoad
    setLoadingTemplateId(templateId)
    setLoadConfirmOpen(false)
    try {
      await loadMenuTemplate(templateId, restaurantId)
      toast.success('Menu loaded from template')
    } catch {
      toast.error('Failed to load template')
    } finally {
      setLoadingTemplateId(null)
      setPendingLoad(null)
    }
  }

  async function handleDeleteTemplate() {
    if (!deleteTemplateId) return
    const id = deleteTemplateId
    setDeletingTemplateId(id)
    setDeleteTemplateId(null)
    try {
      await deleteMenuTemplate(id)
      setTemplatesByRestaurant((prev) => {
        const updated = { ...prev }
        for (const rid of Object.keys(updated)) updated[rid] = updated[rid].filter((t) => t.id !== id)
        return updated
      })
      toast.success('Template deleted')
    } catch {
      toast.error('Failed to delete template')
    } finally {
      setDeletingTemplateId(null)
    }
  }

  // ── Template edit handlers ──
  async function openTemplateEdit(template: TemplateRow) {
    setEditingTemplate(template)
    setTemplateIsDirty(false)
    setTemplateCategoryFilter('all')
    setTemplateItems([])
    setTemplateItemsLoading(true)
    setTemplateEditOpen(true)
    try {
        const items = await getTemplateItems(template.id)
        const parsed = items.map((it: any) => ({
          ...it,
          allergens: it?.allergens ? (typeof it.allergens === 'string' ? JSON.parse(it.allergens) : it.allergens) : [],
        }))
        setTemplateItems(parsed)
    } catch {
      toast.error('Failed to load template items')
    } finally {
      setTemplateItemsLoading(false)
    }
  }

  function requestCloseTemplateEdit() {
    if (templateIsDirty) {
      setUnsavedChangesAlertOpen(true)
    } else {
      closeTemplateEdit()
    }
  }

  function closeTemplateEdit() {
    if (editingTemplate) {
      setTemplatesByRestaurant((prev) => ({
        ...prev,
        [editingTemplate.restaurantId]: (prev[editingTemplate.restaurantId] ?? []).map((t) =>
          t.id === editingTemplate.id ? { ...t, itemCount: templateItems.length } : t
        ),
      }))
    }
    setTemplateIsDirty(false)
    setTemplateEditOpen(false)
  }

  function openAddTemplateItem() {
    setEditingTemplateItem(null)
    setTemplateItemForm({ ...EMPTY_FORM, category: categories[0]?.id ?? '', allergens: [] })
    setTemplateItemImageUrl('')
    setAddingTemplateCategory(false)
    setTemplateItemDialogOpen(true)
  }

  function openEditTemplateItem(item: TemplateItemRow) {
    setEditingTemplateItem(item)
    setTemplateItemForm({ name: item.name, description: item.description, price: item.price, isVegetarian: item.isVegetarian, category: item.category, allergens: item.allergens ?? [] })
    setTemplateItemImageUrl(item.imageUrl ?? '')
    setAddingTemplateCategory(false)
    setTemplateItemDialogOpen(true)
  }

  async function handleTemplateItemSave() {
    if (!templateItemForm.name.trim() || !editingTemplate) return
    if (editingTemplateItem) {
        const updated: TemplateItemRow = { ...editingTemplateItem, ...templateItemForm, imageUrl: templateItemImageUrl || null }
      setTemplateItems((prev) => prev.map((i) => i.id === editingTemplateItem.id ? updated : i))
      setTemplateItemDialogOpen(false)
      setTemplateIsDirty(true)
        toast.promise(updateTemplateItem(editingTemplateItem.id, { ...templateItemForm, imageUrl: templateItemImageUrl || null, allergens: templateItemForm.allergens ?? [] }), {
        loading: 'Saving...', success: 'Item updated', error: 'Failed to update',
      })
    } else {
      const tempId = `temp-${Date.now()}`
        const newItem: TemplateItemRow = { id: tempId, templateId: editingTemplate.id, ...templateItemForm, imageUrl: templateItemImageUrl || null, orderIndex: templateItems.length }
      setTemplateItems((prev) => [...prev, newItem])
      setTemplateItemDialogOpen(false)
      setTemplateIsDirty(true)
      try {
          const realId = await addTemplateItem(editingTemplate.id, { ...templateItemForm, imageUrl: templateItemImageUrl || null, allergens: templateItemForm.allergens ?? [] })
        setTemplateItems((prev) => prev.map((i) => i.id === tempId ? { ...i, id: realId } : i))
        toast.success('Item added')
      } catch {
        setTemplateItems((prev) => prev.filter((i) => i.id !== tempId))
        toast.error('Failed to add item')
      }
    }
  }

  function handleTemplateItemDelete() {
    if (!deleteTemplateItemId) return
    const id = deleteTemplateItemId
    setTemplateItems((prev) => prev.filter((i) => i.id !== id))
    setDeleteTemplateItemId(null)
    setTemplateIsDirty(true)
    toast.promise(removeTemplateItem(id), { loading: 'Removing...', success: 'Item removed', error: 'Failed to remove' })
  }

  async function handleTemplateItemImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setTemplateItemImageUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('itemId', editingTemplateItem?.id ?? crypto.randomUUID())
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setTemplateItemImageUrl(data.url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setTemplateItemImageUploading(false)
      e.target.value = ''
    }
  }

  function handleAddTemplateCategory() {
    const trimmed = newTemplateCategoryName.trim()
    if (!trimmed) return
    const id = trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (!categories.some((c) => c.id === id)) {
      setCategories((prev) => [...prev, { id, label: trimmed }])
      toast.promise(createMenuCategory(id, trimmed), { loading: 'Adding...', success: 'Category added', error: 'Failed' })
    }
    setTemplateItemForm((p) => ({ ...p, category: id }))
    setAddingTemplateCategory(false)
    setNewTemplateCategoryName('')
  }

  // ── Render ──
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Restaurant Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage restaurant details and menu templates</p>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="info">Restaurant Info</TabsTrigger>
          {restaurants.map((r) => (
            <TabsTrigger key={r.id} value={`menu-${r.id}`}>{r.name}</TabsTrigger>
          ))}
        </TabsList>

        {/* Restaurant Info Tab */}
        <TabsContent value="info" className="mt-4">
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((r) => (
                <Card key={r.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{r.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">{r.cuisine}</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => openEditRestaurant(r)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{r.openTime && r.closeTime ? `${r.openTime.slice(0, 5)} – ${r.closeTime.slice(0, 5)}` : r.openTime?.slice(0, 5) || r.closeTime?.slice(0, 5) || '—'}</span>
                    </div>
                    <div>
                      {r.reservation
                        ? <Badge variant="outline" className="text-xs">Reservation Required</Badge>
                        : <Badge variant="secondary" className="text-xs">Walk-in</Badge>}
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{r.description}</p>
                  </CardContent>
                </Card>
              ))}
              <button
                onClick={openAddRestaurant}
                className="rounded-lg border-2 border-dashed bg-muted/20 min-h-[180px] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Add Restaurant</span>
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Per-Restaurant Menu Tabs */}
        {restaurants.map((r) => (
          <TabsContent key={r.id} value={`menu-${r.id}`} className="mt-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold">Menu Templates</h2>
                <p className="text-sm text-muted-foreground">{r.name}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openSaveAsTemplate(r.id)}>
                  <Save className="h-4 w-4 mr-2" />Save Current as Template
                </Button>
                <Button size="sm" onClick={() => openAddTemplate(r.id)}>
                  <Plus className="h-4 w-4 mr-2" />Add Template
                </Button>
              </div>
            </div>

            {(templatesByRestaurant[r.id] ?? []).length === 0 ? (
              <div className="rounded-lg border border-dashed p-12 flex flex-col items-center gap-3 text-muted-foreground">
                <LayoutList className="h-10 w-10" />
                <p className="font-medium">No templates yet</p>
                <p className="text-sm text-center">Save the current menu as a template or create a new one.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => openAddTemplate(r.id)}>
                  <Plus className="h-4 w-4 mr-2" />Add your first template
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Actions</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="hidden sm:table-cell">Created</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(templatesByRestaurant[r.id] ?? []).map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8" title="Load as active menu"
                              disabled={loadingTemplateId === template.id}
                              onClick={() => openLoadConfirm(template.id, r.id)}
                            >
                              {loadingTemplateId === template.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Play className="h-3.5 w-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit template items" onClick={() => openTemplateEdit(template)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{template.itemCount} items</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {format(new Date(template.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                            disabled={deletingTemplateId === template.id}
                            onClick={() => setDeleteTemplateId(template.id)}
                          >
                            {deletingTemplateId === template.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* ── Restaurant Add/Edit Dialog ── */}
      <Dialog open={restaurantDialogOpen} onOpenChange={setRestaurantDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isAddMode ? 'Add Restaurant' : 'Edit Restaurant'}</DialogTitle>
          </DialogHeader>
          {restaurantForm && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={restaurantForm.name} onChange={(e) => setRestaurantForm((p) => p && { ...p, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cuisine Type</Label>
                <Input value={restaurantForm.cuisine} onChange={(e) => setRestaurantForm((p) => p && { ...p, cuisine: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Opening Hours</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={restaurantForm.openTime ?? ''}
                    onChange={(e) => setRestaurantForm((p) => p && { ...p, openTime: e.target.value || null })}
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                  />
                  <span className="text-muted-foreground text-sm shrink-0">–</span>
                  <input
                    type="time"
                    value={restaurantForm.closeTime ?? ''}
                    onChange={(e) => setRestaurantForm((p) => p && { ...p, closeTime: e.target.value || null })}
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={restaurantForm.description} onChange={(e) => setRestaurantForm((p) => p && { ...p, description: e.target.value })} rows={3} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="reservation" checked={restaurantForm.reservation}
                  onChange={(e) => setRestaurantForm((p) => p && { ...p, reservation: e.target.checked })}
                  className="h-4 w-4 rounded border" />
                <Label htmlFor="reservation" className="cursor-pointer">Reservation Required</Label>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
            {!isAddMode && restaurantForm && !PROTECTED_IDS.includes(restaurantForm.id) && (
              <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteRestaurantId(restaurantForm.id)}>
                Delete Restaurant
              </Button>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRestaurantDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleRestaurantSave} disabled={!restaurantForm?.name.trim()}>
                {isAddMode ? 'Create Restaurant' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Restaurant Confirm */}
      <AlertDialog open={!!confirmDeleteRestaurantId} onOpenChange={(open) => !open && setConfirmDeleteRestaurantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the restaurant and all its menu templates.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleRestaurantDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Current Menu as Template */}
      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Save Current Menu as Template</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Template Name</Label>
            <Input value={saveTemplateName} onChange={(e) => setSaveTemplateName(e.target.value)} placeholder="e.g. Summer Menu 2025"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAsTemplate() }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveTemplateOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAsTemplate} disabled={!saveTemplateName.trim() || saveTemplateLoading}>
              {saveTemplateLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save as Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Template */}
      <Dialog open={addTemplateOpen} onOpenChange={setAddTemplateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>New Template</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Template Name</Label>
            <Input value={addTemplateName} onChange={(e) => setAddTemplateName(e.target.value)} placeholder="e.g. Vegetarian Special"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddTemplate() }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTemplateOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTemplate} disabled={!addTemplateName.trim() || addTemplateLoading}>
              {addTemplateLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Template Confirm */}
      <AlertDialog open={loadConfirmOpen} onOpenChange={(open) => { if (!open) { setLoadConfirmOpen(false); setPendingLoad(null) } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load Template</AlertDialogTitle>
            <AlertDialogDescription>This will replace all current active menu items for this restaurant with the template&apos;s items. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoadTemplate}>Load Template</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Template Confirm */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this menu template and all its items.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteTemplate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Template Edit Dialog ── */}
      <Dialog
        open={templateEditOpen}
        onOpenChange={(open) => { if (!open) requestCloseTemplateEdit() }}
      >
        <DialogContent
          className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => {
            if (templateItemDialogOpen || deleteTemplateItemId) { e.preventDefault(); return }
            if (templateIsDirty) { e.preventDefault(); setUnsavedChangesAlertOpen(true) }
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
          </DialogHeader>

          {templateItemsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex flex-wrap gap-2">
                  <Button variant={templateCategoryFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTemplateCategoryFilter('all')}>
                    All ({templateItemCounts.all ?? 0})
                  </Button>
                  {categories.map((cat) => (
                    <Button key={cat.id} variant={templateCategoryFilter === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setTemplateCategoryFilter(cat.id)}>
                      {cat.label} ({templateItemCounts[cat.id] ?? 0})
                    </Button>
                  ))}
                </div>
                <Button size="sm" onClick={openAddTemplateItem}>
                  <Plus className="h-4 w-4 mr-2" />Add Item
                </Button>
              </div>

              {templateItems.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 flex flex-col items-center gap-2 text-muted-foreground">
                  <p className="text-sm">No items in this template yet.</p>
                  <Button variant="outline" size="sm" onClick={openAddTemplateItem}>
                    <Plus className="h-4 w-4 mr-2" />Add First Item
                  </Button>
                </div>
              ) : (
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
                      {filteredTemplateItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 shrink-0 rounded-md border overflow-hidden bg-muted flex items-center justify-center">
                                {item.imageUrl
                                  ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                  : <ImageOff className="h-3.5 w-3.5 text-muted-foreground" />}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium">{item.name}</span>
                                {item.isVegetarian && <Leaf className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {categories.find((c) => c.id === item.category)?.label ?? item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular-nums">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-sm max-w-xs truncate">{item.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTemplateItem(item)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTemplateItemId(item.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={requestCloseTemplateEdit}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Alert */}
      <AlertDialog open={unsavedChangesAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close template editor?</AlertDialogTitle>
            <AlertDialogDescription>You have made changes to this template. All changes are already saved to the database.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUnsavedChangesAlertOpen(false)}>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setUnsavedChangesAlertOpen(false); closeTemplateEdit() }}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Template Item Confirm */}
      <AlertDialog open={!!deleteTemplateItemId} onOpenChange={(open) => !open && setDeleteTemplateItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this item from the template.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleTemplateItemDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Template Item Add/Edit Dialog ── */}
      <Dialog open={templateItemDialogOpen} onOpenChange={setTemplateItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTemplateItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={templateItemForm.name} onChange={(e) => setTemplateItemForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Filet Mignon" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={templateItemForm.description} onChange={(e) => setTemplateItemForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" min="0" step="0.01" value={templateItemForm.price}
                  onChange={(e) => setTemplateItemForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                {addingTemplateCategory ? (
                  <div className="flex gap-2">
                    <Input autoFocus value={newTemplateCategoryName} onChange={(e) => setNewTemplateCategoryName(e.target.value)} placeholder="e.g. Beverages"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTemplateCategory() } }} />
                    <Button type="button" size="icon" variant="default" onClick={handleAddTemplateCategory} disabled={!newTemplateCategoryName.trim()}><Plus className="h-4 w-4" /></Button>
                    <Button type="button" size="icon" variant="ghost" onClick={() => { setAddingTemplateCategory(false); setNewTemplateCategoryName('') }}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <Select value={templateItemForm.category} onValueChange={(v) => {
                    if (v === '__add_new__') { setAddingTemplateCategory(true); setNewTemplateCategoryName('') }
                    else setTemplateItemForm((p) => ({ ...p, category: v }))
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
            <div className="space-y-2">
              <Label>Image</Label>
              <input ref={templateItemFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleTemplateItemImageUpload} />
              {templateItemImageUrl ? (
                <div className="relative group rounded-md overflow-hidden border h-40">
                  <img src={templateItemImageUrl} alt="Preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => templateItemFileInputRef.current?.click()} disabled={templateItemImageUploading}>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />Change
                    </Button>
                    <Button type="button" size="sm" variant="destructive" disabled={templateItemImageUploading} onClick={() => setTemplateItemImageUrl('')}>
                      <X className="h-3.5 w-3.5 mr-1.5" />Remove
                    </Button>
                  </div>
                  {templateItemImageUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <button type="button" onClick={() => templateItemFileInputRef.current?.click()} disabled={templateItemImageUploading}
                  className="w-full h-40 rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground disabled:opacity-50">
                  {templateItemImageUploading
                    ? <><Loader2 className="h-7 w-7 animate-spin" /><span className="text-sm">Uploading...</span></>
                    : <><Upload className="h-7 w-7" /><span className="text-sm font-medium">Click to upload image</span><span className="text-xs">PNG, JPG, WebP · max 4 MB</span></>}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ti-vegetarian" checked={templateItemForm.isVegetarian}
                onChange={(e) => setTemplateItemForm((p) => ({ ...p, isVegetarian: e.target.checked }))}
                className="h-4 w-4 rounded border" />
              <Label htmlFor="ti-vegetarian" className="cursor-pointer">Vegetarian</Label>
            </div>
            <div className="space-y-2">
              <Label>Allergens</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="text-left truncate">{(templateItemForm.allergens ?? []).length > 0 ? (templateItemForm.allergens ?? []).map(id => ALLERGENS.find(a=>a.id===id)?.label ?? id).join(', ') : 'Select allergens'}</span>
                    <span className="text-xs text-muted-foreground">{(templateItemForm.allergens ?? []).length} selected</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col max-h-48 overflow-auto">
                      {ALLERGENS.map((a) => {
                        const selected = (templateItemForm.allergens ?? []).includes(a.id)
                        return (
                          <label key={a.id} className="flex items-center gap-2">
                            <input type="checkbox" checked={selected}
                              onChange={() => setTemplateItemForm((p) => {
                                const s = new Set(p.allergens ?? [])
                                if (s.has(a.id)) s.delete(a.id)
                                else s.add(a.id)
                                return { ...p, allergens: Array.from(s) }
                              })}
                              className="h-4 w-4"
                            />
                            <span>{a.label}</span>
                          </label>
                        )
                      })}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setTemplateItemForm((p) => ({ ...p, allergens: [] }))}>Clear</Button>
                      <Button size="sm" onClick={() => { /* popover will close automatically on outside click */ }}>Done</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleTemplateItemSave} disabled={!templateItemForm.name.trim()}>
              {editingTemplateItem ? 'Save Changes' : 'Add to Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
