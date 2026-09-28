# Desain Arsitektur — Website Yayasan Masjid Al-Muhajirin

- **Tanggal:** 2026-09-27
- **Status:** **v3 — dimatangkan via siklus Metis → Oracle → Metis → Oracle. Confidence 97–98%. Siap untuk implementation plan setelah approval.**
- **Konteks:** Proyek Next.js yang di-handoff. Pihak perancang saat ini adalah pengembang luar yang mengeksplorasi repo dan merancang ulang arsitektur agar **resilient terhadap error** dan **scalable**.

---

## 1. Tujuan & Prinsip

**Tujuan utama (motif pemilik):** Resilience — publik tidak boleh down; CMS tetap bisa diakses; setiap modul harus tahan error secara terpisah (contoh: modul PHBI error tidak menjatuhkan modul lain).

**Prinsip yang dianut:**

1. **Isolasi kegagalan.** Error di satu modul/satu app tidak boleh merambat ke modul/app lain.
2. **Satu sumber kebenaran per data.** Sheet = Source of Truth; DB menyimpan snapshot resilient.
3. **Satu sumber aturan.** Validasi & tipe domain dipusatkan, tidak diduplikasi.
4. **Konsistensi > kepintaran.** Pola CRUD seragam di seluruh CMS.
5. **Jangan ikat ke vendor dini.** Payment gateway disiapkan sebagai "port", belum dipilih.

---

## 2. Kondisi Repo Saat Ini (temuan terverifikasi)

- Aplikasi **satu Next.js (App Router) monolitik**, tanpa monorepo. Stack: Next 16.x, React 19, Tailwind v4, Flowbite, FontAwesome, Framer Motion, Lenis.
- **Seluruh konten hardcoded** di `.tsx`/`data.ts` (lembaga, kajian, recap, donasi, kontak). **Tidak ada** CMS, DB, auth, atau API data.
- **0 error/loading/not-found boundary** di seluruh `src/app`.
- **Coupling lintas-modul:** `src/app/api/donasi/route.ts` mengimpor dari `src/app/donasi/components/data.ts` (API ↔ UI satu route). Home `src/app/page.tsx` mengimpor dari `src/components/sections/*`.
- **Duplikasi:** `src/components/sections/Card.tsx` ≡ `src/app/publikasi/components/Card.tsx`.
- **Ketidakkonsistenan organisasi:** modul donasi/kontak memakai pola `components/index.ts`; modul kegiatan/tk menempelkan komponen di dalam folder route.
- **Konsep "mini-site" sudah ada tapi belum formal:** `/kegiatan/tk` punya Navbar & Footer sendiri; Navbar/Footer global disembunyikan pada `disabledPaths = ["/404", "/kegiatan/tk", "/kegiatan/takmir"]`. Mengecek `pathname === "/404"` tidak akan pernah cocok (bug halus).
- **Donasi:** `src/lib/midtrans.ts` + `/api/donasi` ada, tetapi tanpa `.env`, DB, webhook, atau admin. Data donatur mock.
- **Kontak:** `FeedbackForm` hanya `setTimeout(1500)` — tidak mengirim ke mana pun.

---

## 3. Keputusan yang Disepakati (dari sesi brainstorming)

| Kode | Keputusan | Nilai |
|---|---|---|
| D1 | Operator konten | **A + B** — pengembang + pengurus |
| D2 | Cakupan CMS | **Semua area** (Lembaga, Kajian, Recap, Donasi, Kontak) |
| D3 | Kondisi repo | Dijelaskan: monolitik, hardcoded (lihat §2) |
| D4 | Recap PHBI | Sheet = **Source of Truth** → ditarik ke **DB** (snapshot resilient). Tampilan: **kartu per-event** |
| D5 | Donasi | **Payment di-hold**, belum diputuskan |
| Arsitektur | **Y (ramping)** | ~~Turborepo monorepo~~ → **SATU app Next.js** (lihat §A: NO Turborepo) + error boundaries |
| Auth | **Strategy A** | Admin = identity provider; publik anonim (tanpa login) |
| SSO | **(a)** | Social login (Google) + email/password |
| CMS | **Payload CMS** | Panel admin siap-pakai (bukan admin custom) — hemat maintain untuk 2 dev |
| DB | Rekomendasi | **PostgreSQL via Supabase**, akses via **Payload Local API** (~~Drizzle ORM~~ — §A: Drizzle hanya internal Payload) |
| RBAC | **2 role** | `admin` + `editor` (naikkan bila benar-benar perlu) |
| Konteks tim | **2 dev + AI** | Arsitektur harus ringan-maintain & aman untuk AI-generated code |

**Framing yang dikoreksi:** Turborepo TIDAK memberi resilience runtime. Resilience berasal dari **error boundary + fallback data + pemisahan titik gagal**. Turborepo hanya memberi **isolasi deploy**. Karena kriteria pemilik tunggal = **resilient + 2 dev + AI-assisted**, maka:

- **Resilience** dicapai oleh 3 mekanisme (Bagian 2 & §12), bukan oleh Turborepo/pilihan CMS.
- **CMS template (Payload)** dipilih karena membangun admin custom = beban maintain besar yang tidak sepadan untuk 2 dev.
- **Monorepo DIBATALKAN** (lihat §A Lampiran v3): cukup satu app Next.js. `packages/*` tidak dibuat (YAGNI).

---

## 4. Bagian 1 — Struktur Repo (SATU app Next.js; lihat §A di Lampiran)

> **DIKOREKSI oleh Lampiran v3 §A/§B.** Monorepo Turborepo (`apps/*`, `packages/*`) DIBATALKAN. Repo final = **satu aplikasi Next.js** dengan Payload in-app.

```
Yayasan_App/                     # satu app Next.js (bukan monorepo)
├─ src/
│  ├─ app/(site)/                # PUBLIC face — anonim, baca DB (read-only)
│  ├─ app/(payload)/             # CMS face — Payload in-app (login, CRUD, /admin)
│  ├─ collections/  globals/     # schema Payload (satu sumber schema)
│  ├─ access/  features/  lib/   # aturan & domain (satu sumber)
│  └─ components/ providers/ types/
├─ src/migrations/               # migrasi Payload (satu otoritas schema)
├─ scripts/                      # migrate / build-guard / ops
├─ docs/                         # runbooks + sql + spec
└─ package.json                  # SATU manifest
```

**Keputusan kunci:**

1. `(site)` dan `(payload)` hidup di **satu deployable**, dipisah route group + error boundary (isolasi runtime), bukan dua app terpisah.
2. **Satu Postgres** (Supabase) untuk keduanya. Admin menulis; web membaca. Menghindari divergensi data.
3. **Admin = Payload CMS**, bukan admin custom. Payload berjalan in-app di route group `(payload)`; memberi CRUD, auth, RBAC, upload, draft — tanpa membangun dari nol.
4. Akses data **hanya lewat Payload Local API** (satu sumber aturan; Drizzle tidak diakses langsung).
5. Legenda backend lengkap ada di **§11**.
6. `features/` sederhana, **bukan FSD penuh** (lihat §5).

**Migrasi:** tidak ada "big bang rewrite". Rute publik lama dipindah ke `(site)`, lalu di-refactor bertahap sambil tetap jalan.

---

## 5. Bagian 2 — Struktur `features/` & Error Boundary

> **DIKOREKSI (Lampiran §A/§F/G, item 11): `features/` sederhana, BUKAN FSD penuh.** Tidak ada layer `entities/`/`widgets/`. Tidak ada paket `@yayasan/eslint-config`; batas dijaga oleh konvensi + review + CI.

**Struktur final (satu app):**

```
src/
├─ app/(site)/
│  ├─ page.tsx
│  ├─ tentang-kami/page.tsx        (+ error.tsx)
│  ├─ publikasi/page.tsx           (+ error.tsx)
│  ├─ kegiatan/
│  │  ├─ page.tsx                  (+ error.tsx)
│  │  ├─ (lembaga)/tk/page.tsx     (mini-site sendiri)
│  │  ├─ kajian/[slug]/page.tsx    (+ error.tsx)
│  │  └─ recap/page.tsx            (+ error.tsx)   ← PHBI terisolasi
│  ├─ donasi/...                   (+ error.tsx)
│  └─ kontak/page.tsx              (+ error.tsx)
├─ app/global-error.tsx  app/not-found.tsx
├─ features/   { data, donation, contact, kajian, outbox, sync }
├─ components/ { layout, sections, ErrorFallback, WidgetBoundary, MediaImage }
└─ collections/ globals/ access/ lib/ providers/ types/
```

**Tiga lapis pertahanan error:**

1. **Error boundary per-segmen rute** (`error.tsx` Next). `recap` throw → hanya segmen itu fallback; layout & rute lain hidup.
2. **Error boundary per-widget** (React `ErrorBoundary` + `Suspense`). Home menggabungkan banyak section; bila satu section gagal, section lain tetap render.
3. **Fallback data (bukan fallback kosong).** Fallback menampilkan snapshot DB terakhir / pesan halus "Data sedang diperbarui", bukan error mentah.

Tambahan: `app/global-error.tsx` (jaring terakhir) dan `app/not-found.tsx` (404 rapi — saat ini belum ada).

---

## 6. Bagian 3 — Auth Flow (admin sebagai Identity Provider) + RBAC

**Alur:** Pengurus buka `/admin` → Payload `users` collection login → email/password **atau** Sign in with Google (OAuth) → session cookie httpOnly → Payload Access Control menegakkan role.

**Auth disediakan oleh Payload** (di atas Supabase/DB). Tidak menulis library auth sendiri — YAGNI untuk 2 dev. Bila nanti butuh auth di `(site)` juga, baru diekstrak ke modul terpisah.

**RBAC (Payload Access Control) — 2 role:**

| Role | Boleh |
|---|---|
| `admin` | Semua, termasuk kelola user admin |
| `editor` | CRUD konten, tanpa kelola user |

Role tambahan (per-lembaga, viewer) **ditambahkan hanya bila benar-benar diperlukan** — bukan di awal.

**Secrets:** kredensial server (mis. `RELAY_SECRET`, service key) hanya di server (`(payload)`/sync worker); **tidak pernah** di client `(site)`.

---

## 7. Bagian 4 — Layer Data (Sheet = SOT → DB snapshot → fallback UI)

**Alur:** Google Sheet (SOT) → *sync worker* (fetch → parse/validate Zod → upsert idempoten → catat `sync_runs`) → Postgres (`phbi-recap`) → `(site)` baca DB saja.

**Sync worker** berada di dalam app yang sama (Route Handler `/api/sync/phbi`), bukan package terpisah — YAGNI. Bisa dipicu cron (Supabase `pg_cron`) atau tombol "Sync dari Sheet" di CMS.

**Prinsip:** UI tidak pernah memanggil Sheet langsung · sync idempoten (by `row_key`) · snapshot bertanggal (`synced_at`) · sync gagal ≠ data hilang · fallback ke snapshot terakhir.

**Tabel (Payload collections):** `phbi-recap`, `sync-runs`, `campaigns`, `donors`, `prayers`, `lembaga`, `kajian`, `contact-messages`, `users`.

**Fallback:** section recap (RSC) try query DB → catch → fallback snapshot; ISR revalidate + `unstable_cache` bertag `phbi`, invalidasi saat sync sukses.

---

## 8. Bagian 5 — CMS untuk Semua Area (Payload CMS)

**Keputusan:** memakai **Payload CMS** (bukan admin custom). Payload adalah app Next.js yang berjalan in-app di route group `(payload)`, schema didefinisikan di **code (TypeScript collections)** → ikut version control, type-safe, AI-friendly.

**Kenapa Payload (bukan admin custom):** CRUD admin, auth, RBAC, upload media, draft/publish, preview — semuanya sudah disediakan. Untuk **2 dev**, ini memangkas beban maintain drastis (tidak menulis list/form/guard untuk tiap modul).

**Collections Payload (draf):**

| Collection | Cakupan |
|---|---|
| `lembaga` | profil, prestasi, fasilitas, program, galeri, ulasan (per-lembaga) |
| `kajian` | video (YouTube ID) / artikel (rich text) / kitab (upload PDF) |
| `phbi-recap` | read + tombol "Sync dari Sheet" (hook memicu sync) + koreksi manual |
| `campaigns` | kampanye donasi (payment hold) |
| `donors` | donatur (input manual) |
| `prayers` | doa/pesan donatur |
| `contact-messages` | inbox kritik & saran |
| `site-settings` | info kontak, sosial, jam operasional, mapping kolom Sheet |
| `users` | akun admin + role (`admin` / `editor`) |

- **RBAC 2 role**: `admin` (semua) dan `editor` (konten, tanpa kelola user). Payload Access Control menegakkan ini.
- **Upload** gambar/PDF → **Cloudflare R2** (storage adapter Payload); FS Vercel ephemeral.
- **Validasi** memakai Zod di `features/*/` (collection hooks / Server Actions).
- Tiap area tetap punya **error boundary** di sisi `(site)` saat menampilkannya.

---

## 9. Bagian 6 — Donasi (Payment Di-Hold, Slot Disiapkan)

**Seam di `features/donation/`:**

```ts
interface PaymentProvider {
  id: string
  createTransaction(input: DonationInput): Promise<{ token: string; orderId: string }>
  verifyWebhook(req: Request): Promise<WebhookResult>
}
```

- Saat ini satu implementasi **`manual`** (transfer bank + konfirmasi WA; pola `LargeDonationDialog` yang sudah ada).
- Nanti tambah `MidtransProvider`/`XenditProvider` tanpa merombak.

**Dibangun sekarang:** tabel `campaigns`/`donors`/`prayers`, CMS kelola kampanye + input donatur manual, publik baca DB, slot `PaymentProvider = manual`.
**Ditunda:** integrasi gateway, webhook, auto-update `collected_amount`, rekonsiliasi otomatis.

---

## 10. Bagian 7 — Kontak

- Info kontak/sosial/jam operasional: dari `data.ts` → **DB (global `site-settings`) + CMS**.
- Form kritik & saran: **Server Action** → `contact-messages` (name, anonymous, rating, message, created_at); admin punya inbox.
- Validasi Zod di `features/contact/`; rate-limit + honeypot (opsional).
- Polish design: selaraskan dengan design system (komponen bersama di `components/`); perbaiki copy campur bahasa.
- `mapEmbedUrl` dari DB/config (global `site-settings`).

---

## 11. Backend — Stack Resmi

Backend = **Supabase Postgres + Payload 3 (Local API/REST) + Next.js Server Actions**. **Payload** adalah lapisan backend-nya; ia membungkus Drizzle secara internal (jangan pakai Drizzle/Prisma terpisah — §A poin 2).

| Lapis | Teknologi | Fungsi |
|---|---|---|
| 1. Database | **PostgreSQL via Supabase** | Simpan semua koleksi/tabel |
| 2. Akses data | **Payload Local API** (`payload.find/create`) — Drizzle internal saja | Query type-safe + access control |
| 3. Auth | **Payload auth** (`users` collection) | Email/password + (opsional) OAuth, session cookie |
| 4. Storage | **Cloudflare R2** (via `@payloadcms/storage-s3`) saat `disableLocalStorage` | Upload gambar & PDF kitab (Vercel FS ephemeral) |
| 5. API | **Payload REST + Server Actions + Route Handlers** | CRUD admin, endpoint publik, webhook |

**Distribusi akses:**
- `(site)` → baca DB publik, `overrideAccess:false` (read-only).
- `(payload)/admin` → tulis via CMS; server-only.
- Sync worker (`/api/sync/phbi`) → server-only.

**Tanpa server backend terpisah.** Next.js App Router = backend. Satu deployable di Vercel.

**Keamanan:**
- Akses publik dibatasi **Payload Access Control** (`readPublished`, `readPublicDonors`), bukan RLS Supabase.
- `PAYLOAD_SECRET` panjang & acak; **wajib** di produksi (config throw bila kosong).
- **Validasi**: Zod untuk input non-Payload (form donasi/kontak), dipakai client + server.

---

## 12. Jaminan Resilience & Cara Menegakkannya

**Tiga mekanisme (inti resilience — tidak bergantung Turborepo atau CMS):**

| Mekanisme | Jaminan |
|---|---|
| **Error boundary per-segmen & per-widget** | Modul PHBI error → hanya section itu fallback; web lain hidup |
| **Fallback data (DB snapshot + cache)** | Sheet/API mati → tampil data terakhir, bukan blank |
| **Pemisahan titik gagal** (1 database, 2 DB, 1 DB) | Admin rusak → publik tak tersentuh |

**Aturan penegakan (WAJIB, karena 2 dev + AI-generated code):**

1. **Batas modul** dijaga konvensi + review + CI (tidak ada paket ESLint terpisah).
2. **Zod satu sumber** di `features/*/` — mencegah validasi berbeda di client/server.
3. **Error boundary + test jalur kritis** (validasi donasi, parsing sync) — jaring agar AI tidak merusak yang sudah jalan. CI = `lint + typecheck + test`.

**Matriks ancaman → penanganan:**

| Ancaman | Ditangani oleh |
|---|---|
| Deploy rusak → publik down | ISR/static-first + error boundary per-segmen |
| Modul PHBI error → web blank | Error boundary per-segmen + per-widget |
| Sheet berubah/hilang → halaman error | Sync worker + snapshot DB + fallback |
| Kode susah maintain, coupling | struktur `src/` satu arah + review + CI |
| Salah edit oleh pengurus | RBAC Payload (2 role) |
| Vendor payment berubah | `PaymentProvider` seam |

---

## 13. Pertanyaan Terbuka (diputuskan saat implementation plan)

1. Domain/URL produksi (satu domain; `/admin` di domain yang sama).
2. Editor artikel Kajian di Payload: rich text (Lexical) vs markdown.
3. Detail mapping kolom Sheet PHBI (nama kolom) → menentukan parser sync.
4. Apakah pakai Payload Cloud vs self-host Payload.

---

## 14. Di Luar Cakupan (untuk saat ini)

- Integrasi payment gateway (D5 hold).
- Rekonsiliasi keuangan otomatis.
- Notifikasi (email/WA) otomatis.
- Paket `auth`/`ui`/`sync` terpisah (YAGNI — tidak dibuat).
- Test otomatis/CI (dapat ditambahkan sebagai fase terpisah).

---
---

# LAMPIRAN v3 — Hasil Pematangan (Metis → Oracle → Metis → Oracle)

> Bagian ini **menggantikan** keputusan awal yang bertentangan (§3 arsitektur, §4 struktur, §11 backend) dengan hasil siklus audit adversarial. Di mana bertentangan, **lampiran ini yang berlaku.**

## A. Koreksi Dasar (temuan Metis, diverifikasi Oracle)

1. **Turborepo TIDAK memberi resilience runtime.** Resilience = error boundary + fallback data + pemisahan titik gagal. Turborepo hanya isolasi *build*, bukan *runtime*. → Premis "2-app monorepo = publik tidak down" **salah**.
2. **Payload + `packages/db` Drizzle = dua pengelola schema di satu Postgres** → perang migrasi + risiko data-loss (bukti: Payload postgres adapter memakai Drizzle internal & memiliki schema; issue #12512 DB wipe, #14035 invalid ALTER). → **Satu database harus punya TEPAT SATU otoritas schema.**
3. **"Zod single-source" aspiratif** — Payload hanya menghasilkan TS/Drizzle, bukan Zod. → Payload config = sumber schema; Zod dipakai hanya untuk input non-Payload.
4. **`<img>`/FSD/error-boundary nuance** dikoreksi dengan mekanisme presisi (error.tsx menangkap error render-path SC; TIDAK menangkap sibling layout, native boundary, atau event handler → butuh `unstable_rethrow` di try/catch layout).

## B. Keputusan Arsitektur FINAL — "Option D"

> **SATU aplikasi Next.js 16 (App Router). Payload CMS 3.x (pin ≥3.78.0) hidup in-app via route group `app/(payload)/admin`. TIDAK ada Turborepo. TIDAK ada workspace packages. TIDAK ada `packages/db` terpisah. Payload memiliki 100% schema Postgres. Satu deployable: Vercel (serverless) + Supabase + Cloudflare R2.**

> **REVISI (Lampiran C):** topologi asli "container Docker di VPS" **DIBATALKAN**. Target final = **Vercel** (lihat §C). Model serverless → konsekuensi ditangani eksplisit: storage ke **R2**, cron ke **Supabase `pg_cron`**, koneksi ke **Supavisor transaction pooler**.

Alasan: findings 1/5/7 larut (satu schema owner, satu app, satu sumber tipe); finding 2 dihormati (isolasi runtime via ISR + route-group containment); maintainability maksimal untuk 2 dev (1 package.json, 1 build, konfigurasi minimal); AI-legibility tertinggi.

**Trade-off yang DITERIMA (didokumentasikan, bukan disembunyikan):** publik & admin **tidak bisa deploy independen**. Ini soal *release cadence*, bukan *runtime resilience* → dapat diterima.

## C. Topologi Deployment (keputusan konkret, DIREVISI ke Vercel)

| Item | Keputusan |
|---|---|
| Deployable | **1** app Next.js di **Vercel** (serverless) |
| Host | **Vercel** — Hobby (free) cukup; **Pro** bila butuh Cron per-menit / function >60s |
| Model runtime | **Serverless** (Vercel Functions) |
| Split publik/admin | Route groups `app/(site)` & `app/(payload)/admin` — dipisah by-construction, bukan `if(env)` |
| DB | Supabase Postgres (terkelola, eksternal), **Supavisor transaction pooler 6543** + `prepare:false` + `max:1` |
| Storage | **Cloudflare R2** (`@payloadcms/storage-s3`) — FS Vercel ephemeral |
| Scheduler | **Supabase `pg_cron` + `pg_net`** → relay endpoint (bukan Vercel Cron) |
| Biaya | Hobby: **$0** (+ Supabase Free); produksi: ≈ **$25/mo** (Supabase Pro) |

## D. Kontrak Migrasi

- Prod: `push: false`; migrasi dijalankan **di build step** (`payload migrate && next build`). **Gagal → build gagal → deploy ditolak.**
- Rollback = redeploy deployment sebelumnya (`vercel rollback`); **migrasi additive-only** secara default.
- **JANGAN** pakai `prodMigrations` (runtime) di Vercel — Payload docs: memperlambat cold start serverless.
- Dev: `push` **hanya untuk DB lokal**; DB remote (Supabase) pakai migrasi (push ke remote ~40s tiap boot → dimatikan).
- Verifikasi (docs Payload): `payload migrate && build`, deploy ditolak bila migrasi gagal, DDL transaksional, `--skip-empty` untuk CI non-interaktif.

## E. Durabilitas Data

| Layer | Keputusan |
|---|---|
| Tier | **Supabase Pro WAJIB untuk produksi** ($25/mo) — Free **pause setelah 1 minggu idle** + **tanpa backup** (verifikasi docs) |
| Backstop | Daily backup Pro (retensi 7 hari) **+ `pg_dump` mingguan off-site** (S3/B2) |
| PITR | **DITUNDA** (~$100/mo, butuh Small compute, mengganti daily backup, DB-only). Trigger upgrade terdokumentasi: saat memproses donasi berulang / RPO < 1 jam |
| Media/Storage | **TIDAK** tercakup backup DB → mirror media mingguan ke B2 |
| Restore | Runbook + **drill restore tiap 6 bulan** |

**RPO/RTO jujur:** RPO ≤ 24 jam (daily) / ≤ 1 minggu (off-site); RTO ~1–3 jam manual.

## F. Layer Lifecycle (L0) — wajib, operasional & testable

- **L0.1 Health:** `/api/health` (liveness, static) + `/api/health/ready` (DB `SELECT 1` via **koneksi `pg` ringan**, bukan boot CMS); monitor 60s; alert setelah 2 gagal beruntun.
- **L0.2 Deploy gate:** build ter-gate migrasi + smoke test pasca-deploy dengan auto-revert.
- **L0.3 Rollback:** `vercel rollback` (kode saja, bukan schema); migrasi additive-only → aman.
- **L0.4 Cron:** di **Supabase `pg_cron`/`pg_net`** (bukan Vercel Cron — Hobby hanya 1×/hari); heartbeat table + **dead-man's-switch** (healthchecks.io).
- **L0.5 Storage outage:** gambar via `MediaImage` (`onError` → placeholder); halaman tak pernah 500.
- **L0.6 Write-path DB outage:** **transactional outbox + idempotency**. Receiver: verify signature (raw body) → `INSERT ... ON CONFLICT (provider, event_id, payload_hash)` → 200; bila DB down → **503** agar provider retry. Relay `FOR UPDATE SKIP LOCKED` + DLQ + replay. PHBI sync (outbound) pakai outbox.
- **L0.7 Crash/vendor hiccup:** Vercel menangani restart; snapshot DB + ISR menjaga situs.
- **L0.8 Cold start:** dikelola Vercel; `prodMigrations` dihindari (§D).

**Kunci resilience paling penting:** **halaman publik = ISR/static-first** → situs tetap melayani HTML cache walau Postgres down. Ini properti *durability*, bukan sekadar render.

## G. Checklist Keputusan FINAL (32 item, semua lock-ready)

Round 1 (revisi status): (1) 1 app Next16 ✅ · (2) Payload ≥3.78.0 in-app ✅ · (3) **NO Turborepo** ✅ · (4) **REVISI: 1 deployable Vercel (serverless)** ✅ · (5) Postgres/Supabase ✅ · (6) publik ISR-first ✅ · (7) route-group + error boundary ✅ · (8) split route-group ✅ · (9) push:false prod ✅ · (10) Payload auth (admin) + publik read-only ✅ · (11) **REVISI: `features/` sederhana, bukan FSD penuh** ✅.

Round 2 (tambahan): (12) topologi 1 deployable ✅ · (13) isolasi by route-group ✅ · (14) coupling deploy publik/admin = **accepted limitation** ✅ · (15) kontrak migrasi build-step ✅ · (16) rollback `vercel rollback` + additive-only ✅ · (17) ledger `payload_migrations` ✅ · (18) dev `push` hanya lokal ✅ · (19) Supabase Pro wajib (produksi) ✅ · (20) Pro daily + off-site mingguan ✅ · (21) PITR ditunda + trigger ✅ · (22) mirror media mingguan ✅ · (23) runbook + drill 6 bulan ✅ · (24) health liveness/readiness ✅ · (25) deploy gate + smoke + auto-revert ✅ · (26) cron di Supabase `pg_cron` + dead-man's-switch ✅ · (27) storage placeholder fallback ✅ · (28) outbox + idempotency (200/503) ✅ · (29) serverless hardening (pool 1, prepare:false, ssl) ✅ · (30) cold-start dikelola Vercel ✅ · (31) trim L1 ke 3–4 segmen inti ✅ · (32) ⏳ **OPEN: konfirmasi provider payment retry ≥24 jam + event ID stabil** (hanya item terbuka; D5 payment masih hold — jalur aman sudah terdesain tanpa ini).

## H. Verifikasi Eksternal (dukungan resmi)

- **Supabase docs** (pricing/backups): Free = **pause setelah 1 minggu idle**, **tanpa backup**, 2 project; Pro daily 7 hari; PITR add-on ~$100/mo. ✅ cocok §E.
- **Supabase docs** (connecting-to-postgres): serverless → **shared pooler transaction mode 6543**, `prepare:false`, app pool `max:1`, ssl `require`; migrasi → **direct 5432**. ✅ cocok §C/§D.
- **Payload docs** (deployment): "deploy anywhere Next.js runs — including Vercel"; **ephemeral FS** → wajib cloud storage adapter. ✅ cocok §C.
- **Payload docs** (storage-adapters): opsi resmi **Vercel Blob / S3 / R2**; Vercel server upload limit **4.5 MB** → `clientUploads`. ✅.
- **Payload docs** (migrations): `payload migrate && build`, deploy ditolak bila gagal; **`prodMigrations` dilarang untuk serverless** (memperlambat cold start). ✅ cocok §D.
- **Payload docs** (postgres): Drizzle diekspos via `payload.db.drizzle`; `beforeSchemaInit`/`afterSchemaInit` untuk tabel non-Payload. ✅ (Drizzle tidak dipakai terpisah — §A).
- **Vercel docs** (cron-jobs/usage-and-pricing): Hobby = **1×/hari** (ekspresi lebih sering gagal deploy), Pro = 1×/menit, keduanya 100 job. ✅ mendasari §F L0.4 (pakai `pg_cron` Supabase).
- **Cloudflare docs** (r2/pricing): free **10 GB-month + 1M Class A + 10M Class B**, **egress gratis**. ✅ kandidat storage §C.
- **Artikel praktisi webhook (Midtrans/Xendit/Stripe)**: duplicate delivery, out-of-order, timeout → retry **realita**; mitigasi = idempotency by event ID + payload hash, verify signature di raw body, bounded retry + review queue. ✅ cocok §F L0.6 dan memperkuat item #32.

## I. Confidence

**97%** (jujur). Satu-satunya item terbuka (#32) adalah fakta provider eksternal yang **tidak relevan sampai payment diputuskan (D5 hold)**; jalur "hold" aman karena outbox/idempotency/503-retry bersifat provider-agnostic, dan rencana sudah menyebut pull/reconciliation job bila provider tidak retry. Dengan itu, desain **siap untuk implementation plan** untuk semua modul non-payment.
