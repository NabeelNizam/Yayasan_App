# Temuan kandidat optimasi query dan kode

Status: analisis saja. Tidak ada perubahan kode aplikasi atau pengukuran performa baru dalam dokumen ini. Urutkan pekerjaan berdasarkan bukti, bukan menganggap semua kandidat sebagai penyebab stall.

## Prioritas 0 — selesaikan antrean koneksi Payload

**Bukti.** `src/payload.config.ts:33-38` menetapkan `pool.max: 1`. Paket terpasang `node_modules/@payloadcms/db-postgres/dist/connect.js:4-49` memanggil `pool.connect()` saat init tanpa `release()`. Pada `node_modules/pg-pool/index.js:190-232`, permintaan koneksi berikutnya masuk antrean ketika pool penuh; `pool.query()` juga memanggil `connect()` (`:431-449`). `src/features/tentang-kami/getContent.ts:27-30` menjalankan `findGlobal()` setelah `getPayload()`. Route health memiliki pool terpisah dan melepas client (`src/app/api/health/ready/route.ts:19-29`). Ini adalah kandidat akar masalah yang lebih kuat daripada optimasi SQL biasa. Durasi tepat 90 detik–4 menit belum dapat dijelaskan hanya dari pembacaan kode.

**Cara memastikan.** Route diagnostik `src/app/api/timing/route.ts` sekarang sudah memisahkan `initMs`, `queryMs`, serta `total/idle/waiting`. Jalankan beberapa request secara berurutan; catat nilai dan log server. Jika `initMs` pendek, `queryMs` tertahan, `total=1`, `idle=0`, dan `waiting` bertambah, antrean pool terbukti. Jangan log URL/kredensial DB. Uji juga pada proses baru untuk membedakan init dari HMR.

**Arah perbaikan untuk agen pelaksana.** Cari versi adaptor Payload yang memperbaiki pelepasan client; jika belum ada, buat patch terkelola pada adaptor agar client hasil pemeriksaan koneksi dilepas di `finally` sebelum query lain. Uji jalur reconnect juga. Menaikkan `max` menjadi 2 hanya uji pembeda/mitigasi sementara: peminjaman yang tidak dilepas tetap menghabiskan slot setelah reconnect. Jangan menyunting `node_modules` sebagai solusi permanen. Validasi request berulang, migrasi, dan Vercel dengan batas pool yang dipilih.

## Prioritas 1 — relay outbox: transaksi menahan slot sambil memanggil Payload

**Bukti.** `src/app/api/outbox/relay/route.ts:15-28` membuka `payload.db.drizzle.transaction()`, memilih maksimum 20 baris dengan `FOR UPDATE SKIP LOCKED`, lalu memanggil `payload.update()` satu per satu di dalam callback. Pemanggilan `payload.update()` tidak diberi `req` atau transaksi Drizzle yang sedang aktif. Karena `pool.max: 1`, transaksi dapat menahan satu-satunya koneksi sementara update meminta koneksi lain. Ini risiko deadlock terpisah; belum ada reproduksi runtime pada endpoint ini. Kode juga membuat hingga 20 operasi update serial per batch.

**Cara memastikan.** Dengan satu item `pending` di DB uji, jalankan relay dan amati pool `waitingCount`, status item, serta durasi transaksi. Jangan gunakan item produksi untuk eksperimen. Periksa apakah update Payload memiliki hooks/access yang wajib dipertahankan sebelum mengubah cara update.

**Arah perbaikan.** Jalankan update pada transaksi yang sama melalui mekanisme transaksi Payload yang didukung, atau gunakan satu SQL `UPDATE ... RETURNING` dalam transaksi yang sama bila hooks/access memang tidak diperlukan. Pertahankan semantik klaim atomik dan `SKIP LOCKED`; jangan memindahkan update keluar transaksi tanpa rancangan klaim yang aman. Ukur jumlah round trip sebelum/sesudah.

## Prioritas 2 — sinkronisasi PHBI: lookup per baris

**Bukti.** `src/features/sync/phbi/sync.ts:14-32` melakukan satu `payload.find()` dengan filter `rowKey` untuk setiap baris CSV, lalu satu `update()` atau `create()` secara serial. Untuk N baris, sedikitnya sekitar 2N operasi DB sebelum pencatatan sync run. `rowKey` sudah memiliki unique index (`src/collections/PhbiRecap.ts:11`; `docs/sql/01-init-schema.sql:516`), sehingga menambah index yang sama bukan optimasi.

**Cara memastikan.** Catat jumlah baris dan waktu tahap fetch, parse, lookup, serta write pada dataset kecil dan representatif. Periksa duplicate `rowKey` dalam CSV dan apakah hooks/access collection perlu berjalan per baris.

**Arah perbaikan.** Langkah kecil: ambil `rowKey` dan `id` yang relevan sekali, buat peta di memori, lalu lakukan write hanya untuk baris yang berubah. Jika volume masih besar dan profiling membuktikan write serial dominan, pertimbangkan upsert berbasis unique `row_key` dalam batch; cek hooks/access dan semantik overwrite sebelum memakai SQL langsung. Hindari paralel tanpa batas terhadap pool kecil.

## Prioritas 3 — pembacaan global `site-settings` terlalu luas

**Bukti.** `src/features/tentang-kami/getContent.ts:27-33` hanya memakai `tentangKami`, tetapi `findGlobal()` tidak mengirim `select`. `src/globals/SiteSettings.ts` juga memuat `kontak`, `sosial`, dan `sheetMapping`. Halaman sudah memiliki `revalidate = 300` (`src/app/(site)/tentang-kami/page.tsx:10`), jadi jangan langsung menambah lapisan cache lain. Belum ada ukuran payload atau query plan yang membuktikan ini mahal.

**Cara memastikan.** Setelah masalah pool selesai, ukur `findGlobal()` saja serta jumlah query/ukuran respons dengan dan tanpa `select` untuk `tentangKami`. Pastikan field array `misi` tetap lengkap. Bandingkan hit pertama dan hit ISR berikutnya.

**Arah perbaikan.** Jika perbedaan terukur, gunakan opsi `select` Payload untuk mengambil grup `tentangKami` saja. Jangan pecah satu global menjadi beberapa query. Pertahankan perilaku fallback yang kini dipakai halaman.

## Kandidat bersyarat — indeks antrean relay

**Bukti.** Query `src/app/api/outbox/relay/route.ts:17` memakai `WHERE status='pending' ORDER BY id LIMIT 20`. Skema saat ini memiliki indeks tunggal `webhook_inbox_status_idx` (`docs/sql/01-init-schema.sql:543-546`) dan primary key pada `id`. Belum ada `EXPLAIN (ANALYZE, BUFFERS)` atau ukuran tabel; indeks baru belum dapat dibenarkan.

**Cara memastikan.** Pada data representatif, ambil `EXPLAIN (ANALYZE, BUFFERS)` untuk SELECT relay dan lihat waktu, sort, serta jumlah baris yang dibaca. Pertimbangkan indeks parsial untuk status pending dan urutan id hanya jika plan/volume menunjukkan manfaat nyata. Migrasi indeks harus diperlakukan terpisah dari perbaikan pool.

## Urutan kerja dan kontrak verifikasi

1. Simpan baseline `GET /api/timing` berulang dan pool stats; selesaikan Prioritas 0 dahulu.
2. Uji relay dengan satu item pending agar risiko transaksi Prioritas 1 terkonfirmasi atau gugur.
3. Profil PHBI dengan ukuran input nyata; optimasi hanya tahap yang dominan.
4. Profil `site-settings`; lakukan `select` bila ada pengurangan bermakna.
5. Tambah indeks hanya setelah query plan membuktikan kebutuhan.

Setiap perubahan harus menjaga hasil fungsional dan dibuktikan dengan pengukuran sebelum/sesudah, `npx tsc --noEmit`, `npx vitest run`, dan `npm run build`. Jangan menyimpulkan stall selesai dari build/test saja; ukur request berulang. Jangan menambahkan ORM atau cache baru untuk kandidat ini.
