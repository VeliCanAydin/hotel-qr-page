// Transforms lib/data/bar-menus.json (raw menu capture, source: hotel F&B) into
// bar_menu_items + bar_menu_categories seed rows. Consumed by lib/db/seed.ts only.
//
// Mapping decisions (agreed 2026-07-12):
// - Compact tabs: included spirits collapse to one item per spirit type under
//   'included-drinks' (brands in the description); both paid menus collapse to a
//   single 'paid-menu' category (shown first) with the drink type in the
//   description and the € price string in priceText.
// - The JSON's "Irish Bar" entry is a duplicate capture of the Irish Pub and is
//   skipped; the richer "Irish Pub" entry seeds irish-pub.
// - The Whippet Inn "note" (breed history trivia) is not menu data — dropped.
import rawMenus from './bar-menus.json'

export type BarMenuItemSeed = {
  id: string
  barId: string
  name: string
  description: string
  priceText: string
  category: string
  orderIndex: number
}

export type BarMenuTranslationSeed = {
  entityType: 'bar_menu_item' | 'bar_menu_category'
  entityId: string
  locale: string
  field: 'name' | 'description' | 'priceText' | 'label'
  value: string
}

const BAR_NAME_TO_ID: Record<string, string> = {
  'The Whippet Inn': 'whippet-inn',
  'Beach Bar': 'beach-bar',
  'Coffee House': 'coffee-house',
  'D Bar': 'd-bar',
  'Flamingo Bar': 'flamingo-bar',
  'Irish Pub': 'irish-pub',
  'Marin Bar': 'marin-bar',
}

export const BAR_MENU_CATEGORY_SEED: Array<{
  id: string
  label: string
  orderIndex: number
  translations?: Record<string, string>
}> = [
  { id: 'paid-menu', label: 'Paid Menu', orderIndex: 0, translations: { tr: 'Ücretli Menü', de: 'Kostenpflichtige Karte', ru: 'Платное меню' } },
  { id: 'included-drinks', label: 'Included Drinks', orderIndex: 1, translations: { tr: 'Konsepte Dahil İçecekler', de: 'Inklusive Getränke', ru: 'Включённые напитки' } },
  { id: 'cocktails', label: 'Cocktails', orderIndex: 2, translations: { tr: 'Kokteyller', ru: 'Коктейли' } },
  { id: 'haribo-mocktails', label: 'Haribo Mocktails', orderIndex: 3, translations: { tr: 'Haribo Mocktailler', de: 'Haribo-Mocktails', ru: 'Коктейли Haribo' } },
  { id: 'mocktails', label: 'Mocktails', orderIndex: 4, translations: { tr: 'Alkolsüz Kokteyller', ru: 'Безалкогольные коктейли' } },
  { id: 'ice-cream', label: 'Ice Cream', orderIndex: 5, translations: { tr: 'Dondurma', de: 'Eis', ru: 'Мороженое' } },
  { id: 'lemonade', label: 'Lemonade', orderIndex: 6, translations: { tr: 'Limonata', de: 'Limonade', ru: 'Лимонад' } },
  { id: 'milkshake', label: 'Milkshake', orderIndex: 7, translations: { de: 'Milchshake', ru: 'Милкшейк' } },
  { id: 'frozen', label: 'Frozen', orderIndex: 8 },
  { id: 'soft-drinks', label: 'Soft Drinks', orderIndex: 9, translations: { tr: 'Alkolsüz İçecekler', de: 'Softdrinks', ru: 'Безалкогольные напитки' } },
  { id: 'traditional', label: 'Traditional', orderIndex: 10, translations: { tr: 'Geleneksel', de: 'Traditionell', ru: 'Традиционные' } },
  { id: 'herbal-teas', label: 'Herbal Teas', orderIndex: 11, translations: { tr: 'Bitki Çayları', de: 'Kräutertees', ru: 'Травяные чаи' } },
  { id: 'black-coffee', label: 'Black Coffee', orderIndex: 12, translations: { tr: 'Sade Kahve', de: 'Schwarzer Kaffee', ru: 'Чёрный кофе' } },
  { id: 'speciality-coffee', label: 'Speciality Coffee', orderIndex: 13, translations: { tr: 'Spesiyal Kahveler', de: 'Kaffeespezialitäten', ru: 'Фирменный кофе' } },
  { id: 'iced-coffee', label: 'Iced Coffee', orderIndex: 14, translations: { tr: 'Soğuk Kahve', de: 'Eiskaffee', ru: 'Холодный кофе' } },
]

// Coffee House / Flamingo JSON section names → shared category ids
const JSON_CATEGORY_TO_ID: Record<string, string> = {
  'Traditional': 'traditional',
  'Herbal Teas': 'herbal-teas',
  'Nescafe - Black Coffee': 'black-coffee',
  'Nescafe - Speciality Coffee': 'speciality-coffee',
  'Nescafe - Iced Coffee': 'iced-coffee',
  'Haribo Moktails': 'haribo-mocktails',
  'Moktails': 'mocktails',
  'Ice Cream / Dondurma': 'ice-cream',
  'Lemonade / Limonata': 'lemonade',
  'Milkshake': 'milkshake',
  'Frozen': 'frozen',
  'Soft Drinks': 'soft-drinks',
}

// Spirit/paid category names: normalized English display name + translations.
// JSON uses Turkish spellings for a couple of them (Vermut, Aperatif).
const DRINK_TYPES: Record<string, { en: string; tr?: string; de?: string; ru?: string }> = {
  'Beer': { en: 'Beer', tr: 'Bira', de: 'Bier', ru: 'Пиво' },
  'Beer & Cider': { en: 'Beer & Cider', tr: 'Bira & Cider', de: 'Bier & Cider', ru: 'Пиво и сидр' },
  'Whisky': { en: 'Whisky', tr: 'Viski', ru: 'Виски' },
  'Vodka': { en: 'Vodka', tr: 'Votka', de: 'Wodka', ru: 'Водка' },
  'Gin': { en: 'Gin', tr: 'Cin', ru: 'Джин' },
  'Tequila': { en: 'Tequila', tr: 'Tekila', ru: 'Текила' },
  'Raki': { en: 'Raki', tr: 'Rakı', de: 'Rakı', ru: 'Ракы' },
  'Rum': { en: 'Rum', tr: 'Rom', ru: 'Ром' },
  'Brandy': { en: 'Brandy', tr: 'Brendi', de: 'Weinbrand', ru: 'Бренди' },
  'Vermut': { en: 'Vermouth', tr: 'Vermut', de: 'Wermut', ru: 'Вермут' },
  'Aperatif': { en: 'Aperitif', tr: 'Aperatif', ru: 'Аперитив' },
  'Champagne': { en: 'Champagne', tr: 'Şampanya', de: 'Champagner', ru: 'Шампанское' },
  'Wine': { en: 'Wine', tr: 'Şarap', de: 'Wein', ru: 'Вино' },
  'Cocktails': { en: 'Cocktails', tr: 'Kokteyller', ru: 'Коктейли' },
}

// Plain string items (flavors, generic drinks) that deserve seeded translations;
// everything else falls back to English until translated in the admin.
const ITEM_NAME_I18N: Record<string, { tr?: string; de?: string; ru?: string }> = {
  'Chocolate': { tr: 'Çikolata', de: 'Schokolade', ru: 'Шоколад' },
  'Strawberry': { tr: 'Çilek', de: 'Erdbeere', ru: 'Клубника' },
  'Lemon': { tr: 'Limon', de: 'Zitrone', ru: 'Лимон' },
  'Vanilla': { tr: 'Vanilya', de: 'Vanille', ru: 'Ваниль' },
  'Banana': { tr: 'Muz', de: 'Banane', ru: 'Банан' },
  'Caramel': { tr: 'Karamel', de: 'Karamell', ru: 'Карамель' },
  'Mango': { ru: 'Манго' },
  'Passionflower': { tr: 'Çarkıfelek', de: 'Passionsfrucht', ru: 'Маракуйя' },
  'Forest Fruits': { tr: 'Orman Meyveleri', de: 'Waldfrüchte', ru: 'Лесные ягоды' },
  'Forest Fruit': { tr: 'Orman Meyveleri', de: 'Waldfrüchte', ru: 'Лесные ягоды' },
  'Lemonade': { tr: 'Limonata', de: 'Limonade', ru: 'Лимонад' },
  'Strawberry Lemonade': { tr: 'Çilekli Limonata', de: 'Erdbeer-Limonade', ru: 'Клубничный лимонад' },
  'Mint Lemonade': { tr: 'Naneli Limonata', de: 'Minz-Limonade', ru: 'Мятный лимонад' },
  'Ice Tea': { de: 'Eistee', ru: 'Холодный чай' },
  'Energy Drink': { tr: 'Enerji İçeceği', de: 'Energy-Drink', ru: 'Энергетик' },
  'Soda Water': { tr: 'Soda', de: 'Sodawasser', ru: 'Содовая' },
  'Fruit Juices (Orange, Apple, Pineapple, Cherry)': {
    tr: 'Meyve Suları (Portakal, Elma, Ananas, Vişne)',
    de: 'Fruchtsäfte (Orange, Apfel, Ananas, Kirsche)',
    ru: 'Соки (апельсин, яблоко, ананас, вишня)',
  },
}

const BOTTLE_WORD: Record<string, string> = { en: 'Bottle', tr: 'Şişe', de: 'Flasche', ru: 'Бутылка' }

type RawCocktail = { name: string; ingredients: string }
type RawPaidItem = { name: string; price?: string; price_bottle?: string; price_6cl?: string }
type RawCoffeeItem = string | { name: string; name_tr?: string }
type RawSection =
  | Record<string, string[]> // included_spirits
  | RawCocktail[]
  | string[]
  | Record<string, RawPaidItem[] | RawCoffeeItem[] | RawCocktail[]> // categories
  | string // note

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function paidPriceText(item: RawPaidItem, locale: string) {
  if (item.price) return item.price
  const parts: string[] = []
  if (item.price_bottle) parts.push(`${BOTTLE_WORD[locale]} ${item.price_bottle}`)
  if (item.price_6cl) parts.push(`6cl ${item.price_6cl}`)
  return parts.join(' · ')
}

export function buildBarMenuSeed(): {
  items: BarMenuItemSeed[]
  translations: BarMenuTranslationSeed[]
} {
  const items: BarMenuItemSeed[] = []
  const translations: BarMenuTranslationSeed[] = []
  const usedIds = new Set<string>()

  for (const category of BAR_MENU_CATEGORY_SEED) {
    for (const [locale, value] of Object.entries(category.translations ?? {})) {
      translations.push({ entityType: 'bar_menu_category', entityId: category.id, locale, field: 'label', value })
    }
  }

  const addItem = (item: Omit<BarMenuItemSeed, 'id' | 'orderIndex'> & { idHint: string }, order: { value: number }) => {
    let id = item.idHint
    for (let n = 2; usedIds.has(id); n += 1) id = `${item.idHint}-${n}`
    usedIds.add(id)
    const { idHint: _idHint, ...rest } = item
    items.push({ ...rest, id, orderIndex: order.value++ })
    return id
  }

  const addNameTranslations = (id: string, byLocale: Record<string, string | undefined>, en: string) => {
    for (const [locale, value] of Object.entries(byLocale)) {
      if (value && value !== en) {
        translations.push({ entityType: 'bar_menu_item', entityId: id, locale, field: 'name', value })
      }
    }
  }

  const raw = rawMenus as unknown as { bars: Array<{ bar_name: string; menus: Record<string, Record<string, RawSection>> }> }
  for (const bar of raw.bars) {
    const barId = BAR_NAME_TO_ID[bar.bar_name]
    if (!barId) continue // 'Irish Bar' duplicate capture
    const order = { value: 0 }

    for (const [menuName, menu] of Object.entries(bar.menus)) {
      for (const [sectionKey, section] of Object.entries(menu)) {
        if (sectionKey === 'note') continue

        if (sectionKey === 'included_spirits') {
          for (const [type, brands] of Object.entries(section as Record<string, string[]>)) {
            const meta = DRINK_TYPES[type] ?? { en: type }
            const id = addItem({
              idHint: `${barId}-inc-${slug(type)}`,
              barId, name: meta.en, description: brands.join(', '), priceText: '', category: 'included-drinks',
            }, order)
            addNameTranslations(id, { tr: meta.tr, de: meta.de, ru: meta.ru }, meta.en)
          }
        } else if (sectionKey === 'cocktail_menu') {
          for (const cocktail of section as RawCocktail[]) {
            addItem({
              idHint: `${barId}-ck-${slug(cocktail.name)}`,
              barId, name: cocktail.name, description: cocktail.ingredients, priceText: '', category: 'cocktails',
            }, order)
          }
        } else if (sectionKey === 'soft_drinks' || sectionKey === 'frozen' || sectionKey === 'milkshake') {
          const category = sectionKey === 'soft_drinks' ? 'soft-drinks' : sectionKey
          for (const name of section as string[]) {
            const id = addItem({
              idHint: `${barId}-${slug(category)}-${slug(name)}`,
              barId, name, description: '', priceText: '', category,
            }, order)
            const i18n = ITEM_NAME_I18N[name]
            if (i18n) addNameTranslations(id, i18n, name)
          }
        } else if (sectionKey === 'categories' && menuName.includes('Paid')) {
          for (const [type, paidItems] of Object.entries(section as Record<string, RawPaidItem[]>)) {
            const meta = DRINK_TYPES[type] ?? { en: type }
            for (const paidItem of paidItems) {
              const priceText = paidPriceText(paidItem, 'en')
              const id = addItem({
                idHint: `${barId}-paid-${slug(type)}-${slug(paidItem.name)}`,
                barId, name: paidItem.name, description: meta.en, priceText, category: 'paid-menu',
              }, order)
              for (const locale of ['tr', 'de', 'ru'] as const) {
                const localizedType = meta[locale]
                if (localizedType && localizedType !== meta.en) {
                  translations.push({ entityType: 'bar_menu_item', entityId: id, locale, field: 'description', value: localizedType })
                }
                const localizedPrice = paidPriceText(paidItem, locale)
                if (localizedPrice !== priceText) {
                  translations.push({ entityType: 'bar_menu_item', entityId: id, locale, field: 'priceText', value: localizedPrice })
                }
              }
            }
          }
        } else if (sectionKey === 'categories') {
          // Coffee House / Flamingo Kids Corner
          for (const [jsonCategory, rawItems] of Object.entries(section as Record<string, RawCoffeeItem[] | RawCocktail[]>)) {
            const category = JSON_CATEGORY_TO_ID[jsonCategory]
            if (!category) continue
            for (const raw of rawItems) {
              if (typeof raw === 'string') {
                // Flamingo strings are sometimes bilingual: "Chocolate - Çikolata"
                const [en, trPart] = raw.split(' - ').map((part) => part.trim())
                const id = addItem({
                  idHint: `${barId}-${category}-${slug(en)}`,
                  barId, name: en, description: '', priceText: '', category,
                }, order)
                const i18n = ITEM_NAME_I18N[en] ?? (trPart ? { tr: trPart } : undefined)
                if (i18n) addNameTranslations(id, i18n, en)
              } else if ('ingredients' in raw) {
                addItem({
                  idHint: `${barId}-${category}-${slug(raw.name)}`,
                  barId, name: raw.name, description: raw.ingredients, priceText: '', category,
                }, order)
              } else {
                const id = addItem({
                  idHint: `${barId}-${category}-${slug(raw.name)}`,
                  barId, name: raw.name, description: '', priceText: '', category,
                }, order)
                if (raw.name_tr) addNameTranslations(id, { tr: raw.name_tr }, raw.name)
              }
            }
          }
        }
      }
    }
  }

  return { items, translations }
}
