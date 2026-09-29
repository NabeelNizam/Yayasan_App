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
- [x] smoke.spec.ts  -> 8/8 PASS
- [ ] feedback.spec.ts
- [ ] donation.spec.ts
- [ ] admin.spec.ts
- [ ] Jalankan semua, laporkan temuan bug nyata (jika ada)

## BUG ditemukan & DIPERBAIKI oleh E2E smoke (real browser)
1. `/images/publikasi/default-publikasi.svg` tidak ada -> 404 di Hero TK + 6 gambar Dokumentasi.
   FIX: buat placeholder SVG valid.
2. `/img/kegiatan-kami.svg` tidak ada -> 404 banner /kegiatan.
   FIX: buat placeholder SVG valid (gradient halus).
3. fotbar.svg & tentang-kami.svg = 13.1 MB masing2 (JPEG dibungkus SVG, byte-identik!) ->
   browser gagal decode (naturalWidth=0). FIX: ekstrak JPEG -> WebP 1200px (128 KB) &
   1920px (254 KB). Total turun ~26 MB -> 382 KB (~98%).

## Catatan penting (jangan ulangi)
- checkImages HARUS scroll halaman dulu: gambar lazy di bawah fold = naturalWidth 0 (false positive).
- `/donasi/*.jpg` di data.ts = dead code (tabel campaigns & media KOSONG -> tidak dirender).
- SVG: JANGAN aktifkan dangerouslyAllowSVG (risiko XSS; Next skip optimasi SVG by design).
