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
| D1 | Operator konten | **A + B** — pengembang (superadmin) + pengurus (role) |
| D2 | Cakupan CMS | **Semua area** (Lembaga, Kajian, Recap, Donasi, Kontak) |
| D3 | Kondisi repo | Dijelaskan: monolitik, hardcoded (lihat §2) |
| D4 | Recap PHBI | Sheet = **Source of Truth** → ditarik ke **DB** (snapshot resilient). Tampilan: **kartu per-event** |
| D5 | Donasi | **Payment di-hold**, belum diputuskan |
| Arsitektur | **Y** | Turborepo monorepo, `apps/web` + `apps/admin`, + error boundaries |
| Auth | **Strategy A** | Admin = identity provider; publik anonim (tanpa login) |
| SSO | **(a)** | Social login (Google) + email/password |
| DB | Rekomendasi | **PostgreSQL via Supabase** (Postgres + Auth + Storage), **Drizzle** ORM |

**Framing yang dikoreksi:** Turborepo TIDAK memberi resilience runtime. Resilience berasal dari **error boundary + fallback data + pemisahan app**. Turborepo hanya memberi **isolasi deploy** (berguna karena ada 2 app).

---

## 4. Bagian 1 — Monorepo & Struktur Repo

```
yayasan-monorepo/
├─ apps/
│  ├─ web/          # PUBLIC face — anonim
│  └─ admin/        # CMS face — wajib login (identity provider)
├─ packages/
│  ├─ db/           # Drizzle schema + client + migrations
│  ├─ auth/         # Supabase Auth wrapper (email/password + Google OAuth), RBAC
│  ├─ core/         # domain types, Zod schemas, kontrak (SATU sumber aturan)
│  ├─ ui/           # komponen presentational bersama
│  ├─ sync/         # Sheet -> DB sync (job, parser, upsert, lastSyncedAt)
│  └─ config/       # shared tsconfig / eslint / tailwind preset
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

**Keputusan kunci:**

1. `apps/web` dan `apps/admin` **deploy terpisah** (dua project, mis. Vercel). Inilah sumber "publik tidak down walau admin rusak".
2. **Satu Postgres** untuk keduanya, diakses lewat `packages/db`. Admin menulis; web membaca. Menghindari divergensi data.
3. `packages/auth` di-share, tetapi hanya `apps/admin` yang butuh login (Strategy A).
4. `packages/sync` terisolasi — kegagalan sync tidak menjatuhkan app.
5. `packages/core` menghapus coupling route↔UI (mis. API impor ke komponen route).
6. **FSD berada di dalam tiap app**, bukan di root repo.

**Migrasi:** tidak ada "big bang rewrite". `apps/web` dimulai dari salinan rute publik yang ada, lalu di-refactor bertahap ke FSD sambil tetap jalan. `apps/admin` dibangun baru.

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

**Alur:** Pengurus buka `apps/admin` → redirect `/login` → email/password **atau** Sign in with Google (Supabase OAuth) → session JWT di cookie httpOnly (via `@supabase/ssr`) → `middleware.ts` cek session tiap request → cek tabel `admin_users` untuk role → render dashboard sesuai RBAC.

**Komponen `packages/auth`:** `createServerClient()`, `createBrowserClient()`, `requireSession()`, `requireRole(role)`, `signOutAll()`.

**RBAC (`admin_users`):**

| Role | Boleh |
|---|---|
| `superadmin` | Semua, termasuk kelola user admin |
| `editor` | CRUD konten, tanpa kelola user |
| `lembaga_tk` | Hanya konten lembaga TK |
| `lembaga_takmir` | Hanya konten lembaga Takmir |
| `viewer` | Read-only (mis. bendahara lihat donatur) |

**Secrets:** `SUPABASE_SERVICE_ROLE_KEY` hanya di server `apps/admin` + `packages/sync`; **tidak pernah** di `apps/web` client.

---

## 7. Bagian 4 — Layer Data (Sheet = SOT → DB snapshot → fallback UI)

**Alur:** Google Sheet (SOT) → `packages/sync` (fetch → parse/validate Zod → upsert idempoten → catat `sync_runs`) → Postgres (`phbi_recap`) → `apps/web` baca DB saja.

**Prinsip:** UI tidak pernah memanggil Sheet langsung · sync idempoten (by `row_key`) · snapshot bertanggal (`synced_at`) · sync gagal ≠ data hilang · trigger via cron + tombol "Sync sekarang" di admin.

**Tabel (draf Drizzle):** `phbi_recap`, `sync_runs`, `campaigns`, `donors`, `prayers`, `lembaga_profiles`, `kajian_items`, `contact_messages`, `admin_users`.

**Fallback:** `RecapSection` (RSC) try query DB → catch → `<RecapFallback snapshot>`; ISR revalidate + `unstable_cache` bertag `recap`, invalidasi saat sync sukses.

---

## 8. Bagian 5 — CMS untuk Semua Area

Semua modul admin di `apps/admin`, pola CRUD seragam:

```
app/(admin)/<modul>/
  ├─ page.tsx            # list
  ├─ new/page.tsx        # create
  ├─ [id]/edit/page.tsx  # update
  └─ actions.ts          # server actions + requireRole()
```

| Modul | Cakupan |
|---|---|
| Dashboard | status `sync_runs`, jumlah konten, error terakhir |
| Lembaga | profil, prestasi, fasilitas, program, galeri, ulasan (scope per-lembaga) |
| Kajian | video / artikel / kitab (upload PDF, YouTube ID, editor artikel) |
| Recap PHBI | read + "Sync sekarang" + koreksi manual |
| Donasi | kampanye, donatur, doa (payment hold) |
| Kontak | info kontak, sosial, jam operasional, inbox pesan |
| Pengguna | `admin_users` + role (superadmin) |
| Pengaturan | situs, mapping kolom Sheet |

- Mutasi via **Server Actions** (Next 16), validasi **Zod** dari `packages/core`.
- Upload gambar/PDF → Supabase Storage.
- Tiap modul CMS punya error boundary sendiri.

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
- Polish design: selaraskan ke design system `packages/ui`; perbaiki copy campur bahasa.
- `mapEmbedUrl` dari DB/config.

---

## 11. Matriks Resilience (bagaimana tiap ancaman ditangani)

| Ancaman | Ditangani oleh |
|---|---|
| Deploy admin rusak → publik down | App terpisah (`web` \| `admin`) |
| Modul PHBI error → web blank | Error boundary per-segmen + per-widget |
| Sheet berubah/hilang → halaman error | `packages/sync` + snapshot DB + fallback |
| Kode susah maintain, coupling | `packages/core`, FSD, batas modul |
| Salah satu pengurus salah edit | RBAC ber-scope |
| Vendor payment berubah | `PaymentProvider` seam |

---

## 12. Pertanyaan Terbuka (diputuskan saat implementation plan)

1. Domain/URL `apps/admin` (mis. `admin.yayasan.app`).
2. Editor artikel Kajian: markdown sederhana vs WYSIWYG.
3. Detail mapping kolom Sheet PHBI (nama kolom) → menentukan parser sync.

---

## 13. Di Luar Cakupan (untuk saat ini)

- Integrasi payment gateway (D5 hold).
- Rekonsiliasi keuangan otomatis.
- Notifikasi (email/WA) otomatis.
- Test otomatis/CI (dapat ditambahkan sebagai fase terpisah).
