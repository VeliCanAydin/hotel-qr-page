"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
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
import { Plus, Pencil, Trash2, LayoutList, CalendarDays } from "lucide-react"
import {
  createKidsService, updateKidsService, deleteKidsService,
  createKidsServiceItem, updateKidsServiceItem, deleteKidsServiceItem,
} from "@/lib/actions/kids-services"
import {
  createKidsActivity, updateKidsActivity, deleteKidsActivity,
} from "@/lib/actions/kids-activities"

type KidsService = { id: string; title: string; description: string; image: string; imageAlt: string; orderIndex: number }
type KidsServiceItem = { id: string; serviceId: string; trigger: string; content: string; orderIndex: number }
type ActivityWithId = { id: number; time: string; event: string }
type DaySchedule = { day: string; activities: ActivityWithId[] }

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const EMPTY_SERVICE: KidsService = { id: '', title: '', description: '', image: '', imageAlt: '', orderIndex: 0 }

export default function KidsCareClient({
  initialServices,
  initialItemsByService,
  initialScheduleByService,
}: {
  initialServices: KidsService[]
  initialItemsByService: Record<string, KidsServiceItem[]>
  initialScheduleByService: Record<string, DaySchedule[]>
}) {
  const [services, setServices] = useState<KidsService[]>(initialServices)
  const [itemsByService, setItemsByService] = useState<Record<string, KidsServiceItem[]>>(initialItemsByService)
  const [scheduleByService, setScheduleByService] = useState<Record<string, DaySchedule[]>>(initialScheduleByService)
  const [mainTab, setMainTab] = useState("info")

  // ── Service dialog ──
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [isAddMode, setIsAddMode] = useState(false)
  const [serviceForm, setServiceForm] = useState<KidsService>(EMPTY_SERVICE)
  const [confirmDeleteServiceId, setConfirmDeleteServiceId] = useState<string | null>(null)

  // ── Accordion item dialog ──
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KidsServiceItem | null>(null)
  const [itemForm, setItemForm] = useState<Pick<KidsServiceItem, 'trigger' | 'content'>>({ trigger: '', content: '' })
  const [activeServiceId, setActiveServiceId] = useState('')
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  // ── Schedule dialog ──
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [scheduleServiceId, setScheduleServiceId] = useState('')
  const [scheduleActiveDay, setScheduleActiveDay] = useState('Monday')

  // ── Activity dialog (nested inside schedule dialog) ──
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityWithId | null>(null)
  const [activityForm, setActivityForm] = useState<{ time: string; event: string }>({ time: '10:00', event: '' })
  const [deleteActivityId, setDeleteActivityId] = useState<number | null>(null)

  const scheduleService = useMemo(
    () => services.find((s) => s.id === scheduleServiceId),
    [services, scheduleServiceId]
  )
  const currentDaySchedule = useMemo(
    () => scheduleByService[scheduleServiceId]?.find((d) => d.day === scheduleActiveDay),
    [scheduleByService, scheduleServiceId, scheduleActiveDay]
  )

  function totalActivities(serviceId: string) {
    return scheduleByService[serviceId]?.reduce((sum, d) => sum + d.activities.length, 0) ?? 0
  }

  // ── Service handlers ──
  function openAddService() {
    setIsAddMode(true)
    setServiceForm({ ...EMPTY_SERVICE, orderIndex: services.length })
    setServiceDialogOpen(true)
  }

  function openEditService(s: KidsService) {
    setIsAddMode(false)
    setServiceForm({ ...s })
    setServiceDialogOpen(true)
  }

  function handleServiceSave() {
    if (!serviceForm.title.trim()) return
    if (isAddMode) {
      const id = serviceForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const newS = { ...serviceForm, id }
      setServices((prev) => [...prev, newS])
      setItemsByService((prev) => ({ ...prev, [id]: [] }))
      setScheduleByService((prev) => ({ ...prev, [id]: DAYS.map((day) => ({ day, activities: [] })) }))
      setServiceDialogOpen(false)
      toast.promise(createKidsService(newS), { loading: 'Creating...', success: 'Service created', error: 'Failed to create' })
    } else {
      setServices((prev) => prev.map((s) => s.id === serviceForm.id ? serviceForm : s))
      setServiceDialogOpen(false)
      const { id, ...data } = serviceForm
      toast.promise(updateKidsService(id, data), { loading: 'Saving...', success: 'Service updated', error: 'Failed to save' })
    }
  }

  function handleServiceDelete() {
    if (!confirmDeleteServiceId) return
    const id = confirmDeleteServiceId
    setConfirmDeleteServiceId(null)
    setServiceDialogOpen(false)
    setServices((prev) => prev.filter((s) => s.id !== id))
    setItemsByService((prev) => { const n = { ...prev }; delete n[id]; return n })
    setScheduleByService((prev) => { const n = { ...prev }; delete n[id]; return n })
    if (mainTab === `service-${id}`) setMainTab('info')
    toast.promise(deleteKidsService(id), { loading: 'Deleting...', success: 'Service deleted', error: 'Failed to delete' })
  }

  // ── Accordion item handlers ──
  function openAddItem(serviceId: string) {
    setActiveServiceId(serviceId)
    setEditingItem(null)
    setItemForm({ trigger: '', content: '' })
    setItemDialogOpen(true)
  }

  function openEditItem(item: KidsServiceItem) {
    setActiveServiceId(item.serviceId)
    setEditingItem(item)
    setItemForm({ trigger: item.trigger, content: item.content })
    setItemDialogOpen(true)
  }

  async function handleItemSave() {
    if (!itemForm.trigger.trim()) return
    if (editingItem) {
      const updated = { ...editingItem, ...itemForm }
      setItemsByService((prev) => ({
        ...prev,
        [editingItem.serviceId]: (prev[editingItem.serviceId] ?? []).map((i) => i.id === editingItem.id ? updated : i),
      }))
      setItemDialogOpen(false)
      toast.promise(updateKidsServiceItem(editingItem.id, itemForm.trigger, itemForm.content), {
        loading: 'Saving...', success: 'Item updated', error: 'Failed to update',
      })
    } else {
      const orderIndex = (itemsByService[activeServiceId] ?? []).length
      const tempId = `temp-${Date.now()}`
      const newItem: KidsServiceItem = { id: tempId, serviceId: activeServiceId, ...itemForm, orderIndex }
      setItemsByService((prev) => ({ ...prev, [activeServiceId]: [...(prev[activeServiceId] ?? []), newItem] }))
      setItemDialogOpen(false)
      try {
        const realId = await createKidsServiceItem(activeServiceId, itemForm.trigger, itemForm.content, orderIndex)
        setItemsByService((prev) => ({
          ...prev,
          [activeServiceId]: (prev[activeServiceId] ?? []).map((i) => i.id === tempId ? { ...i, id: realId } : i),
        }))
        toast.success('Item added')
      } catch {
        setItemsByService((prev) => ({
          ...prev,
          [activeServiceId]: (prev[activeServiceId] ?? []).filter((i) => i.id !== tempId),
        }))
        toast.error('Failed to add item')
      }
    }
  }

  function handleItemDelete() {
    if (!deleteItemId) return
    const id = deleteItemId
    setDeleteItemId(null)
    const serviceId = Object.keys(itemsByService).find((sid) => itemsByService[sid].some((i) => i.id === id))
    if (!serviceId) return
    setItemsByService((prev) => ({ ...prev, [serviceId]: (prev[serviceId] ?? []).filter((i) => i.id !== id) }))
    toast.promise(deleteKidsServiceItem(id), { loading: 'Removing...', success: 'Item removed', error: 'Failed to remove' })
  }

  // ── Schedule dialog handlers ──
  function openScheduleDialog(serviceId: string) {
    setScheduleServiceId(serviceId)
    setScheduleActiveDay('Monday')
    setScheduleDialogOpen(true)
  }

  // ── Activity handlers (inside schedule dialog) ──
  function openAddActivity() {
    setEditingActivity(null)
    setActivityForm({ time: '10:00', event: '' })
    setActivityDialogOpen(true)
  }

  function openEditActivity(activity: ActivityWithId) {
    setEditingActivity(activity)
    setActivityForm({ time: activity.time, event: activity.event })
    setActivityDialogOpen(true)
  }

  async function handleActivitySave() {
    if (!activityForm.event.trim() || !activityForm.time) return
    if (editingActivity) {
      setScheduleByService((prev) => ({
        ...prev,
        [scheduleServiceId]: (prev[scheduleServiceId] ?? []).map((d) =>
          d.day !== scheduleActiveDay ? d : {
            ...d,
            activities: d.activities.map((a) =>
              a.id === editingActivity.id ? { ...a, ...activityForm } : a
            ),
          }
        ),
      }))
      setActivityDialogOpen(false)
      toast.promise(updateKidsActivity(editingActivity.id, activityForm.time, activityForm.event), {
        loading: 'Saving...', success: 'Activity updated', error: 'Failed to update',
      })
    } else {
      const dayActivities = currentDaySchedule?.activities ?? []
      if (dayActivities.some((a) => a.time === activityForm.time)) {
        toast.error('An activity already exists at this time')
        return
      }
      const orderIndex = dayActivities.length
      const tempId = -Date.now()
      const newActivity: ActivityWithId = { id: tempId, ...activityForm }
      setScheduleByService((prev) => ({
        ...prev,
        [scheduleServiceId]: (prev[scheduleServiceId] ?? []).map((d) =>
          d.day !== scheduleActiveDay ? d : {
            ...d,
            activities: [...d.activities, newActivity].sort((a, b) => a.time.localeCompare(b.time)),
          }
        ),
      }))
      setActivityDialogOpen(false)
      try {
        const realId = await createKidsActivity(scheduleServiceId, scheduleActiveDay, activityForm.time, activityForm.event, orderIndex)
        setScheduleByService((prev) => ({
          ...prev,
          [scheduleServiceId]: (prev[scheduleServiceId] ?? []).map((d) =>
            d.day !== scheduleActiveDay ? d : {
              ...d,
              activities: d.activities.map((a) => a.id === tempId ? { ...a, id: realId } : a),
            }
          ),
        }))
        toast.success('Activity added')
      } catch {
        setScheduleByService((prev) => ({
          ...prev,
          [scheduleServiceId]: (prev[scheduleServiceId] ?? []).map((d) =>
            d.day !== scheduleActiveDay ? d : {
              ...d,
              activities: d.activities.filter((a) => a.id !== tempId),
            }
          ),
        }))
        toast.error('Failed to add activity')
      }
    }
  }

  function handleActivityDelete() {
    if (deleteActivityId === null) return
    const id = deleteActivityId
    setDeleteActivityId(null)
    setScheduleByService((prev) => ({
      ...prev,
      [scheduleServiceId]: (prev[scheduleServiceId] ?? []).map((d) =>
        d.day !== scheduleActiveDay ? d : {
          ...d,
          activities: d.activities.filter((a) => a.id !== id),
        }
      ),
    }))
    toast.promise(deleteKidsActivity(id), { loading: 'Removing...', success: 'Activity removed', error: 'Failed to remove' })
  }

  // ── Render ──
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Kids Care Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage kids care services, accordion items, and activity schedules</p>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="info">Services Info</TabsTrigger>
          {services.map((s) => (
            <TabsTrigger key={s.id} value={`service-${s.id}`}>{s.title}</TabsTrigger>
          ))}
        </TabsList>

        {/* Services Info Tab */}
        <TabsContent value="info" className="mt-4">
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <Card key={s.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{s.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">{s.image || 'No image set'}</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => openEditService(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{s.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {(itemsByService[s.id] ?? []).length} accordion items
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {totalActivities(s.id)} activities
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <button
                onClick={openAddService}
                className="rounded-lg border-2 border-dashed bg-muted/20 min-h-[180px] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Add Service</span>
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Per-Service Tabs */}
        {services.map((s) => (
          <TabsContent key={s.id} value={`service-${s.id}`} className="mt-4 space-y-6">

            {/* Accordion Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-lg font-semibold">Accordion Items</h2>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                </div>
                <Button size="sm" onClick={() => openAddItem(s.id)}>
                  <Plus className="h-4 w-4 mr-2" />Add Item
                </Button>
              </div>

              {(itemsByService[s.id] ?? []).length === 0 ? (
                <div className="rounded-lg border border-dashed p-10 flex flex-col items-center gap-3 text-muted-foreground">
                  <LayoutList className="h-10 w-10" />
                  <p className="font-medium">No items yet</p>
                  <p className="text-sm text-center">Add accordion items to display in this service card.</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => openAddItem(s.id)}>
                    <Plus className="h-4 w-4 mr-2" />Add first item
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead className="w-20 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(itemsByService[s.id] ?? []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.trigger}</TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{item.content}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditItem(item)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteItemId(item.id)}
                              >
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
            </div>

            {/* Schedule Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-lg font-semibold">Schedule</h2>
                  <p className="text-sm text-muted-foreground">
                    {totalActivities(s.id)} activities across the week
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openScheduleDialog(s.id)}>
                  <CalendarDays className="h-4 w-4 mr-2" />Edit Schedule
                </Button>
              </div>

              {totalActivities(s.id) === 0 ? (
                <div className="rounded-lg border border-dashed p-10 flex flex-col items-center gap-3 text-muted-foreground">
                  <CalendarDays className="h-10 w-10" />
                  <p className="font-medium">No schedule yet</p>
                  <p className="text-sm text-center">Add weekly activities for this service.</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => openScheduleDialog(s.id)}>
                    <Plus className="h-4 w-4 mr-2" />Add activities
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day) => {
                    const count = scheduleByService[s.id]?.find((d) => d.day === day)?.activities.length ?? 0
                    return (
                      <button
                        key={day}
                        onClick={() => { openScheduleDialog(s.id); setScheduleActiveDay(day) }}
                        className="rounded-md border p-2 text-center hover:bg-muted/50 transition-colors"
                      >
                        <p className="text-xs font-medium">{day.slice(0, 3)}</p>
                        <p className="text-lg font-semibold tabular-nums">{count}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

          </TabsContent>
        ))}
      </Tabs>

      {/* ── Service Add/Edit Dialog ── */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isAddMode ? 'Add Service' : 'Edit Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={serviceForm.title} onChange={(e) => setServiceForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={serviceForm.description} onChange={(e) => setServiceForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Image Path</Label>
              <Input value={serviceForm.image} onChange={(e) => setServiceForm((p) => ({ ...p, image: e.target.value }))} placeholder="/kids-club.png" />
            </div>
            <div className="space-y-2">
              <Label>Image Alt</Label>
              <Input value={serviceForm.imageAlt} onChange={(e) => setServiceForm((p) => ({ ...p, imageAlt: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
            {!isAddMode && (
              <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteServiceId(serviceForm.id)}>
                Delete Service
              </Button>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleServiceSave} disabled={!serviceForm.title.trim()}>
                {isAddMode ? 'Create Service' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Service Confirm */}
      <AlertDialog open={!!confirmDeleteServiceId} onOpenChange={(open) => !open && setConfirmDeleteServiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the service, all its accordion items, and its schedule.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleServiceDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Accordion Item Add/Edit Dialog ── */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Trigger</Label>
              <Input value={itemForm.trigger} onChange={(e) => setItemForm((p) => ({ ...p, trigger: e.target.value }))} placeholder="e.g. Operating Hours & Location" />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={itemForm.content} onChange={(e) => setItemForm((p) => ({ ...p, content: e.target.value }))} rows={4} placeholder="e.g. Open from 10:30 to 23:30" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleItemSave} disabled={!itemForm.trigger.trim()}>
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirm */}
      <AlertDialog open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this accordion item.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleItemDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Schedule Dialog ── */}
      <Dialog
        open={scheduleDialogOpen}
        onOpenChange={(open) => { if (!open) setScheduleDialogOpen(false) }}
      >
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => {
            if (activityDialogOpen || deleteActivityId !== null) e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Schedule — {scheduleService?.title}</DialogTitle>
          </DialogHeader>

          <Tabs value={scheduleActiveDay} onValueChange={setScheduleActiveDay}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <TabsList className="flex-wrap h-auto gap-1">
                {DAYS.map((day) => {
                  const count = scheduleByService[scheduleServiceId]?.find((d) => d.day === day)?.activities.length ?? 0
                  return (
                    <TabsTrigger key={day} value={day} className="gap-1.5">
                      {day.slice(0, 3)}
                      <Badge variant="secondary" className="text-xs h-4 px-1">{count}</Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              <Button size="sm" onClick={openAddActivity}>
                <Plus className="h-4 w-4 mr-2" />Add Activity
              </Button>
            </div>

            {DAYS.map((day) => (
              <TabsContent key={day} value={day} className="mt-4">
                {(() => {
                  const activities = scheduleByService[scheduleServiceId]?.find((d) => d.day === day)?.activities ?? []
                  return activities.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 flex flex-col items-center gap-2 text-muted-foreground">
                      <p className="text-sm">No activities on {day}.</p>
                      <Button variant="outline" size="sm" onClick={openAddActivity}>
                        <Plus className="h-4 w-4 mr-2" />Add Activity
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Time</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead className="w-[90px] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activities.map((activity) => (
                            <TableRow key={activity.id}>
                              <TableCell className="font-mono text-sm font-medium tabular-nums">{activity.time}</TableCell>
                              <TableCell>
                                {activity.event === 'Closed'
                                  ? <Badge variant="outline" className="text-muted-foreground">Closed</Badge>
                                  : activity.event}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditActivity(activity)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteActivityId(activity.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
                })()}
              </TabsContent>
            ))}
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Activity Add/Edit Dialog (nested) ── */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingActivity ? 'Edit Activity' : `Add Activity — ${scheduleActiveDay}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="act-time">Time</Label>
              <Input id="act-time" type="time" value={activityForm.time}
                onChange={(e) => setActivityForm((p) => ({ ...p, time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="act-event">Activity Name</Label>
              <Input id="act-event" value={activityForm.event}
                onChange={(e) => setActivityForm((p) => ({ ...p, event: e.target.value }))}
                placeholder="e.g. Pool Game"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleActivitySave} disabled={!activityForm.event.trim() || !activityForm.time}>
              {editingActivity ? 'Save Changes' : 'Add Activity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Activity Confirm */}
      <AlertDialog open={deleteActivityId !== null} onOpenChange={(open) => !open && setDeleteActivityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this activity from {scheduleActiveDay}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActivityDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
