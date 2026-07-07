# Hotel QR Page — Proje Dokümantasyonu

## Proje Nedir?

**Dosinia Luxury Hotel** için QR-kod tabanlı dijital misafir deneyimi platformu. Üç yüzü var:

1. **Misafir sitesi** (`/`) — QR okutan herkes: restoran menüleri, oda servisi, spa/wellness, etkinlikler, AI asistan
2. **Misafir portalı** (`/portal`) — oda no + soyad ile giriş yapan misafirler: konaklama özeti, sipariş takibi, geri bildirim
3. **Admin paneli** (`/dashboard`) — personel: içerik yönetimi, siparişler, rezervasyonlar, feedback/destek, rol bazlı erişim

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui (New York) |
| Veritabanı | Neon PostgreSQL (serverless) + Drizzle ORM |
| Auth | jose (JWT, httpOnly cookie) + bcryptjs |
| Dosya depolama | Vercel Blob (menü görselleri, destek ekleri) |
| Bildirim/toast | sonner |
| Form/validasyon | zod, react-hook-form (yer yer) |
| Rapor | exceljs (feedback Excel raporu) |

---

## Auth & RBAC (kritik — her değişiklikte uy)

İki ayrı oturum, ikisi de JWT + httpOnly cookie:

- **Admin:** `admin-session` cookie. Login: email + bcrypt hash (`admin_users` tablosu). Payload: `userId`, `email`, `roleName`, `type: 'admin'`.
- **Misafir:** `guest-session` cookie. Login: oda no + soyad → `reservations` tablosu (`lib/reservations.ts`). Payload: `reservationCode`, `roomNumber`, `surname`, `checkOut`, `type: 'guest'`.

### Koruma katmanları

1. **`proxy.ts`** (Next 16 middleware) — `/dashboard/*` ve `/portal/*` sayfa navigasyonunu korur. Misafir: checkout tarihi geçince oturum düşer. Admin: sayfa izni yoksa `/dashboard`'a yönlendirir.
2. **`requireAdmin(pageHref?)`** (`lib/auth.ts`) — **her admin server action'ı ve API route'u bununla başlamak ZORUNDA.** Proxy sadece sayfaları korur; action'lar herhangi bir yerden POST ile çağrılabilir. `pageHref` verilirse rol izni de kontrol edilir.
3. **`isPageAllowedForSession` / `getAllowedPageHrefs`** (`lib/page-access.ts`) — tek erişim kontrolü kaynağı: Access Control UI'dan yazılmış DB satırı (`admin_role_pages`) > statik preset (`lib/permissions.ts`); hata durumunda **reddet** (fail-closed). Proxy, action'lar, API route'lar ve dashboard kartları bunu kullanır.

### `ADMIN_PAGE_PERMISSIONS` (lib/permissions.ts) — tek sayfa listesi

Admin sidebar **bu listeden üretilir** (`components/admin/app-sidebar.tsx`), Access Control UI bu listeyi gösterir, proxy bu listeye göre yol çözer. **Yeni admin sayfası eklerken bu listeye kayıt eklemeyi unutursan sayfa sidebar'da görünmez ve Super Admin dışında kimse giremez.**

Roller: Super Admin (her şey), Content Manager, Service Manager, Guest Relations. Preset'ler `DEFAULT_ADMIN_ROLE_PRESETS`'te; DB'deki `admin_role_pages` satırları preset'i override eder.

### Güvenlik kuralları

- Misafir action'larında fiyat/veri client'tan **alınmaz** — sipariş satırları DB kataloğundan yeniden kurulur (`createRoomServiceOrder`).
- Misafir verisi döndüren DB sorguları `lib/reservations.ts` gibi **`'use server'` OLMAYAN** server-only modüllerde tutulur (action'a çevirmek onu public endpoint yapar).
- `/api/upload` admin auth'lu; `/api/blob-image` yalnızca `*.blob.vercel-storage.com` host'una fetch atar (token sızıntısı koruması).
- Hardcoded kullanıcı/şifre YOK. Seed şifreleri: `SEED_ADMIN_PASSWORD` / `SEED_STAFF_PASSWORD` env.

---

## Klasör Yapısı (özet)

```
app/
├── (main)/            # Public misafir sitesi
├── (guest)/portal/    # Girişli misafir portalı (layout'lar findActiveReservation ile korur)
├── (admin)/dashboard/ # Admin panel: content/, services/, orders/, events/, guests/, settings/
├── (auth)/login/      # Misafir + personel giriş
└── api/               # TÜM API route'ları: admin/*, ai-chat, feedback, guest-context, upload, blob-image, allergens vb.
components/
├── ui/                # SADECE shadcn primitive'leri
├── admin/             # Sidebar (ADMIN_PAGE_PERMISSIONS'tan üretilir), nav, breadcrumb
├── guest/             # Portal header, tabs, feedback formu, MyPlanView, PersonalizedStayPlanner
└── [feature]/         # Feature bileşenleri
lib/
├── auth.ts            # JWT, requireAdmin, guest token
├── page-access.ts     # DB-öncelikli sayfa izni (fail-closed)
├── permissions.ts     # ADMIN_PAGE_PERMISSIONS + rol preset'leri (TEK KAYNAK)
├── reservations.ts    # Misafir login/oturum lookup'ları (server-only, action DEĞİL)
├── access-store.ts    # Access Control UI action'ları
├── actions/           # Server action'lar (admin mutasyonları requireAdmin'li)
├── types/             # Paylaşılan domain tipleri + UI sabitleri (HotelEvent+categoryColors, RoomServiceItem+categoryLabels, MenuItem, NearbyGuide*+iconMap)
├── db/                # schema.ts, index.ts, seed.ts, seed-* yardımcıları (demo rezervasyonlar dahil), migrations/
└── data/              # Statik seed kaynakları (SİLME — seed.ts besleniyor; allergens.ts runtime'da da kullanılıyor)
hooks/
├── use-mobile.ts
└── use-auto-refresh.ts # 30sn router.refresh() polling (orders & support ekranları)
context/cart-context.tsx # Oda servisi sepeti (localStorage)
proxy.ts               # Route koruması (Next 16 middleware)
```

**Dosya adlandırma:** tüm `.ts`/`.tsx` dosyaları kebab-case (`event-card.tsx`, `cart-context.tsx`). PascalCase dosya adı ekleme.

---

## Veritabanı

- **Şema:** `lib/db/schema.ts` — içerik tabloları (hotel_info, spa/wellness, restaurants, menu_items, room_service_items, events, kids_*, nearby_guide_items, allergens, menu_templates), operasyon tabloları (room_service_orders, guest_feedbacks, guest_support_requests, reservations), RBAC (admin_users, admin_roles, admin_role_pages).
- **Şema değişikliği akışı:** `schema.ts`'i düzenle → `npm run db:push`. **Ad-hoc migration script'i yazma** (eskiden `lib/db/migrate-*.ts` vardı, uygulandılar ve silindiler). `lib/db/migrations/` klasörü tarihsel kayıt.
- **Seed:** `npm run db:seed` — restoranlar, menüler, etkinlikler, roller/izinler, admin kullanıcıları ve demo rezervasyonlar (tarihler seed anında bugüne göre hesaplanır; test girişi: oda **777** / soyad **test**). Dikkat: seed bazı tabloları silip yeniden doldurur — admin'den yapılmış düzenlemeleri ezebilir.
- Bilinen kalıntı: `room_service_items.allergens` kolonu DB'de var, schema'da yok (zararsız).

---

## Misafir Girişi Akışı

1. `/login` → oda no + soyad → `guestLogin` → `findReservationForLogin` (case-insensitive, bitmemiş konaklama)
2. JWT `guest-session` cookie'ye yazılır (24h) — ama asıl otorite DB: her portal sayfası `findActiveReservation` ile doğrular
3. Personel Guest List'ten **Check Out** yapınca veya checkout tarihi geçince misafir erişimi anında düşer
4. Rezervasyonlar admin panelde `/dashboard/guests/list`'ten yönetilir (CRUD + check-in/out; kod otomatik `DOS-YYYY-NNNN`)

---

## Admin Panel Konvansiyonları

**Sayfa deseni:** `page.tsx` (server, data fetch + `force-dynamic` gerekiyorsa) → `*-client.tsx` (`'use client'`, local state + optimistic update + `toast.promise` + shadcn Dialog formlar).

**Operasyonel ekranlar** (orders, support-requests): `useAutoRefresh(30_000)` + yeni kayıt toast bildirimi (görülen id'ler ref'te tutulur).

### Yeni admin sayfası checklist'i

1. `app/(admin)/dashboard/[bölüm]/[sayfa]/page.tsx` + client bileşeni
2. `ADMIN_PAGE_PERMISSIONS`'a kayıt ekle (sidebar + izin sistemi buradan)
3. İlgili rol preset'lerine href'i ekle
4. Action'larına `await requireAdmin('<sayfa-href>')` koy
5. Sayfa cookie okuyorsa `export const dynamic = 'force-dynamic'`

### Yeni misafir sayfası checklist'i

1. `app/(main)/[feature]/page.tsx` (public) veya `app/(guest)/portal/` (girişli)
2. Ana sayfa kartı gerekiyorsa `lib/pages.ts`'e ekle
3. Veri DB'den geliyorsa action'da public read / admin mutasyon ayrımına dikkat et

---

## Dış Entegrasyonlar

- **AI Chat:** `POST /api/ai-chat` → `AI_BACKEND_URL` env'deki dış servise proxy
- **Kalori takibi:** `POST /api/calorie-vision` → `CALORIE_API_URL`
- **Görseller:** Vercel Blob (private) → `/api/blob-image` proxy'siyle servis edilir; Unsplash remote pattern

`.env.local` anahtarları: `DATABASE_URL`, `JWT_SECRET`, `BLOB_READ_WRITE_TOKEN`, `AI_BACKEND_URL`, `CALORIE_API_URL` (+ seed için `SEED_ADMIN_PASSWORD`, `SEED_STAFF_PASSWORD`)

---

## Geliştirme

```bash
npm run dev        # Turbopack dev server (localhost:3000)
npm run build      # Production build
npm run db:push    # schema.ts → Neon (şema değişikliği akışı)
npm run db:seed    # Seed (dikkat: bazı tabloları sıfırlar)
npm run db:studio  # Drizzle Studio
```

**Bilinen sorun:** `npm run lint` eslintrc circular-config hatasıyla bozuk (koddan bağımsız, config sorunu).

---

## Repository

- **GitHub:** `https://github.com/VeliCanAydin/hotel-qr-page`
- **Branch:** `main`
