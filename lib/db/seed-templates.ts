import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

async function seedTemplates() {
  const { db } = await import('./index')
  const { menuItems, menuItemImages, menuTemplates, menuTemplateItems } = await import('./schema')
  const { eq } = await import('drizzle-orm')

  console.log('Creating sample templates...')

  // ── A-La-Carte: copy existing menu items ──
  const alaCarteItems = await db.select().from(menuItems).where(eq(menuItems.restaurantId, 'a-la-carte'))
  const alaCarteImages = await db.select().from(menuItemImages)
  const imageMap = Object.fromEntries(alaCarteImages.map((r) => [r.itemId, r.proxyUrl]))

  const alaCarteTemplateId = crypto.randomUUID()
  await db.insert(menuTemplates).values({ id: alaCarteTemplateId, name: 'A-La-Carte Menü', restaurantId: 'a-la-carte' })
  if (alaCarteItems.length > 0) {
    await db.insert(menuTemplateItems).values(
      alaCarteItems.map((item, i) => ({
        id: crypto.randomUUID(),
        templateId: alaCarteTemplateId,
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        isVegetarian: item.isVegetarian,
        imageUrl: imageMap[item.id] ?? null,
        orderIndex: i,
      }))
    )
  }
  console.log(`Created "A-La-Carte Menü" template with ${alaCarteItems.length} items`)

  // ── Main Restaurant: International Buffet ──
  const mainTemplateId = crypto.randomUUID()
  await db.insert(menuTemplates).values({ id: mainTemplateId, name: 'International Buffet', restaurantId: 'main-restaurant' })
  const mainItems = [
    { category: 'breakfast', name: 'Menemen', description: 'Scrambled eggs with tomatoes, peppers and spices.', price: 0, isVegetarian: true },
    { category: 'breakfast', name: 'Açık Büfe Kahvaltı', description: 'Full breakfast spread: cheeses, olives, cold cuts, pastries, fresh fruit and jams.', price: 0, isVegetarian: false },
    { category: 'soups', name: 'Mercimek Çorbası', description: 'Traditional red lentil soup garnished with dried mint and lemon.', price: 0, isVegetarian: true },
    { category: 'soups', name: 'Günün Çorbası', description: 'Chef\'s daily soup prepared with seasonal ingredients.', price: 0, isVegetarian: false },
    { category: 'salads', name: 'Çoban Salatası', description: 'Diced tomatoes, cucumbers, green peppers, onion and parsley with olive oil.', price: 0, isVegetarian: true },
    { category: 'salads', name: 'Yeşil Salata', description: 'Mixed greens with seasonal vegetables and vinaigrette.', price: 0, isVegetarian: true },
    { category: 'main-courses', name: 'Izgara Tavuk', description: 'Grilled chicken breast marinated in herbs, served with rice and vegetables.', price: 0, isVegetarian: false },
    { category: 'main-courses', name: 'Izgara Balık', description: 'Daily catch grilled to perfection, served with seasonal greens.', price: 0, isVegetarian: false },
    { category: 'main-courses', name: 'Sebzeli Güveç', description: 'Slow-cooked mixed vegetables in a rich tomato sauce.', price: 0, isVegetarian: true },
    { category: 'main-courses', name: 'Köfte', description: 'Seasoned minced meat patties served with bulgur pilaf and grilled tomato.', price: 0, isVegetarian: false },
    { category: 'pasta-rice', name: 'Makarna Bar', description: 'Choice of pasta with tomato, bolognese or pesto sauce.', price: 0, isVegetarian: false },
    { category: 'pasta-rice', name: 'Pirinç Pilavı', description: 'Fluffy Turkish-style steamed rice.', price: 0, isVegetarian: true },
    { category: 'desserts', name: 'Günlük Tatlı Büfesi', description: 'Rotating selection of traditional Turkish sweets, fresh fruit and international desserts.', price: 0, isVegetarian: true },
    { category: 'desserts', name: 'Sütlaç', description: 'Creamy baked rice pudding, a classic Turkish favourite.', price: 0, isVegetarian: true },
  ]
  await db.insert(menuTemplateItems).values(
    mainItems.map((item, i) => ({
      id: crypto.randomUUID(), templateId: mainTemplateId, ...item, imageUrl: null, orderIndex: i,
    }))
  )
  console.log(`Created "International Buffet" template with ${mainItems.length} items`)

  // ── Snack Restaurant: Pool Bar & Snacks ──
  const snackTemplateId = crypto.randomUUID()
  await db.insert(menuTemplates).values({ id: snackTemplateId, name: 'Pool Bar & Snacks', restaurantId: 'snack-restaurant' })
  const snackItems = [
    { category: 'burgers-wraps', name: 'Classic Burger', description: 'Beef patty, cheddar, lettuce, tomato and pickles in a toasted brioche bun.', price: 18, isVegetarian: false },
    { category: 'burgers-wraps', name: 'Chicken Wrap', description: 'Grilled chicken strips, mixed greens and ranch dressing in a flour tortilla.', price: 14, isVegetarian: false },
    { category: 'burgers-wraps', name: 'Veggie Wrap', description: 'Grilled vegetables, hummus and feta cheese in a whole-wheat tortilla.', price: 12, isVegetarian: true },
    { category: 'hot-snacks', name: 'French Fries', description: 'Golden crispy fries seasoned with sea salt, served with ketchup and mayo.', price: 8, isVegetarian: true },
    { category: 'hot-snacks', name: 'Onion Rings', description: 'Crispy beer-battered onion rings with ranch dipping sauce.', price: 9, isVegetarian: true },
    { category: 'hot-snacks', name: 'Mozzarella Sticks', description: 'Breaded and fried mozzarella served with marinara sauce.', price: 10, isVegetarian: true },
    { category: 'hot-snacks', name: 'Chicken Wings', description: 'Crispy fried chicken wings with your choice of BBQ or hot sauce.', price: 15, isVegetarian: false },
    { category: 'salads-light', name: 'Caesar Salad', description: 'Romaine lettuce, croutons, parmesan and house Caesar dressing.', price: 12, isVegetarian: true },
    { category: 'salads-light', name: 'Fruit Plate', description: 'Seasonal fresh fruit selection.', price: 8, isVegetarian: true },
    { category: 'pizza', name: 'Margherita Pizza', description: 'Tomato sauce, fresh mozzarella and basil on a thin crust.', price: 16, isVegetarian: true },
    { category: 'pizza', name: 'Pepperoni Pizza', description: 'Tomato sauce, mozzarella and sliced pepperoni.', price: 18, isVegetarian: false },
    { category: 'desserts', name: 'Ice Cream', description: 'Two scoops of your choice: vanilla, chocolate or strawberry.', price: 7, isVegetarian: true },
    { category: 'desserts', name: 'Waffle', description: 'Belgian waffle topped with Nutella, banana and whipped cream.', price: 11, isVegetarian: true },
  ]
  await db.insert(menuTemplateItems).values(
    snackItems.map((item, i) => ({
      id: crypto.randomUUID(), templateId: snackTemplateId, ...item, imageUrl: null, orderIndex: i,
    }))
  )
  console.log(`Created "Pool Bar & Snacks" template with ${snackItems.length} items`)

  console.log('Done!')
  process.exit(0)
}

seedTemplates().catch((err) => {
  console.error(err)
  process.exit(1)
})
