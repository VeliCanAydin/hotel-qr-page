// Static seed source for the bars table (source: dosiniahotel.com/restaurant-and-bars).
// Consumed by lib/db/seed.ts only — runtime reads go through lib/content.ts.
// Base fields are English; `translations` seeds content_translations rows
// (entityType 'bar'). `highlights` is a comma-separated bullet list for the
// guest card drawer. Menu items come from lib/data/bar-menus.ts.
export interface BarSeed {
  id: string
  name: string
  description: string
  highlights: string
  image: string
  openTime: string
  closeTime: string
  orderIndex: number
  translations: Record<string, { description: string; highlights: string }>
}

export const barSeedData: BarSeed[] = [
  {
    id: 'beach-bar',
    name: 'Beach Bar',
    description: 'Cool refreshments right on the beach.',
    highlights: 'Right on the beach, Refreshing cold drinks all day',
    image: '/plaj.jpeg',
    openTime: '09:00', closeTime: '19:00',
    orderIndex: 0,
    translations: {
      tr: {
        description: 'Plajın hemen üzerinde serinletici içecekler.',
        highlights: 'Plajın hemen üzerinde, Gün boyu serinletici soğuk içecekler',
      },
      de: {
        description: 'Kühle Erfrischungen direkt am Strand.',
        highlights: 'Direkt am Strand, Erfrischende kalte Getränke den ganzen Tag',
      },
      ru: {
        description: 'Прохладительные напитки прямо на пляже.',
        highlights: 'Прямо на пляже, Освежающие холодные напитки весь день',
      },
    },
  },
  {
    id: 'd-bar',
    name: 'D Bar',
    description: 'Cocktails and a wide selection of drinks in an open-air setting.',
    highlights: 'Open-air setting, Wide cocktail selection',
    image: '/bars/d-bar.jpg',
    openTime: '10:00', closeTime: '23:30',
    orderIndex: 1,
    translations: {
      tr: {
        description: 'Açık havada kokteyller ve zengin içecek seçenekleri.',
        highlights: 'Açık hava ortamı, Zengin kokteyl seçkisi',
      },
      de: {
        description: 'Cocktails und eine große Getränkeauswahl unter freiem Himmel.',
        highlights: 'Unter freiem Himmel, Große Cocktailauswahl',
      },
      ru: {
        description: 'Коктейли и большой выбор напитков под открытым небом.',
        highlights: 'Под открытым небом, Большой выбор коктейлей',
      },
    },
  },
  {
    id: 'flamingo-bar',
    name: 'Flamingo Bar | Kids Corner',
    description: 'Family-friendly bar right next to the Kids Corner.',
    highlights: 'Next to the Kids Corner, Family-friendly mocktails and treats',
    image: '/dosinia_luxury_resort_main_pool_2.jpeg',
    openTime: '10:00', closeTime: '23:30',
    orderIndex: 2,
    translations: {
      tr: {
        description: "Kids Corner'ın hemen yanında, ailelere uygun bar.",
        highlights: "Kids Corner'ın hemen yanında, Ailelere uygun mocktail ve ikramlar",
      },
      de: {
        description: 'Familienfreundliche Bar direkt neben dem Kids Corner.',
        highlights: 'Direkt neben dem Kids Corner, Familienfreundliche Mocktails und Snacks',
      },
      ru: {
        description: 'Семейный бар рядом с детским уголком.',
        highlights: 'Рядом с детским уголком, Безалкогольные коктейли и угощения для всей семьи',
      },
    },
  },
  {
    id: 'marin-bar',
    name: 'Marin Bar',
    description: 'Refreshing drinks with a sea breeze.',
    highlights: 'Sea breeze by the shore, Frozen drinks and milkshakes',
    image: '/dosinia_luxury_resort_beach_building.jpeg',
    openTime: '10:00', closeTime: '23:30',
    orderIndex: 3,
    translations: {
      tr: {
        description: 'Deniz esintisi eşliğinde serinletici içecekler.',
        highlights: "Deniz esintisi eşliğinde, Frozen içecekler ve milkshake'ler",
      },
      de: {
        description: 'Erfrischende Getränke mit Meeresbrise.',
        highlights: 'Meeresbrise am Ufer, Frozen-Drinks und Milchshakes',
      },
      ru: {
        description: 'Освежающие напитки с морским бризом.',
        highlights: 'Морской бриз у берега, Фроузен-напитки и милкшейки',
      },
    },
  },
  {
    id: 'irish-pub',
    name: 'Irish Pub',
    description: 'Classic pub atmosphere, open late into the night.',
    highlights: 'Open late until 05:00, Classic pub atmosphere, Premium paid menu',
    image: '/bars/irish-pub.jpg',
    openTime: '21:00', closeTime: '05:00',
    orderIndex: 4,
    translations: {
      tr: {
        description: 'Gece geç saatlere kadar açık, klasik pub atmosferi.',
        highlights: "Gece 05:00'e kadar açık, Klasik pub atmosferi, Premium ücretli menü",
      },
      de: {
        description: 'Klassische Pub-Atmosphäre bis spät in die Nacht.',
        highlights: 'Bis 05:00 Uhr geöffnet, Klassische Pub-Atmosphäre, Premium-Bezahlkarte',
      },
      ru: {
        description: 'Классическая атмосфера паба до поздней ночи.',
        highlights: 'Открыт до 05:00, Классическая атмосфера паба, Премиальное платное меню',
      },
    },
  },
  {
    id: 'whippet-inn',
    name: 'The Whippet Inn',
    description: 'A cozy English-style pub for your evenings.',
    highlights: 'Cozy English pub style, Open late, Premium paid menu',
    image: '/bars/whippet-inn.jpg',
    openTime: '21:00', closeTime: '02:00',
    orderIndex: 5,
    translations: {
      tr: {
        description: 'Akşamlarınız için sıcak, İngiliz tarzı bir pub.',
        highlights: 'Sıcak İngiliz pub tarzı, Geç saate kadar açık, Premium ücretli menü',
      },
      de: {
        description: 'Ein gemütlicher Pub im englischen Stil für Ihre Abende.',
        highlights: 'Gemütlicher englischer Pub-Stil, Bis spät geöffnet, Premium-Bezahlkarte',
      },
      ru: {
        description: 'Уютный паб в английском стиле для вечернего отдыха.',
        highlights: 'Уютный английский паб, Открыт допоздна, Премиальное платное меню',
      },
    },
  },
  {
    id: 'coffee-house',
    name: 'Coffee House',
    description: 'Freshly brewed coffee and more, all day long.',
    highlights: 'Freshly brewed coffee all day, Herbal teas and iced coffees',
    image: '/bars/coffee-house.jpg',
    openTime: '09:00', closeTime: '23:30',
    orderIndex: 6,
    translations: {
      tr: {
        description: 'Gün boyu taze kahve ve daha fazlası.',
        highlights: 'Gün boyu taze demlenmiş kahve, Bitki çayları ve soğuk kahveler',
      },
      de: {
        description: 'Frisch gebrühter Kaffee und mehr – den ganzen Tag.',
        highlights: 'Frisch gebrühter Kaffee den ganzen Tag, Kräutertees und Eiskaffees',
      },
      ru: {
        description: 'Свежесваренный кофе и не только — весь день.',
        highlights: 'Свежесваренный кофе весь день, Травяные чаи и холодный кофе',
      },
    },
  },
]
