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
import { Plus, Pencil, Trash2, Leaf, Clock } from "lucide-react"
import { type MenuItem, categories } from "@/lib/data/aLaCarteMenu"
import { createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/actions/menu-items"

type MenuCategory = MenuItem["category"]

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  appetizers: "Appetizers",
  "soups-salads": "Soups & Salads",
  "main-courses": "Main Courses",
  sides: "Sides",
  desserts: "Desserts",
}

const RESTAURANTS = [
  {
    id: "a-la-carte",
    name: "A-La-Carte Restaurant",
    cuisine: "Mediterranean & Turkish",
    hours: "18:00 – 22:00",
    reservation: true,
    description: "Fine dining experience with premium Mediterranean and Turkish cuisine. Chef's signature dishes made with fresh, local ingredients.",
  },
  {
    id: "main-restaurant",
    name: "Main Restaurant",
    cuisine: "International Buffet",
    hours: "07:00–10:00 · 12:30–14:00 · 19:00–21:00",
    reservation: false,
    description: "Our main buffet restaurant offering an extensive selection of international cuisine for breakfast, lunch and dinner.",
  },
  {
    id: "snack-restaurant",
    name: "Snack Restaurant",
    cuisine: "Fast Food & Snacks",
    hours: "11:00 – 17:00",
    reservation: false,
    description: "Casual poolside dining with light bites, snacks, salads, and refreshing drinks.",
  },
]

type RestaurantData = (typeof RESTAURANTS)[number]

const EMPTY_MENU_FORM: Omit<MenuItem, "id"> = {
  name: "", description: "", price: 0, image: "", isVegetarian: false, category: "appetizers",
}

export default function RestaurantClient({ initialMenuData }: { initialMenuData: MenuItem[] }) {
  const [menuData, setMenuData] = useState<MenuItem[]>(initialMenuData)
  const [restaurants, setRestaurants] = useState<RestaurantData[]>(RESTAURANTS)
  const [mainTab, setMainTab] = useState("info")
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<MenuCategory | "all">("all")
  const [menuDialogOpen, setMenuDialogOpen] = useState(false)
  const [menuDeleteId, setMenuDeleteId] = useState<string | null>(null)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [menuForm, setMenuForm] = useState<Omit<MenuItem, "id">>(EMPTY_MENU_FORM)
  const [restaurantDialogOpen, setRestaurantDialogOpen] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantData | null>(null)
  const [restaurantForm, setRestaurantForm] = useState<RestaurantData | null>(null)

  const filteredMenu = useMemo(
    () => menuCategoryFilter === "all" ? menuData : menuData.filter((i) => i.category === menuCategoryFilter),
    [menuData, menuCategoryFilter]
  )

  const menuCounts = useMemo(() => {
    const c: Record<string, number> = { all: menuData.length }
    menuData.forEach((i) => { c[i.category] = (c[i.category] || 0) + 1 })
    return c
  }, [menuData])

  function openAddMenu() {
    setEditingMenuItem(null)
    setMenuForm(EMPTY_MENU_FORM)
    setMenuDialogOpen(true)
  }

  function openEditMenu(item: MenuItem) {
    setEditingMenuItem(item)
    setMenuForm({ name: item.name, description: item.description, price: item.price, image: item.image, isVegetarian: item.isVegetarian ?? false, category: item.category })
    setMenuDialogOpen(true)
  }

  function handleMenuSave() {
    if (!menuForm.name.trim()) return
    if (editingMenuItem) {
      const updated = { ...editingMenuItem, ...menuForm }
      setMenuData((prev) => prev.map((i) => (i.id === editingMenuItem.id ? updated : i)))
      setMenuDialogOpen(false)
      toast.promise(updateMenuItem(editingMenuItem.id, menuForm), {
        loading: "Saving...", success: "Menu item updated", error: "Failed to update",
      })
    } else {
      const newItem: MenuItem = { id: crypto.randomUUID(), ...menuForm }
      setMenuData((prev) => [...prev, newItem])
      setMenuDialogOpen(false)
      toast.promise(createMenuItem(newItem), {
        loading: "Saving...", success: "Menu item added", error: "Failed to add",
      })
    }
  }

  function handleMenuDelete() {
    if (!menuDeleteId) return
    const id = menuDeleteId
    const item = menuData.find((i) => i.id === id)
    setMenuData((prev) => prev.filter((i) => i.id !== id))
    setMenuDeleteId(null)
    toast.promise(deleteMenuItem(id), {
      loading: "Removing...", success: `"${item?.name}" removed from menu`, error: "Failed to remove",
    })
  }

  function openEditRestaurant(r: RestaurantData) {
    setEditingRestaurant(r)
    setRestaurantForm({ ...r })
    setRestaurantDialogOpen(true)
  }

  function handleRestaurantSave() {
    if (!restaurantForm) return
    setRestaurants((prev) => prev.map((r) => (r.id === restaurantForm.id ? restaurantForm : r)))
    setRestaurantDialogOpen(false)
    toast.success(`${restaurantForm.name} updated`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Restaurant Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage restaurant details and menu items</p>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="info">Restaurant Info</TabsTrigger>
          <TabsTrigger value="menu">A-La-Carte Menu</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
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
                    <span>{r.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.reservation ? (
                      <Badge variant="outline" className="text-xs">Reservation Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Walk-in</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{r.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="menu" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button variant={menuCategoryFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setMenuCategoryFilter("all")}>
                All ({menuCounts.all ?? 0})
              </Button>
              {categories.map((cat) => (
                <Button key={cat.id} variant={menuCategoryFilter === cat.id ? "default" : "outline"} size="sm" onClick={() => setMenuCategoryFilter(cat.id)}>
                  {cat.label} ({menuCounts[cat.id] ?? 0})
                </Button>
              ))}
            </div>
            <Button onClick={openAddMenu}>
              <Plus className="h-4 w-4 mr-2" />Add Item
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden lg:table-cell">Description</TableHead>
                  <TableHead className="w-22.5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenu.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        {item.isVegetarian && <Leaf className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[item.category]}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm max-w-xs truncate">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditMenu(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setMenuDeleteId(item.id)}
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
        </TabsContent>
      </Tabs>

      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="menu-name">Name</Label>
              <Input id="menu-name" value={menuForm.name}
                onChange={(e) => setMenuForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Filet Mignon"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-desc">Description</Label>
              <Textarea id="menu-desc" value={menuForm.description}
                onChange={(e) => setMenuForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="menu-price">Price ($)</Label>
                <Input id="menu-price" type="number" min="0" step="0.01" value={menuForm.price}
                  onChange={(e) => setMenuForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={menuForm.category} onValueChange={(v) => setMenuForm((p) => ({ ...p, category: v as MenuCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-image">Image URL</Label>
              <Input id="menu-image" value={menuForm.image}
                onChange={(e) => setMenuForm((p) => ({ ...p, image: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="vegetarian" checked={menuForm.isVegetarian ?? false}
                onChange={(e) => setMenuForm((p) => ({ ...p, isVegetarian: e.target.checked }))}
                className="h-4 w-4 rounded border"
              />
              <Label htmlFor="vegetarian" className="cursor-pointer">Vegetarian</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMenuSave} disabled={!menuForm.name.trim()}>
              {editingMenuItem ? "Save Changes" : "Add to Menu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restaurantDialogOpen} onOpenChange={setRestaurantDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Restaurant</DialogTitle></DialogHeader>
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
                <Input value={restaurantForm.hours} onChange={(e) => setRestaurantForm((p) => p && { ...p, hours: e.target.value })} placeholder="e.g. 18:00 – 22:00" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={restaurantForm.description} onChange={(e) => setRestaurantForm((p) => p && { ...p, description: e.target.value })} rows={3} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="reservation" checked={restaurantForm.reservation}
                  onChange={(e) => setRestaurantForm((p) => p && { ...p, reservation: e.target.checked })}
                  className="h-4 w-4 rounded border"
                />
                <Label htmlFor="reservation" className="cursor-pointer">Reservation Required</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestaurantDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRestaurantSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!menuDeleteId} onOpenChange={(open) => !open && setMenuDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Menu Item</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the item from the a-la-carte menu.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMenuDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
