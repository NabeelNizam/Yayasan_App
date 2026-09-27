# Desain Arsitektur — Website Yayasan Masjid Al-Muhajirin

- **Tanggal:** 2026-09-27
- **Status:** Draft untuk direview
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
| Arsitektur | **Y (ramping)** | Turborepo monorepo, `apps/web` + `apps/admin` (Payload), 2 package inti, + error boundaries |
| Auth | **Strategy A** | Admin = identity provider; publik anonim (tanpa login) |
| SSO | **(a)** | Social login (Google) + email/password |
| CMS | **Payload CMS** | Panel admin siap-pakai (bukan admin custom) — hemat maintain untuk 2 dev |
| DB | Rekomendasi | **PostgreSQL via Supabase** (Postgres + Auth + Storage), **Drizzle** ORM |
| RBAC | **2 role** | `admin` + `editor` (naikkan bila benar-benar perlu) |
| Konteks tim | **2 dev + AI** | Arsitektur harus ringan-maintain & aman untuk AI-generated code |

**Framing yang dikoreksi:** Turborepo TIDAK memberi resilience runtime. Resilience berasal dari **error boundary + fallback data + pemisahan app**. Turborepo hanya memberi **isolasi deploy**. Karena kriteria pemilik tunggal = **resilient + 2 dev + AI-assisted**, maka:

- **Resilience** dicapai oleh 3 mekanisme (Bagian 2 & §12), bukan oleh Turborepo/pilihan CMS.
- **CMS template (Payload)** dipilih karena membangun admin custom = beban maintain besar yang tidak sepadan untuk 2 dev.
- **Monorepo dirampingkan**: hanya `apps/web`, `apps/admin`, `packages/core`, `packages/db`. `auth`/`sync`/`ui` menyusul saat benar-benar butuh (YAGNI).

---

## 4. Bagian 1 — Monorepo & Struktur Repo

```
yayasan-monorepo/
├─ apps/
│  ├─ web/          # PUBLIC face — anonim, baca DB (read-only)
│  └─ admin/        # CMS face — Payload CMS (login, CRUD)
├─ packages/
│  ├─ core/         # domain types, Zod schemas, kontrak  (SATU sumber aturan)
│  └─ db/           # Drizzle schema + client + migrations
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

Package tambahan (`auth`, `sync`, `ui`) **ditambahkan hanya saat dibutuhkan** (YAGNI) — bukan dibuat di awal.

**Keputusan kunci:**

1. `apps/web` dan `apps/admin` **deploy terpisah**. Ini sumber "publik tidak down walau admin rusak".
2. **Satu Postgres** (Supabase) untuk keduanya. Admin menulis; web membaca. Menghindari divergensi data.
3. **Admin = Payload CMS**, bukan admin custom. Payload adalah app Next.js yang berjalan di `apps/admin`; memberi CRUD, auth, RBAC, upload, draft — tanpa membangun dari nol.
4. `packages/core` menghapus coupling route↔UI (mis. API impor ke komponen route) dan menjaga satu sumber validasi/tipe.
5. Legenda backend lengkap ada di **§11**.
6. **FSD berada di dalam tiap app**, bukan di root repo.

**Migrasi:** tidak ada "big bang rewrite". `apps/web` dimulai dari salinan rute publik yang ada, lalu di-refactor bertahap ke FSD sambil tetap jalan. `apps/admin` dibangun di atas template Payload.

---

## 5. Bagian 2 — FSD Layers, Boundary Modul & Error Boundary

**6 layer FSD** (impor satu arah, atas ke bawah) di dalam tiap app:

```
app/ → widgets/ → features/ → entities/ → shared/
```

Arah impor dipaksa oleh `@yayasan/eslint-config` (pelanggaran = error).

**Contoh struktur `apps/web/src`:**

```
src/
├─ app/(public)/
│  ├─ page.tsx
│  ├─ tentang-kami/page.tsx        (+ error.tsx)
│  ├─ publikasi/page.tsx           (+ error.tsx)
│  ├─ kegiatan/
│  │  ├─ page.tsx
│  │  ├─ lembaga/[slug]/page.tsx   (+ error.tsx + loading.tsx)
│  │  ├─ kajian/[slug]/page.tsx    (+ error.tsx)
│  │  └─ recap/page.tsx            (+ error.tsx)   ← PHBI terisolasi
│  ├─ donasi/...                   (+ error.tsx)
│  └─ kontak/page.tsx              (+ error.tsx)
├─ widgets/    { recap-section, lembaga-directory, kajian-list, donation-grid, site-navbar, site-footer }
├─ features/   { sync-recap, submit-feedback, browse-kajian }
├─ entities/   { campaign, kajian, lembaga, phbi-recap }
└─ shared/     { ui, config, lib }
```

**Tiga lapis pertahanan error:**

1. **Error boundary per-segmen rute** (`error.tsx` Next). `recap` throw → hanya segmen itu fallback; layout & rute lain hidup.
2. **Error boundary per-widget** (React `ErrorBoundary` + `Suspense`). Home menggabungkan banyak section; bila satu section gagal, section lain tetap render.
3. **Fallback data (bukan fallback kosong).** Fallback menampilkan snapshot DB terakhir / pesan halus "Data sedang diperbarui", bukan error mentah.

Tambahan: `app/global-error.tsx` (jaring terakhir) dan `app/not-found.tsx` (404 rapi — saat ini belum ada).

---

## 6. Bagian 3 — Auth Flow (admin sebagai Identity Provider) + RBAC

**Alur:** Pengurus buka `apps/admin` → Payload `users` collection login → email/password **atau** Sign in with Google (OAuth) → session cookie httpOnly → Payload Access Control menegakkan role.

**Auth disediakan oleh Payload** (di atas Supabase/DB). Tidak menulis library auth sendiri — YAGNI untuk 2 dev. Bila nanti butuh auth di `apps/web` juga, baru diekstrak ke `packages/auth`.

**RBAC (Payload Access Control) — 2 role:**

| Role | Boleh |
|---|---|
| `admin` | Semua, termasuk kelola user admin |
| `editor` | CRUD konten, tanpa kelola user |

Role tambahan (per-lembaga, viewer) **ditambahkan hanya bila benar-benar diperlukan** — bukan di awal.

**Secrets:** `SUPABASE_SERVICE_ROLE_KEY` hanya di server (admin/sync worker); **tidak pernah** di client `apps/web`.

---

## 7. Bagian 4 — Layer Data (Sheet = SOT → DB snapshot → fallback UI)

**Alur:** Google Sheet (SOT) → *sync worker* (fetch → parse/validate Zod → upsert idempoten → catat `sync_runs`) → Postgres (`phbi_recap`) → `apps/web` baca DB saja.

**Sync worker** berada di `apps/admin` (mis. Payload custom endpoint / Route Handler `/api/sync/phbi`), bukan package terpisah — YAGNI. Bisa dipicu cron (Vercel/Supabase) atau tombol "Sync dari Sheet" di CMS.

**Prinsip:** UI tidak pernah memanggil Sheet langsung · sync idempoten (by `row_key`) · snapshot bertanggal (`synced_at`) · sync gagal ≠ data hilang · fallback ke snapshot terakhir.

**Tabel (draf Drizzle / Payload collections):** `phbi_recap`, `sync_runs`, `campaigns`, `donors`, `prayers`, `lembaga_profiles`, `kajian_items`, `contact_messages`, `admin_users`.

**Fallback:** `RecapSection` (RSC) try query DB → catch → `<RecapFallback snapshot>`; ISR revalidate + `unstable_cache` bertag `recap`, invalidasi saat sync sukses.

---

## 8. Bagian 5 — CMS untuk Semua Area (Payload CMS)

**Keputusan:** memakai **Payload CMS** (bukan admin custom). Payload adalah app Next.js yang berjalan di `apps/admin`, schema didefinisikan di **code (TypeScript collections)** → ikut version control, type-safe, AI-friendly.

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
- **Upload** gambar/PDF → Supabase Storage (atau storage adapter Payload).
- **Validasi** memakai Zod dari `packages/core` (collection hooks).
- Tiap area tetap punya **error boundary** di sisi `apps/web` saat menampilkannya.

---

## 9. Bagian 6 — Donasi (Payment Di-Hold, Slot Disiapkan)

**Seam di `packages/core`:**

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

- Info kontak/sosial/jam operasional: dari `data.ts` → **DB + CMS**.
- Form kritik & saran: **Server Action** → `contact_messages` (name, anonymous, rating, message, created_at); admin punya inbox.
- Validasi Zod di `packages/core`; rate-limit + honeypot (opsional).
- Polish design: selaraskan dengan design system (komponen bersama di `packages/ui` **bila sudah diekstrak**, atau `shared/ui` di dalam `apps/web` pada awalnya); perbaiki copy campur bahasa.
- `mapEmbedUrl` dari DB/config.

---

## 11. Backend — Stack Resmi

Backend = **Supabase + Drizzle + Next.js Server Actions**, dibagi ke 5 lapis:

| Lapis | Teknologi | Fungsi |
|---|---|---|
| 1. Database | **PostgreSQL via Supabase** | Simpan semua koleksi/tabel |
| 2. Akses data | **Drizzle ORM** | Query type-safe, edge/serverless-friendly |
| 3. Auth | **Supabase Auth** (via Payload) | Email/password + Google OAuth, session cookie |
| 4. Storage | **Supabase Storage** | Upload gambar & PDF kitab |
| 5. API | **Server Actions + Route Handlers** | CRUD admin (Payload), endpoint publik, webhook |

**Distribusi akses:**
- `apps/web` → baca DB (publik, read-only).
- `apps/admin` (Payload) → tulis via CMS; server-only.
- Sync worker (`/api/sync/phbi`) → service-role key, server-only.

**Tanpa server backend terpisah.** Next.js App Router = backend. Ini menyederhanakan deploy dan sesuai motif resilien (satu titik deploy per app).

**Keamanan:**
- **Row Level Security (Supabase)** — publik hanya baca data published/active.
- `SUPABASE_SERVICE_ROLE_KEY` **hanya** di server (admin/sync); tidak pernah ke client web.
- **Validasi satu sumber**: Zod di `packages/core`, dipakai client + server + Payload hooks.

---

## 12. Jaminan Resilience & Cara Menegakkannya

**Tiga mekanisme (inti resilience — tidak bergantung Turborepo atau CMS):**

| Mekanisme | Jaminan |
|---|---|
| **Error boundary per-segmen & per-widget** | Modul PHBI error → hanya section itu fallback; web lain hidup |
| **Fallback data (DB snapshot + cache)** | Sheet/API mati → tampil data terakhir, bukan blank |
| **Pemisahan titik gagal** (1 database, 2 DB, 1 DB) | Admin rusak → publik tak tersentuh |

**Aturan penegakan (WAJIB, karena 2 dev + AI-generated code):**

1. **ESLint batas FSD** (`@yayasan/eslint-config`) — arah impor layer dipaksa; pelanggaran = error. AI/manusia tak bisa "salah arah" tanpa ketahuan.
2. **Zod satu sumber** di `packages/core` — mencegah validasi berbeda di client/server (bug nyata yang ditemukan di repo lama).
3. **Error boundary + test jalur kritis** (validasi donasi, parsing sync) — jaring agar AI tidak merusak yang sudah jalan. Minimal + CI (`lint + typecheck + build`).

**Matriks ancaman → penanganan:**

| Ancaman | Ditangani oleh |
|---|---|
| Deploy admin rusak → publik down | App terpisah (`web` \| `admin`) |
| Modul PHBI error → web blank | Error boundary per-segmen + per-widget |
| Sheet berubah/hilang → halaman error | Sync worker + snapshot DB + fallback |
| Kode susah maintain, coupling | `packages/core`, FSD, batas modul, ESLint |
| Salah edit oleh pengurus | RBAC Payload (2 role) |
| Vendor payment berubah | `PaymentProvider` seam |

---

## 13. Pertanyaan Terbuka (diputuskan saat implementation plan)

1. Domain/URL `apps/admin` (mis. `admin.yayasan.app`) dan domain `apps/web`.
2. Editor artikel Kajian di Payload: rich text (Lexical) vs markdown.
3. Detail mapping kolom Sheet PHBI (nama kolom) → menentukan parser sync.
4. Apakah pakai Payload Cloud vs self-host Payload.

---

## 14. Di Luar Cakupan (untuk saat ini)

- Integrasi payment gateway (D5 hold).
- Rekonsiliasi keuangan otomatis.
- Notifikasi (email/WA) otomatis.
- `packages/auth`, `packages/ui`, `packages/sync` terpisah (ditambahkan hanya bila benar-benar perlu).
- Test otomatis/CI (dapat ditambahkan sebagai fase terpisah).
