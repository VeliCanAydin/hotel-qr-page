# Hotel QR Page — Proje Dokümantasyonu

## Proje Nedir?

**Dosinia Luxury Hotel** için geliştirilmiş bir QR-kod tabanlı dijital misafir deneyimi platformu. Otele gelen misafirler QR kodu okutarak restoran menülerine, oda servisine, spa/wellness/etkinlik bilgilerine ve AI asistana erişiyor.

---

## Tech Stack

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| Framework | Next.js (App Router) | 16.0.7 |
| UI Runtime | React | 19.2.1 |
| Dil | TypeScript | 5 |
| Stil | Tailwind CSS | 4 |
| UI Bileşenleri | shadcn/ui (New York style) | — |
| UI Primitives | Radix UI | 13 paket |
| İkonlar | Lucide React | 0.546.0 |
| Tema | next-themes (dark/light) | 0.4.6 |
| Tarih | date-fns | 4.1.0 |
| Build | Turbopack (dev + build) | — |
| Font | Manrope (Google Fonts) | — |

**Veritabanı yok.** Tüm veriler statik TypeScript dosyalarında.

---

## Klasör Yapısı

```
hotel-qr-page/
│
├── app/                          # Next.js App Router
│   ├── (main)/                  # Misafir arayüzü (URL'de görünmez)
│   │   ├── page.tsx             # Ana sayfa — 10 kartlık feature grid
│   │   ├── layout.tsx           # Header + Footer wrapper
│   │   ├── restaurants/         # 3 restoran (a-la-carte, main, snack)
│   │   ├── room-service/        # Oda servisi kataloğu + sepet
│   │   ├── beach-pools/         # Plaj ve havuz bilgileri
│   │   ├── spa/                 # Spa hizmetleri
│   │   ├── wellness/            # Wellness aktiviteleri
│   │   ├── kids-care/           # Çocuk kulübü
│   │   ├── events/              # Otel etkinlikleri takvimi
│   │   ├── hotel-info/          # Genel otel bilgileri
│   │   ├── ai-assistant/        # AI sohbet arayüzü
│   │   ├── feedback/            # Misafir geri bildirim formu
│   │   └── api/
│   │       └── ai-chat/         # Dış AI API'ye proxy (POST route)
│   ├── (auth)/                  # Giriş sayfaları
│   │   ├── login/               # Misafir & Personel giriş (UI only)
│   │   └── layout.tsx           # Ortalanmış auth layout
│   ├── (admin)/                 # Admin paneli (eksik/taslak)
│   │   ├── dashboard/           # Sidebar navigation dashboard
│   │   └── layout.tsx           # Sidebar tabanlı layout
│   ├── layout.tsx               # Root layout (providers)
│   └── globals.css              # Tailwind + OKLCh tema değişkenleri
│
├── components/                   # React bileşenleri
│   ├── Header.tsx               # Sticky header (nav + sepet + login)
│   ├── Footer.tsx               # Footer
│   ├── PageCard.tsx             # Ana sayfa feature kartı
│   ├── ModeToggle.tsx           # Dark/light mod toggle
│   ├── theme-provider.tsx       # next-themes wrapper
│   ├── ui/                      # shadcn/ui bileşenleri (29 dosya)
│   │   └── admin/               # Admin sidebar bileşenleri
│   ├── room-service/            # Oda servisi bileşenleri
│   ├── restaurants/             # Restoran bileşenleri
│   ├── events/                  # Etkinlik bileşenleri
│   ├── spa-wellness/            # Spa & wellness bileşenleri
│   ├── beach-pools/             # Plaj bileşenleri
│   ├── kids-care/               # Çocuk kulübü bileşenleri
│   ├── a-la-carte/              # A-la-carte menü bileşenleri
│   └── ai-assistant/            # AI sohbet bileşenleri
│
├── context/
│   └── CartContext.tsx          # Oda servisi sepet state (localStorage)
│
├── lib/
│   ├── utils.ts                 # cn() — clsx + tailwind-merge
│   ├── pages.ts                 # Ana sayfa navigasyon yapısı (10 sayfa)
│   └── data/
│       ├── roomServiceData.ts   # Oda servisi ürünleri
│       ├── aLaCarteMenu.ts      # A-la-carte menü
│       ├── events.ts            # Otel etkinlikleri + takvim yardımcıları
│       └── kidsClubData.ts      # Çocuk kulübü aktiviteleri
│
├── hooks/
│   └── use-mobile.ts            # Mobil cihaz tespiti hook
│
├── public/                      # Statik dosyalar (görseller, PWA ikonları)
│
├── package.json
├── tsconfig.json                # Path alias: @/* → ./
├── next.config.ts               # Unsplash remote image pattern
├── components.json              # shadcn/ui konfigürasyonu
└── postcss.config.mjs           # Tailwind PostCSS
```

---

## Routing

Route group'lar (`()`) URL'yi etkilemez, sadece layout organizasyonu sağlar.

| URL | Sayfa | Açıklama |
|-----|-------|----------|
| `/` | Ana sayfa | 10 feature kartı |
| `/restaurants` | Restoranlar | 3 restoran listesi |
| `/restaurants/[id]` | Restoran detay | Menü ve ürünler |
| `/room-service` | Oda servisi | Yemek/içecek/hizmet katalog |
| `/room-service/cart` | Sepet | Ürünler + ödeme |
| `/beach-pools` | Plaj & havuz | Bilgi sayfası |
| `/spa` | Spa | Hizmetler ve sınıflar |
| `/wellness` | Wellness | Yoga, fitness |
| `/kids-care` | Çocuk kulübü | Aktiviteler |
| `/events` | Etkinlikler | Takvim tabanlı liste |
| `/hotel-info` | Otel bilgisi | Genel bilgiler |
| `/ai-assistant` | AI asistan | Sohbet arayüzü |
| `/feedback` | Geri bildirim | Form |
| `/login` | Giriş | UI only (auth yok) |
| `/dashboard` | Admin | Sidebar layout (eksik) |

**API Route:**
- `POST /api/ai-chat` — Kullanıcı mesajını dış AI servisine iletir

---

## State Management

**CartContext** (`context/CartContext.tsx`):
- Oda servisi sepetini yönetir
- `localStorage` ile kalıcı (`room-service-cart` key)
- Methods: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `getTotalPrice`, `getTotalItems`

Bunun dışında global state yok. Her sayfa kendi local state'ini kullanır.

---

## Veri Modelleri

```typescript
// Oda servisi
RoomServiceItem: { id, name, description, price, category: 'food'|'beverages'|'other-services' }

// A-la-carte menü
MenuItem: { id, name, description, price, image, isVegetarian?, category }

// Etkinlik
HotelEvent: { id, title, description, location, date, startTime, endTime, category, color? }

// Ana sayfa kartları (lib/pages.ts)
Page: { icon, title, description, href }
```

---

## Dış Entegrasyonlar

### AI Chat API
- **Endpoint:** `http://51.77.203.172:83/api/forward-message/`
- **Method:** POST (FormData)
- **Input:** `text` parametresi
- **Output:** `{ user_text, bot_response, image_path }`
- **Proxy:** `/api/ai-chat` route üzerinden erişilir (CORS bypass)

### Görseller
- **Unsplash** (`images.unsplash.com`) — A-la-carte menü görselleri için
- `next.config.ts`'de remote pattern olarak tanımlı
- Diğer görseller `public/` altında yerel

---

## Stil Sistemi

- **Tailwind CSS 4** — `@tailwindcss/postcss` ile
- **OKLCh renk uzayı** — Modern CSS değişkenleri (`oklch()` fonksiyonu)
- **Dark mode** — `next-themes` ile, class tabanlı (`.dark`)
- **shadcn/ui** — New York stili, slate baz renk, 0.625rem radius
- **`cn()` utility** — `clsx` + `tailwind-merge` kombinasyonu

---

## Geliştirme

```bash
npm run dev      # Turbopack ile geliştirme sunucusu (localhost:3000)
npm run build    # Production build (Turbopack)
npm start        # Production sunucusu
npm run lint     # ESLint
```

`.env` dosyası yok. Tüm konfigürasyon hardcoded.

---

## Önemli Kurallar & Konvansiyonlar

1. **Route Groups** — `(main)`, `(auth)`, `(admin)` layout organizasyonu için, URL'yi etkilemez
2. **`'use client'`** — Interaktif bileşenler için (Header, AI chat, sepet, vb.)
3. **Suspense** — Restaurant kartları Suspense sınırı içinde, skeleton fallback ile
4. **`lib/pages.ts`** — Ana sayfa yapısı buradan okunur, hardcoded değil
5. **shadcn/ui** — Tüm UI bileşenleri için; `npx shadcn@latest add [component]` ile eklenir
6. **Bileşen organizasyonu** — Feature'a özel bileşenler `components/[feature]/` altında

---

## Tamamlanmamış / Taslak Özellikler

| Özellik | Durum |
|---------|-------|
| Login sayfası | UI var, auth logic yok |
| Admin dashboard | Layout var, içerik yok |
| Hotel info | Muhtemelen placeholder |
| Feedback formu | Route var, implementasyon kontrol edilmeli |
| Gerçek backend/DB | Yok, tüm veri statik |

---

## Yeni Feature Eklemek

1. `app/(main)/[feature-name]/page.tsx` oluştur
2. Interaktifse `'use client'` ekle
3. Ana sayfada görünmesi gerekiyorsa `lib/pages.ts`'e giriş ekle
4. Destekleyici bileşenleri `components/[feature-name]/` altına koy
5. Veri gerekiyorsa `lib/data/[feature]Data.ts` oluştur
6. UI için shadcn/ui bileşenlerini kullan

---

## Repository

- **GitHub:** `https://github.com/VeliCanAydin/hotel-qr-page`
- **Branch:** `main`
