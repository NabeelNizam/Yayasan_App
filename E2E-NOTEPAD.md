# Notepad — E2E Testing (Playwright, real browser)

## Goal
Deteksi bug dini lewat E2E browser sungguhan (bukan hanya unit test), menutup semua flow.

## Keputusan user (verbatim intent)
- DB: **dev lokal + Supabase yang ada** (user: cek dulu apakah memberatkan jatah gratis).
  - Jawaban: TIDAK memberatkan. Smoke = SELECT saja; form tulis 1-2 baris kecil per run;
    rate limiter dibiarkan aktif (malah ikut teruji) dan mencegah spam. Yang bahaya itu loop
    tak terbatas — dilarang; maksimal 1 submission per case (+ 1 case khusus rate-limit).
- Data test: **penanda unik + auto-cleanup** setelah test (prefix E2E-TEST-<ts>).
- Admin login: **buat user admin test sementara lalu hapus** (email e2e-admin@test.local).
- CI: **lokal dulu** (npm run test:e2e), CI menyusul.

## Fakta repo (terverifikasi)
- Playwright browser SUDAH terpasang: chromium-1243 + headless shell. @playwright/test BELUM.
- Env: .env.local ada (DATABASE_URL, PAYLOAD_SECRET, RELAY_SECRET, NEXT_PUBLIC_SERVER_URL...).
- users di DB = 0  -> admin test wajib seed+teardown.
- Tabel relevan: contact_messages, donors, prayers, rate_limits, webhook_inbox, job_runs, users.

## Selector nyata (jangan karang)
### /kontak  (feedback-form.tsx)
- #name input, #message textarea, honeypot input[name=website]
- role=switch (anonymous), role=radio x5 (rating), tombol submit text 'Kirim Kritik & Saran'
- Sukses: heading 'Terima Kasih!'
### /donasi/[slug]  (donation-form.tsx)
- #donorName, #whatsapp, #email, #prayer, quick amount buttons, custom amount input (Rp prefix)
- submit text 'Donasi Sekarang'; sukses: heading 'Terima kasih!' + tombol 'Donasi Lagi'
- MIN/MAX dari @/types/donation
### Halaman uji error boundary: /test-throw, /widget-throw, /no-boundary
### Admin: /admin
### Health: /api/health, /api/health/ready

## Rencana test
1. smoke.spec.ts — 8 halaman utama: 200, tidak ada console.error/pageerror, gambar ke-render.
2. feedback.spec.ts — submit sukses + verifikasi DB + rate limit (6x -> ditolak).
3. donation.spec.ts — submit sukses + verifikasi donors + prayers; cleanup.
4. admin.spec.ts — login (seed user) + buat 1 koleksi + edit; teardown user.

## Status
- [x] Install @playwright/test + playwright.config.ts
- [x] helpers/seed + helpers/db (cleanup)
- [x] smoke.spec.ts            -> 8/8 PASS
- [x] feedback.spec.ts         -> 4/4 PASS
- [x] donation.spec.ts         -> 6/6 PASS
- [x] admin.spec.ts            -> 3/3 PASS
- [x] api.spec.ts              -> 7/7 PASS  (health, ready, donasi 501, relay auth+run)
- [x] errors.spec.ts           -> 6/6 PASS  (segment boundary, widget boundary, unbounded, 404, retry)
- [x] kajian.spec.ts           -> 4/4 PASS  (video/artikel/kitab/404)
- [x] Full suite 38/38 PASS, stabil 2x berturut (vs production build)
- [x] SELURUH route publik + API + error boundary kini tercakup

## BUG ditemukan & DIPERBAIKI oleh E2E (real browser, bukan unit test)
1. /images/publikasi/default-publikasi.svg tidak ada -> 404 di Hero TK + 6 gambar Dokumentasi.
2. /img/kegiatan-kami.svg tidak ada -> 404 banner /kegiatan.
3. fotbar.svg & tentang-kami.svg = 13.1 MB masing2 (JPEG dibungkus SVG, byte-identik!) ->
   browser gagal decode (naturalWidth=0). Ekstrak -> WebP 128 KB & 254 KB (~98% turun).
4. feedback-form.tsx membuang pesan error server -> user yg kena rate-limit diberi tahu
   "periksa rating dan pesan" (salah). Kini tampilkan pesan server sebenarnya.
5. donationSchema: donorName wajib min 3 char -> DONASI ANONIM selalu gagal (form kirim nama
   kosong saat anonim). Diperbaiki + regression test.
6. payload.config.ts pool.max:1 -> admin PATCH ~20.000 ms (timeout di UI). Naikkan ke 5 ->
   ~625 ms. (Supabase transaction pooler tidak pipeline; lihat docs.)

## Catatan penting (jangan ulangi)
- checkImages HARUS scroll halaman dulu (gambar lazy di bawah fold = naturalWidth 0).
- E2E dijalankan vs PRODUCTION build (next build && next start), bukan next dev:
  dev-server bikin 1 run penuh gagal/berhasil acak. Override: E2E_DEV=1.
- `/donasi/*.jpg` di data.ts = dead code (tabel campaigns & media KOSONG).
- SVG: JANGAN aktifkan dangerouslyAllowSVG.
- admin: /admin/login cocok dgn prefix /admin -> cek login harus exclude '/login'.
- Playwright TIDAK load .env.local -> globalSetup e2e/load-env.ts memuatnya.

## Catatan penting (jangan ulangi)
- checkImages HARUS scroll halaman dulu: gambar lazy di bawah fold = naturalWidth 0 (false positive).
- `/donasi/*.jpg` di data.ts = dead code (tabel campaigns & media KOSONG -> tidak dirender).
- SVG: JANGAN aktifkan dangerouslyAllowSVG (risiko XSS; Next skip optimasi SVG by design).
