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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Clock, X, Loader2, Play, Save, LayoutList } from "lucide-react"
import {
  createBar, updateBar, deleteBar,
  createBarMenuItem, updateBarMenuItem, deleteBarMenuItem, createBarMenuCategory,
} from "@/lib/actions/bars"
import {
  createBarMenuTemplate, saveCurrentBarMenuAsTemplate, loadBarMenuTemplate,
  deleteBarMenuTemplate, getBarTemplateItems, addBarTemplateItem, updateBarTemplateItem, removeBarTemplateItem,
} from "@/lib/actions/bar-menu-templates"

type BarRow = {
  id: string; name: string; description: string; highlights: string; image: string
  openTime: string | null; closeTime: string | null; orderIndex: number
}
type ItemRow = {
  id: string; barId: string; name: string; description: string
  priceText: string; category: string; orderIndex: number
}
type TemplateRow = {
  id: string; name: string; barId: string; createdAt: Date | string; itemCount: number
}
type TemplateItemRow = {
  id: string; templateId: string; name: string; description: string
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
  initialTemplatesByBar,
}: {
  initialBars: BarRow[]
  initialItems: ItemRow[]
  initialCategories: Category[]
  initialTemplatesByBar: Record<string, TemplateRow[]>
}) {
  const [bars, setBars] = useState<BarRow[]>(initialBars)
  const [items, setItems] = useState<ItemRow[]>(initialItems)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [templatesByBar, setTemplatesByBar] = useState<Record<string, TemplateRow[]>>(initialTemplatesByBar)
  const [mainTab, setMainTab] = useState("info")

  // Bar dialog
  const [barDialogOpen, setBarDialogOpen] = useState(false)
  const [isAddMode, setIsAddMode] = useState(false)
  const [barForm, setBarForm] = useState<BarRow | null>(null)
  const [confirmDeleteBarId, setConfirmDeleteBarId] = useState<string | null>(null)

  // Save/Add template dialogs
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [saveTemplateBarId, setSaveTemplateBarId] = useState('')
  const [saveTemplateName, setSaveTemplateName] = useState('')
  const [saveTemplateLoading, setSaveTemplateLoading] = useState(false)
  const [addTemplateOpen, setAddTemplateOpen] = useState(false)
  const [addTemplateBarId, setAddTemplateBarId] = useState('')
  const [addTemplateName, setAddTemplateName] = useState('')
  const [addTemplateLoading, setAddTemplateLoading] = useState(false)

  // Load/Delete template
  const [loadConfirmOpen, setLoadConfirmOpen] = useState(false)
  const [pendingLoad, setPendingLoad] = useState<{ templateId: string; barId: string } | null>(null)
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
  const [templateItemForm, setTemplateItemForm] = useState<ItemForm>(EMPTY_ITEM)
  const [addingTemplateCategory, setAddingTemplateCategory] = useState(false)
  const [newTemplateCategoryName, setNewTemplateCategoryName] = useState('')
  const [deleteTemplateItemId, setDeleteTemplateItemId] = useState<string | null>(null)

  const itemsByBar = useMemo(() => {
    const map: Record<string, ItemRow[]> = {}
    for (const item of items) (map[item.barId] ??= []).push(item)
    return map
  }, [items])

  const activeItemCountByBar = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      counts[item.barId] = (counts[item.barId] ?? 0) + 1
    }
    return counts
  }, [items])

  const filteredTemplateItems = useMemo(
    () => templateCategoryFilter === 'all' ? templateItems : templateItems.filter((i) => i.category === templateCategoryFilter),
    [templateItems, templateCategoryFilter]
  )
  const templateItemCounts = useMemo(() => {
    const c: Record<string, number> = { all: templateItems.length }
    templateItems.forEach((i) => { c[i.category] = (c[i.category] || 0) + 1 })
    return c
  }, [templateItems])

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
      setTemplatesByBar((prev) => ({ ...prev, [newBar.id]: [] }))
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
    setTemplatesByBar((prev) => { const n = { ...prev }; delete n[id]; return n })
    toast.promise(deleteBar(id), { loading: 'Deleting...', success: 'Bar deleted', error: 'Failed to delete' })
  }

  // ── Template list handlers ──
  function openSaveAsTemplate(barId: string) {
    setSaveTemplateBarId(barId)
    setSaveTemplateName('')
    setSaveTemplateOpen(true)
  }

  async function handleSaveAsTemplate() {
    if (!saveTemplateName.trim()) return
    setSaveTemplateLoading(true)
    try {
      const id = await saveCurrentBarMenuAsTemplate(saveTemplateBarId, saveTemplateName.trim())
      const newT: TemplateRow = { id, name: saveTemplateName.trim(), barId: saveTemplateBarId, createdAt: new Date(), itemCount: activeItemCountByBar[saveTemplateBarId] ?? 0 }
      setTemplatesByBar((prev) => ({ ...prev, [saveTemplateBarId]: [...(prev[saveTemplateBarId] ?? []), newT] }))
      setSaveTemplateOpen(false)
      toast.success('Template saved')
    } catch {
      toast.error('Failed to save template')
    } finally {
      setSaveTemplateLoading(false)
    }
  }

  function openAddTemplate(barId: string) {
    setAddTemplateBarId(barId)
    setAddTemplateName('')
    setAddTemplateOpen(true)
  }

  async function handleAddTemplate() {
    if (!addTemplateName.trim()) return
    setAddTemplateLoading(true)
    try {
      const id = await createBarMenuTemplate(addTemplateBarId, addTemplateName.trim())
      const newT: TemplateRow = { id, name: addTemplateName.trim(), barId: addTemplateBarId, createdAt: new Date(), itemCount: 0 }
      setTemplatesByBar((prev) => ({ ...prev, [addTemplateBarId]: [...(prev[addTemplateBarId] ?? []), newT] }))
      setAddTemplateOpen(false)
      toast.success('Template created')
    } catch {
      toast.error('Failed to create template')
    } finally {
      setAddTemplateLoading(false)
    }
  }

  function openLoadConfirm(templateId: string, barId: string) {
    setPendingLoad({ templateId, barId })
    setLoadConfirmOpen(true)
  }

  async function handleLoadTemplate() {
    if (!pendingLoad) return
    const { templateId, barId } = pendingLoad
    setLoadingTemplateId(templateId)
    setLoadConfirmOpen(false)
    try {
      await loadBarMenuTemplate(templateId, barId)
      // Reload page to refresh live items
      window.location.reload()
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
      await deleteBarMenuTemplate(id)
      setTemplatesByBar((prev) => {
        const updated = { ...prev }
        for (const bid of Object.keys(updated)) updated[bid] = updated[bid].filter((t) => t.id !== id)
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
      const fetched = await getBarTemplateItems(template.id)
      setTemplateItems(fetched)
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
      setTemplatesByBar((prev) => ({
        ...prev,
        [editingTemplate.barId]: (prev[editingTemplate.barId] ?? []).map((t) =>
          t.id === editingTemplate.id ? { ...t, itemCount: templateItems.length } : t
        ),
      }))
    }
    setTemplateIsDirty(false)
    setTemplateEditOpen(false)
  }

  function openAddTemplateItem() {
    setEditingTemplateItem(null)
    setTemplateItemForm({ ...EMPTY_ITEM, category: categories[0]?.id ?? '' })
    setAddingTemplateCategory(false)
    setTemplateItemDialogOpen(true)
  }

  function openEditTemplateItem(item: TemplateItemRow) {
    setEditingTemplateItem(item)
    setTemplateItemForm({ name: item.name, description: item.description, priceText: item.priceText, category: item.category })
    setAddingTemplateCategory(false)
    setTemplateItemDialogOpen(true)
  }

  async function handleTemplateItemSave() {
    if (!templateItemForm.name.trim() || !editingTemplate) return
    if (editingTemplateItem) {
      const updated: TemplateItemRow = { ...editingTemplateItem, ...templateItemForm }
      setTemplateItems((prev) => prev.map((i) => i.id === editingTemplateItem.id ? updated : i))
      setTemplateItemDialogOpen(false)
      setTemplateIsDirty(true)
      toast.promise(updateBarTemplateItem(editingTemplateItem.id, templateItemForm), {
        loading: 'Saving...', success: 'Item updated', error: 'Failed to update',
      })
    } else {
      const tempId = `temp-${Date.now()}`
      const newItem: TemplateItemRow = { id: tempId, templateId: editingTemplate.id, ...templateItemForm, orderIndex: templateItems.length }
      setTemplateItems((prev) => [...prev, newItem])
      setTemplateItemDialogOpen(false)
      setTemplateIsDirty(true)
      try {
        const realId = await addBarTemplateItem(editingTemplate.id, templateItemForm)
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
    toast.promise(removeBarTemplateItem(id), { loading: 'Removing...', success: 'Item removed', error: 'Failed to remove' })
  }

  function handleAddTemplateCategory() {
    const trimmed = newTemplateCategoryName.trim()
    if (!trimmed) return
    const id = slugify(trimmed)
    if (!categories.some((c) => c.id === id)) {
      setCategories((prev) => [...prev, { id, label: trimmed }])
      toast.promise(createBarMenuCategory(id, trimmed), { loading: 'Adding...', success: 'Category added', error: 'Failed' })
    }
    setTemplateItemForm((p) => ({ ...p, category: id }))
    setAddingTemplateCategory(false)
    setNewTemplateCategoryName('')
  }

  // ── Render ──
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bar Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage bar details and drink menu templates</p>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
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
                    <p className="text-muted-foreground text-xs">{(itemsByBar[bar.id] ?? []).length} menu items · {(templatesByBar[bar.id] ?? []).length} templates</p>
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

        {/* Per-Bar Template Tabs */}
        {bars.map((bar) => (
          <TabsContent key={bar.id} value={`menu-${bar.id}`} className="mt-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold">Menu Templates</h2>
                <p className="text-sm text-muted-foreground">{bar.name}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openSaveAsTemplate(bar.id)}>
                  <Save className="h-4 w-4 mr-2" />Save Current as Template
                </Button>
                <Button size="sm" onClick={() => openAddTemplate(bar.id)}>
                  <Plus className="h-4 w-4 mr-2" />Add Template
                </Button>
              </div>
            </div>

            {(templatesByBar[bar.id] ?? []).length === 0 ? (
              <div className="rounded-lg border border-dashed p-12 flex flex-col items-center gap-3 text-muted-foreground">
                <LayoutList className="h-10 w-10" />
                <p className="font-medium">No templates yet</p>
                <p className="text-sm text-center">Save the current menu as a template or create a new one.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => openAddTemplate(bar.id)}>
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
                    {(templatesByBar[bar.id] ?? []).map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8" title="Load as active menu"
                              disabled={loadingTemplateId === template.id}
                              onClick={() => openLoadConfirm(template.id, bar.id)}
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
            <AlertDialogDescription>This will permanently delete the bar, all its menu items, and all its templates.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleBarDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Current Menu as Template */}
      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Save Current Menu as Template</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Template Name</Label>
            <Input value={saveTemplateName} onChange={(e) => setSaveTemplateName(e.target.value)} placeholder="e.g. Summer Cocktails 2025"
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
            <Input value={addTemplateName} onChange={(e) => setAddTemplateName(e.target.value)} placeholder="e.g. Winter Menu"
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
            <AlertDialogDescription>This will replace all current active menu items for this bar with the template&apos;s items. This action cannot be undone.</AlertDialogDescription>
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
                <div className="flex flex-wrap gap-2 min-w-0">
                  <Button variant={templateCategoryFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTemplateCategoryFilter('all')}>
                    All ({templateItemCounts.all ?? 0})
                  </Button>
                  {categories.map((cat) => (
                    templateItemCounts[cat.id] ? (
                      <Button key={cat.id} variant={templateCategoryFilter === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setTemplateCategoryFilter(cat.id)}>
                        {cat.label} ({templateItemCounts[cat.id] ?? 0})
                      </Button>
                    ) : null
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
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {categories.find((c) => c.id === item.category)?.label ?? item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular-nums">{item.priceText || <span className="text-muted-foreground">—</span>}</TableCell>
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
              <Input value={templateItemForm.name} onChange={(e) => setTemplateItemForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Mojito" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={templateItemForm.description} onChange={(e) => setTemplateItemForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (empty = included)</Label>
                <Input value={templateItemForm.priceText} placeholder="e.g. 8€ or Bottle 190€"
                  onChange={(e) => setTemplateItemForm((p) => ({ ...p, priceText: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                {addingTemplateCategory ? (
                  <div className="flex gap-2">
                    <Input autoFocus value={newTemplateCategoryName} onChange={(e) => setNewTemplateCategoryName(e.target.value)} placeholder="e.g. Cocktails"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTemplateCategory() } }} />
                    <Button type="button" size="icon" variant="default" onClick={handleAddTemplateCategory} disabled={!newTemplateCategoryName.trim()}><Plus className="h-4 w-4" /></Button>
                    <Button type="button" size="icon" variant="ghost" onClick={() => { setAddingTemplateCategory(false); setNewTemplateCategoryName('') }}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <Select value={templateItemForm.category} onValueChange={(v) => {
                    if (v === '__add_new__') { setAddingTemplateCategory(true); setNewTemplateCategoryName('') }
                    else setTemplateItemForm((p) => ({ ...p, category: v }))
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
            <Button variant="outline" onClick={() => setTemplateItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleTemplateItemSave} disabled={!templateItemForm.name.trim() || !templateItemForm.category}>
              {editingTemplateItem ? 'Save Changes' : 'Add to Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
