# Çoklu Dil (i18n) Uygulama Planı

> ROADMAP.md Faz 3 — "Çoklu dil (i18n)" maddesinin uygulama planı.
> Tasarım kararları verilmiştir; bu doküman uygulayıcı için yazılmıştır.
> Uygulamaya başlamadan önce CLAUDE.md'yi oku — özellikle Auth & RBAC, cache ve
> dosya adlandırma (kebab-case) kuralları bu planın her adımında geçerli.

---

## 0. Verilmiş Kararlar (yeniden tartışma açma)

| Konu | Karar | Gerekçe |
|------|-------|---------|
| Dil seti | `en` (temel/fallback), `tr`, `de`, `ru` | Antalya oteli misafir profili. Tek `const LOCALES` sabitinden yönetilecek; dil eklemek = sabite ekle + messages dosyası + admin'den çeviri gir. |
| Statik UI çevirisi | `next-intl` + JSON messages | App Router standardı. Uyumsuzluk çıkarsa fallback planı: Bölüm 8. |
| Locale taşıyıcı | **URL segmenti** `/[locale]/...` (cookie DEĞİL) | Proje `cacheComponents` + PPR kullanıyor (bkz. `next.config.ts`, `lib/content.ts`). Cookie okumak sayfayı dinamikleştirip PPR'ı bozar; URL segmenti locale'i cache anahtarının doğal parçası yapar — her dil kendi statik shell'ini alır. |
| DB içerik çevirisi | Tek polimorfik `content_translations` tablosu | Mevcut kolonlar (`name`, `description`...) değişmez, İngilizce temel dil olarak yerinde kalır. Çevirisi olmayan alan otomatik İngilizce'ye düşer (fallback). ~12 içerik tablosuna ayrı `_i18n` tablosu ya da JSONB dönüşümü yayılganlığı yüzünden reddedildi. |
| Admin çeviri UI'ı | Tek generic "Translations" sayfası | Mevcut edit formlarına dil sekmeleri eklemek her formu elden geçirmek demek; generic sayfa tek yeni ekran. |
| Admin paneli dili | **Kapsam DIŞI** — dashboard tek dil kalır | İş yükünü yarıya indirir; personel tek dil kullanıyor. |
| Misafir üretimi içerik | Çevrilmez (feedback, destek mesajı, sipariş notu) | Serbest metin; personel olduğu gibi görür. |

Kapsam dışı ayrıca: RTL desteği, admin panelinin çevirisi, SEO hreflang optimizasyonu (QR-tabanlı site, arama trafiği hedef değil — yine de `generateMetadata`'da `alternates.languages` eklemek serbest, zorunlu değil).

---

## 1. Mevcut Durum (uygulayıcı için özet)

- Misafir yüzeyleri: `app/(main)/` (59 public sayfa/klasör), `app/(guest)/portal/`, `app/(auth)/login/`. Hepsi İngilizce hardcoded string kullanıyor. Kodda hiç i18n izi yok.
- Public içerik okumaları: `lib/content.ts` — hepsi `'use cache'` + `cacheTag` (tag'ler `lib/cache-tags.ts`). Admin mutasyonları `updateTag` ile invalidate ediyor. **Bu mekanizma bozulmamalı.**
- Route koruması: `proxy.ts` (Next 16 middleware) — `matcher: ['/portal/:path*', '/dashboard/:path*']`. Locale segmenti gelince portal matcher'ı ve pathname kontrolleri güncellenmeli.
- İçerik tabloları: `lib/db/schema.ts`. Şema değişikliği akışı: `schema.ts` düzenle → `npm run db:push`. **Ad-hoc migration script'i yazma.**
- UI sabitleri: `lib/types/*.ts` içinde `categoryLabels`, `categoryColors` gibi İngilizce etiket map'leri var — bunlar messages'a taşınacak (renk/ikon map'leri kalır, yalnız insan-okur etiketler taşınır).
- Bilinen sorun: `npm run lint` bozuk (config sorunu, koddan bağımsız). Doğrulama için `npm run build` kullan.

---

## 2. Adım 1 — next-intl Kurulumu + `[locale]` Routing

**Amaç:** Tüm misafir yüzeyleri `/{locale}/...` altında, statik UI string'leri messages dosyalarında, dil değiştirici çalışır durumda. Bu adımın sonunda içerik hâlâ tek dilli (DB çevirisi Adım 2'de) ama iskelet tamam.

### 2.1 Ön doğrulama (İLK İŞ)

`next-intl`'in projedeki Next.js 16 + `cacheComponents` kombinasyonuyla uyumunu doğrula:
küçük bir sayfada `setRequestLocale` + `useTranslations` + `'use cache'`'li bir
reader'ı birlikte çalıştırıp `npm run build` çıktısında sayfanın statik/PPR
kaldığını kontrol et. Uyumsuzluk görürsen Bölüm 8'deki fallback'e geç —
mimarinin geri kalanı değişmez.

### 2.2 Kurulum

```bash
npm i next-intl
```

- `i18n/routing.ts`:
  ```ts
  import { defineRouting } from 'next-intl/routing'

  export const LOCALES = ['en', 'tr', 'de', 'ru'] as const
  export type Locale = (typeof LOCALES)[number]

  export const routing = defineRouting({
    locales: LOCALES,
    defaultLocale: 'en',
    // localePrefix: 'always' — QR kök URL'i middleware Accept-Language ile yönlendirir
  })
  ```
- `i18n/request.ts` — `getRequestConfig` ile messages yükleme (next-intl standart kurulumu).
- `i18n/navigation.ts` — `createNavigation(routing)` → locale-farkındalıklı `Link`, `redirect`, `usePathname`, `useRouter`. **Misafir yüzeylerindeki tüm `next/link` ve `next/navigation` importları bunlarla değiştirilecek.**
- `next.config.ts` → `createNextIntlPlugin` ile sarmala (mevcut config'i bozmadan).
- `messages/en.json`, `messages/tr.json`, `messages/de.json`, `messages/ru.json`. Namespace düzeni sayfa/feature bazlı (`home`, `roomService`, `portal`, `login`, `common`...). en + tr elle/dikkatle doldurulur; de + ru için ilk geçişte en üzerinden çeviri üret, dosya başına `// machine-translated, review pending` notu düş (otel sonradan düzelttirir).

### 2.3 Route taşıma

Hedef yapı (admin ve api DOKUNULMAZ):

```
app/
├── [locale]/
│   ├── layout.tsx        # NextIntlClientProvider + setRequestLocale + generateStaticParams
│   ├── (main)/           # mevcut app/(main) buraya taşınır
│   ├── (guest)/portal/   # mevcut app/(guest) buraya taşınır
│   └── (auth)/login/     # mevcut app/(auth) buraya taşınır
├── (admin)/dashboard/    # YERİNDE KALIR (locale'siz)
└── api/                  # YERİNDE KALIR
```

- Kök `app/layout.tsx` minimal kalır (html/body); locale layout'u `app/[locale]/layout.tsx` provider'ları kurar.
- `generateStaticParams` ile 4 locale statik üretilir; **her layout ve page'de `setRequestLocale(locale)`** çağrılır (PPR/statik rendering için şart — next-intl dokümantasyonundaki "static rendering" bölümü).
- Login sayfası locale altında (`/en/login`) — personel de buradan giriyor, sorun değil; dashboard'a giden linkler aynen çalışır.
- Taşıma sırasında route group isimleri korunur; dosya adları kebab-case kalır.

### 2.4 Middleware kompozisyonu (`proxy.ts`)

next-intl middleware'i mevcut auth proxy'siyle **tek fonksiyonda** compose edilir:

```ts
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin: locale'siz, önce ele al — intl middleware'e hiç girmesin
  if (pathname.startsWith('/dashboard')) { /* mevcut admin bloğu aynen */ }
  if (pathname.startsWith('/api')) return NextResponse.next()

  // Misafir yüzeyleri: önce locale çözümü/redirect (Accept-Language dahil)
  const response = intlMiddleware(request)

  // Portal koruması: pathname'den locale'i soyarak kontrol et
  const pathnameWithoutLocale = pathname.replace(/^\/(en|tr|de|ru)(?=\/|$)/, '')
  if (pathnameWithoutLocale.startsWith('/portal')) {
    // mevcut guest-session doğrulaması aynen; redirect hedefi `/${locale}/login`
  }

  return response
}

export const config = {
  // intl için genişletilmiş matcher — statik dosyalar ve api hariç her şey
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
```

Dikkat:
- Locale regex'ini elle yazmak yerine `LOCALES`'ten üret (dil ekleyince kırılmasın).
- Guest-session redirect'leri artık locale'li login'e gitmeli (`/${locale}/login`), yoksa redirect zinciri oluşur.
- Kök `/` isteği: intl middleware Accept-Language'a göre `/en` vb.'ye yönlendirir — QR kod davranışı budur, ekstra iş yok.

### 2.5 String çıkarma (en hacimli mekanik iş)

- Kapsam: `app/[locale]/**` altındaki tüm sayfa/client bileşenleri + `components/guest/*` + misafir yüzeyinde kullanılan `components/[feature]/*` bileşenleri + sonner toast metinleri + zod hata mesajları (misafir formları) + `lib/types/*.ts`'teki insan-okur etiket map'leri (`categoryLabels` vb. → messages'a; **renk/ikon map'leri tipiyle birlikte yerinde kalır**, anahtar üzerinden eşleşir).
- Server bileşenlerde `getTranslations`, client'ta `useTranslations`.
- `components/ui/*` (shadcn primitive'leri) string içermez, dokunma.
- Sistematik ilerle: sayfa sayfa, her sayfanın namespace'i messages'ta ayrı blok. Yarım kalan sayfa bırakma — bir sayfa ya tamamen çevrilmiştir ya hiç.

### 2.6 Dil değiştirici

- Public site header'ı ve `components/guest/guest-header.tsx`'e dil seçici (dropdown, 4 dil, mevcut shadcn `DropdownMenu`).
- `i18n/navigation.ts`'teki `usePathname` + `router.replace(pathname, { locale })` deseniyle aynı sayfada dil değişimi.

### 2.7 Adım 1 doğrulaması

- `npm run build` temiz; build çıktısında `/[locale]` sayfaları statik/PPR görünür (`○` / `◐` işaretleri).
- `/` → Accept-Language'a göre redirect; `/tr/room-service` Türkçe UI; dil değiştirici sayfayı koruyarak dil değiştiriyor.
- Portal: locale'li URL'de login → portal akışı çalışıyor; süresi geçmiş oturum `/{locale}/login`'e düşüyor.
- Dashboard hâlâ locale'siz ve davranışı değişmemiş.

---

## 3. Adım 2 — `content_translations` Tablosu + Locale-Farkındalıklı Okuma

**Amaç:** DB içeriği (menüler, spa, etkinlikler...) seçili dilde servis edilir; çevirisi olmayan alan İngilizce (temel kolon) gösterilir.

### 3.1 Şema (`lib/db/schema.ts`'e ekle → `npm run db:push`)

```ts
export const contentTranslations = pgTable('content_translations', {
  id: serial('id').primaryKey(),
  entityType: text('entity_type').notNull(), // TRANSLATABLE_ENTITIES anahtarı
  entityId: text('entity_id').notNull(),     // hedef tablonun pk'sı (serial pk'lar String() ile)
  locale: text('locale').notNull(),          // 'tr' | 'de' | 'ru' (en temel dil, satırı olmaz)
  field: text('field').notNull(),            // 'name' | 'description' | 'title' ...
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('content_translations_unique').on(t.entityType, t.entityId, t.locale, t.field),
  index('content_translations_lookup_idx').on(t.entityType, t.locale),
])
```

### 3.2 Çevrilebilir alan kaydı — tek kaynak

Yeni dosya `lib/i18n-entities.ts` (server/client ortak, saf sabit):

```ts
export const TRANSLATABLE_ENTITIES = {
  hotel_info:         { table: 'hotel_info',          fields: ['cancellationPolicy', 'aboutText'] },
  beach_pools_info:   { fields: ['beachDescription', 'beachNotes', 'mainPoolDescription',
                                  'indoorPoolDescription', 'kidsPoolDescription', 'generalNotes'] },
  spa_service:        { fields: ['name', 'description', 'tags'] },
  wellness_service:   { fields: ['name', 'description'] },
  restaurant:         { fields: ['name', 'cuisine', 'description'] },
  menu_item:          { fields: ['name', 'description'] },
  room_service_item:  { fields: ['name', 'description'] },
  event:              { fields: ['title', 'description', 'location'] },
  nearby_guide_item:  { fields: ['name', 'note', 'distance', 'eta'] },
  kids_service:       { fields: ['title', 'description'] },
  kids_service_item:  { fields: ['trigger', 'content'] },
  kids_activity:      { fields: ['event'] },
  menu_category:      { fields: ['label'] },
  allergen:           { fields: ['label'] },
} as const
```

(İmza örnektir — her girdiye admin UI'da gösterilecek insan-okur başlık ve
kaynak tabloya erişim bilgisi ekle; uygulamada netleştir.)

### 3.3 Okuma katmanı

Yeni dosya `lib/translations.ts` — **server-only, `'use server'` DEĞİL** (CLAUDE.md kuralı: misafir verisi döndüren modüller action olamaz; bu modül public içerik döndürüyor ama aynı desene uy):

```ts
// entityType+locale için tüm çevirileri tek sorguda çek, Map'e indir
export async function getTranslationMap(entityType, locale): Promise<Map<string, Record<string, string>>>

// rows üzerine çevirileri uygula — boş/eksik value'da temel (İngilizce) alan kalır
export function applyTranslations<T extends { id: string | number }>(
  rows: T[], map: Map<...>, fields: readonly (keyof T & string)[],
): T[]
```

`lib/content.ts` değişikliği:
- Her `getPublicX()` fonksiyonu `locale: Locale` parametresi alır. `'use cache'` argümanları cache anahtarına dahil eder → dil başına ayrı cache girdisi, ekstra iş yok.
- `locale === 'en'` ise çeviri sorgusu atlanır (temel dil).
- Her fonksiyona mevcut tag'lerine EK olarak `CONTENT_TAGS.translations` tag'i eklenir (`lib/cache-tags.ts`'e yeni tag). Admin çeviri kaydettiğinde `updateTag(CONTENT_TAGS.translations)` → tüm dillerin cache'i tazelenir. (İçerik mutasyonları zaten kendi tag'lerini düşürüyor; o davranış aynen kalır.)
- Çağıran sayfalar `params`'tan locale'i geçirir.

### 3.4 Silme tutarlılığı

Polimorfik tabloya FK kurulamaz. `lib/actions/*` içindeki **her içerik silme action'ına** tek satır ekle: ilgili `entityType` + `entityId` çeviri satırlarını da sil. Bunu unutmamak için `lib/translations.ts`'e `deleteTranslationsFor(entityType, entityId)` helper'ı koy ve silme action'larını tara (spa, wellness, restaurants, menu-items, room-service-items, events, nearby-guide, kids-*, menu kategorileri, allergens).

### 3.5 ⚠️ Menü şablonları — uygulama sırasında araştırılacak tek nokta

Restoran menüleri şablon-tabanlı yönetiliyor (`menu_templates` → `menu_items`). **`lib/actions/menu-templates.ts`'i oku:** şablon uygulanırken `menu_items` satırları silinip yeni id'lerle mi yaratılıyor?
- Evet ise: `menu_item` çevirileri şablon uygulamasında kaybolur → çeviriyi `menu_template_items` üzerinden yap (`entityType: 'menu_template_item'`) ve şablon uygulanırken çevirileri yeni `menu_items` id'lerine kopyala; **ya da** daha basiti, şablon uygulama action'ı item id'lerini deterministik üretiyorsa (`templateItemId` bazlı) çeviriler doğal taşınır.
- Karar kriteri: çeviri emeği şablon uygulamasında asla sessizce kaybolmamalı.

### 3.6 Adım 2 doğrulaması

- `/tr/spa` DB'deki Türkçe çeviriyi gösteriyor; çevirisi girilmemiş alan İngilizce.
- Admin'de içerik düzenle → tüm dillerde anında yansıyor (tag invalidation).
- Bir entity sil → `content_translations`'ta satırı kalmıyor (Drizzle Studio ile bak).

---

## 4. Adım 3 — Admin "Translations" Sayfası

**Amaç:** Personelin çeviri girebildiği tek generic ekran.

Yeni admin sayfası checklist'i (CLAUDE.md) HARFİYEN uygulanır:

1. `app/(admin)/dashboard/content/translations/page.tsx` (server; `export const dynamic = 'force-dynamic'`) + `translations-client.tsx` (`'use client'`).
2. `ADMIN_PAGE_PERMISSIONS`'a (`lib/permissions.ts`) kayıt ekle — **eklemezsen sidebar'da görünmez ve Super Admin dışında kimse giremez** (fail-closed).
3. `DEFAULT_ADMIN_ROLE_PRESETS`'te Content Manager'a href'i ekle.
4. Tüm action'lar `await requireAdmin('/dashboard/content/translations')` ile başlar.

### UI deseni (mevcut admin konvansiyonu: local state + optimistic + `toast.promise`)

- Üstte iki `Select`: entity tipi (TRANSLATABLE_ENTITIES'ten) + hedef dil (tr/de/ru).
- Altta tablo: satır = entity × alan; kolonlar = **İngilizce kaynak (salt-okunur)** | **çeviri (Textarea)**. Kaynak metin ilgili tablodan uncached çekilir (admin sayfaları `lib/actions/*` uncached getter'ları kullanır — `lib/content.ts`'e DOKUNMA, o misafir tarafı).
- Kaydet: değişen hücreleri toplu upsert eden tek action (`onConflictDoUpdate` unique index üzerinden). Boş bırakılan çeviri satırı DB'den silinir (fallback'e dönüş). Action sonunda `updateTag(CONTENT_TAGS.translations)`.
- Eksik çeviri sayacı (kaç alan boş) küçük bir Badge ile gösterilirse personel için faydalı — düşük efor, ekle.
- İleride "AI ile öner" butonu eklenebilir (AI_BACKEND_URL üzerinden) — bu planda KAPSAM DIŞI, boşuna başlama.

**Adım 3 doğrulaması:** Content Manager rolüyle girip çeviri kaydet → misafir sitesinde anında görünüyor; Service Manager sayfayı göremiyor (sidebar + doğrudan URL → `/dashboard`'a redirect).

---

## 5. Adım 4 — AI Chat, Push ve Kalan Yüzeyler

### 5.1 AI chat dil farkındalığı

- `app/api/ai-chat/route.ts`: istek gövdesine `locale` alanı ekle (client zaten URL'den biliyor), zod/manuel validasyonla `LOCALES` içinde olduğunu doğrula, dış servise (`AI_BACKEND_URL`) payload'da ilet. Backend prompt'una "yanıtı bu dilde ver" talimatını payload nasıl taşıyorsa o şekilde ekle (route'taki mevcut forward şeklini incele).
- `guest-context` route'u misafir bağlamı üretiyorsa oradaki içerik okumalarına da locale geçir.

### 5.2 Push bildirimleri

- `reservations` tablosuna `locale: text('locale').notNull().default('en')` kolonu (`db:push`).
- Misafir login olduğunda (`lib/actions/guest-auth.ts`) URL'deki locale rezervasyona yazılır; portalda dil değiştirince de güncellenir (küçük bir action).
- Push metinleri şu an server'da hardcoded (sipariş durumu, destek yanıtı, check-in — `lib/push.ts` çağıran action'lar). Yeni dosya `lib/push-messages.ts`: 4 dilli düz sabit sözlük (`{ orderConfirmed: { en, tr, de, ru }, ... }`). next-intl'e bağlama — server action bağlamında request locale'i yok, rezervasyonun `locale` kolonundan seçilir.

### 5.3 Kalan küçük işler

- `lib/dates.ts`: tarih formatlama fonksiyonlarına `locale` parametresi (`Intl.DateTimeFormat(locale, ...)`); misafir yüzeyindeki çağrıları güncelle. Admin çağrıları olduğu gibi kalır.
- Allergen etiketleri: `allergens` tablosu `content_translations` kapsamında (Adım 2'de tanımlı) — menü sayfalarının allergen render'ının çevrilmiş etiketi kullandığını doğrula (`lib/data/allergens.ts` runtime'da da kullanılıyor, CLAUDE.md notu; oradan gelen etiketler varsa aynı map'ten geçir).
- `public/sw.js`: push payload'ı metni server'dan hazır alıyorsa değişiklik gerekmez — kontrol et.

---

## 6. Önerilen PR Bölümlemesi

| PR | İçerik | Risk |
|----|--------|------|
| 1 | next-intl kurulum + route taşıma + proxy compose + messages iskeleti (yalnız `common` + 2-3 sayfa) | Yüksek (yapısal) — küçük tut, önce bunu indir |
| 2..n | Kalan sayfaların string çıkarımı (sayfa grupları halinde) | Düşük, mekanik |
| n+1 | `content_translations` + `lib/translations.ts` + `lib/content.ts` locale + silme tutarlılığı | Orta |
| n+2 | Admin Translations sayfası | Düşük |
| n+3 | AI chat + push + tarihler + allergen | Düşük |

Her PR'da `npm run build` zorunlu doğrulama (lint bozuk, kullanma). Davranış doğrulaması için dev server + oda **777** / soyad **test** demo girişi (seed).

---

## 7. Tuzaklar (uygulayıcı için kritik hatırlatmalar)

1. **`cookies()`/`headers()` çağırma** misafir sayfalarında — PPR'ı bozar. Locale HER ZAMAN `params`'tan gelir.
2. **`setRequestLocale`'i her layout + page'de çağır**, yoksa sayfa dinamiğe düşer; build çıktısından kontrol et.
3. `'use cache'` fonksiyonlarına locale'i **parametre** olarak geçir — fonksiyon içinde global/context'ten locale okumaya çalışma (cache anahtarına girmez, yanlış dil cache'lenir).
4. Yeni admin action'larının hepsi `requireAdmin('/dashboard/content/translations')` ile başlar — proxy sadece sayfayı korur, action'lar her yerden POST edilebilir.
5. `lib/permissions.ts`'e sayfa kaydını unutursan sistem fail-closed: kimse giremez, sidebar'da görünmez.
6. Şema değişikliklerinde ad-hoc migration script'i YAZMA — `schema.ts` → `npm run db:push`.
7. `npm run db:seed` bazı tabloları sıfırlar — çeviri test verisi girdikten sonra seed çalıştırırsan içerik id'leri değişip çevirileri öksüz bırakabilir; test sırasını buna göre kur.
8. Tüm yeni dosyalar kebab-case; `components/ui/`'a feature bileşeni koyma.
9. Redirect hedefleri: guest-session düşünce `/${locale}/login` — locale'siz `/login`'e yönlendirme zinciri kurma.
10. `lib/translations.ts` ve `lib/push-messages.ts` server-only modül — `'use server'` ekleme (action'a çevirmek public endpoint yapar).

---

## 8. Fallback Planı (yalnız 2.1 doğrulaması başarısız olursa)

next-intl, `cacheComponents` ile uzlaşmaz çıkarsa (build'de sayfalar dinamiğe düşüyor ve çözülemiyorsa) minimal el yapımı katmana geç — mimarinin geri kalanı (URL segmenti, content_translations, admin UI) AYNEN geçerli kalır:

- `[locale]` segmenti ve proxy'de Accept-Language redirect'i elle (küçük bir util).
- `messages/*.json` aynı; `lib/i18n.ts`'te `getDictionary(locale)` (server) + locale'i client'a taşıyan hafif bir Context provider; `t('ns.key')` yerine `dict.ns.key` erişimi.
- Kaybedilen şey yalnız next-intl'in format API'ları ve navigation sarmalayıcıları — tarih formatları zaten `lib/dates.ts`'te, navigation için `/${locale}${href}` üreten küçük bir `LocaleLink` yeterli.

---

## 9. Bitiş Kriterleri (Definition of Done)

- [ ] 4 dilde misafir sitesi + portal + login; `/` Accept-Language redirect'i çalışıyor.
- [ ] Dil değiştirici her misafir sayfasında, sayfa bağlamını koruyarak çalışıyor.
- [ ] DB içeriği seçili dilde; eksik çeviri İngilizce fallback (asla boş alan yok).
- [ ] Admin Translations sayfası: Content Manager erişebiliyor, kaydet → misafir tarafında anında görünüyor.
- [ ] Silinen içerik çeviri satırı bırakmıyor; menü şablonu uygulanınca çeviriler kaybolmuyor (3.5 kararı uygulanmış).
- [ ] AI chat seçili dilde yanıt veriyor; push bildirimleri misafirin diliyle gidiyor.
- [ ] `npm run build` temiz; public sayfalar build çıktısında statik/PPR.
- [ ] ROADMAP.md'de i18n maddesi `[x]` işaretlenip mevcut madde formatına uygun kısa özet yazılmış; CLAUDE.md'ye i18n bölümü eklenmiş (locale mimarisi, TRANSLATABLE_ENTITIES, çeviri akışı).
