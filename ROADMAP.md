# Roadmap

Üç fazlı geliştirme planı. Faz ayrımı **efor + risk + bağımlılık** üçlüsüne göre yapıldı:
Faz 1 güveni sağlar (bug'sız taban), Faz 2 ölçeği ve operasyonu sağlar, Faz 3 ürünü büyütür.

---

## Faz 1 — Hemen halledilebilecekler

Yeni altyapı gerektirmeyen, izole ve çoğu bugünkü davranışı düzelten işler.

- [x] **Timezone sabitleme** — `lib/reservations.ts`'teki `todayISO()` sunucu saatine bakıyor;
  Vercel UTC'de çalıştığı için misafir erişimi Türkiye saatiyle 00:00–03:00 arasında yanlış
  hesaplanıyor. Tarih üretimi `Europe/Istanbul`'a sabitlenecek; aynı deseni kullanan diğer
  yerler (dashboard istatistikleri, seed) aynı yardımcıya bağlanacak.
- [x] **Login sorgusuna `checkIn <= today` koşulu** — bugün çıkan/giren misafir çakışmasında
  yanlış rezervasyona giriş ihtimalini kapatır.
- [x] **Sipariş anında oda numarasını DB'den okuma** — `createRoomServiceOrder` oda numarasını
  JWT'den değil `findActiveReservation` sonucundan alacak. Oda değişikliği senaryosunda
  siparişin yanlış kapıya gitmesini önler.
- [x] **AI chat route'una timeout + temel koruma** — dış servise giden `fetch`'e
  `AbortSignal.timeout`, yanıttaki `cost_usd` loglama, istek gövdesine boyut sınırı.
  (Gerçek rate limit Faz 2'de — KV gerektiriyor.)
- [x] **Check-out sırasında açık sipariş uyarısı** — Guest List'te check-out yaparken o odanın
  tamamlanmamış siparişi varsa confirm dialog'da gösterilecek.

## Faz 2 — Orta efor, yüksek kazanç

Yeni bir desen ya da küçük bir altyapı parçası isteyen, tasarım riski düşük işler.

- [x] **Public içerik cache'i** — `cacheComponents` açıldı; public okumalar `lib/content.ts`'te
  `use cache` + `cacheTag` ile cache'leniyor (tag'ler `lib/cache-tags.ts`), admin mutasyonları
  `updateTag` ile anında invalidate ediyor. Public rotalar PPR'a geçti; layout'lardaki oturum
  kontrolleri Suspense'e taşındı. Yan kazanım: `getHotelInfo` action'ı artık admin-auth'lu
  (Wi-Fi şifresi public endpoint'ten sızmıyor).
- [ ] **Rate limiting (login + AI chat)** — Upstash Redis (Vercel Marketplace) ile IP/oturum
  bazlı sınır. Login brute-force yüzeyini ve AI maliyet riskini kapatır.
- [x] **Orders/support pagination** — orders ve support ekranları en yeni 100 kayıtla açılıyor,
  `?limit=` + "Load older" ile eskiler yükleniyor; "yeni kayıt" bildirimi id karşılaştırmasına
  geçirildi (eski sayfa yüklenince yanlış toast atmıyor).
- [x] **Housekeeping hızlı istek butonları** — portal ana sayfasında "Quick Requests" kartı
  (havlu / temizlik / buklet / geç checkout). Oda+isim doğrulanmış oturumdan geliyor; oda başına
  aynı türde tek açık istek (spam koruması). Admin support ekranına mevcut polling'le düşüyor.
- [x] **Menü öğesi geçici kapatma** — `room_service_items.is_available` kolonu + admin ekranında
  Switch ("Sold out"). Kapalı öğe misafir menüsünden gizleniyor (cache tag'iyle anında) ve
  sipariş action'ında reddediliyor. Not: restoran menüleri şablon-tabanlı yönetildiği için bu
  toggle bilinçli olarak yalnız oda servisinde; a-la-carte tarafı ayrı bir canlı-menü UI'ı ister.

## Faz 3 — En zorlayıcılar

Her biri kendi başına mini proje; başlamadan önce ayrıca tasarım konuşması gerektirir.

- [ ] **Çoklu dil (i18n)** — içerik tablolarına çeviri modeli, admin'e çeviri girişi UI'ı,
  runtime i18n katmanı, AI chat dil farkındalığı. En stratejik ama en yayılgan iş.
- [ ] **Restoran/spa slot rezervasyonu** — kapasiteli zaman dilimi modeli (slot tablosu,
  çakışma kontrolü, iptal akışı), admin doluluk ekranı, misafir takvim UI. Eşzamanlılık
  (aynı slota iki kişi) doğru kurgulanmalı.
- [x] **Web Push bildirimleri** — sipariş durumu (onay/teslim/iptal), destek isteği yanıtı ve
  check-in onayı push atıyor. `web-push` + VAPID (`lib/push.ts`, env: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`,
  `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`), `push_subscriptions` tablosu rezervasyon koduna bağlı,
  `public/sw.js` yalnız push (offline kapsam dışı). Portal ana sayfasında izin kartı; iOS'ta
  ana ekrana ekleme yönergesi gösteriliyor (push yalnız kurulu PWA'da). Check-out subscription'ları
  siliyor; push servisi 404/410 dönen endpoint'ler otomatik temizleniyor.
- [ ] **Folyo/harcama özeti + express checkout** — önce sistem-içi harcamaların (oda servisi)
  özeti, tam sürüm PMS entegrasyonuna bağlı.
