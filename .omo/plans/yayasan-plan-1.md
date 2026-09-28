# Plan 1 — Fondasi, Backend & CMS Core (Yayasan Al-Muhajirin) — FINAL (patch menyatu, loop-audited)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fondasi Next.js 16 + Payload CMS 3 (in-app); Payload = pemilik tunggal schema Postgres Supabase; kontrak migrasi; durability; lifecycle L0 siap produksi **di Vercel Pro**.

**Architecture:** SATU aplikasi Next.js 16.3.6 App Router. Payload in-app via route group `app/(payload)`. **Tidak ada Turborepo/packages. TIDAK ADA Docker/VPS/container** — target = **Vercel Pro (serverless)**. Publik ISR/static-first. Outbox + idempotency. Scheduler = Supabase `pg_cron`+`pg_net` → relay Vercel.

**Tech Stack:** Next.js 16.3.6, React 19, TypeScript 5.9.3, Tailwind v4, Payload CMS ≥3.78.0, `@payloadcms/db-postgres`, Supabase Pro, Zod, Vitest.

## Global Constraints
- **CANONICAL ROOT = `src/`.** SEMUA kode ada di bawah `src/`: `src/app`, `src/features`, `src/components`, `src/collections`, `src/access`, `src/lib`, `src/globals`. Import selalu lewat alias `@/*` → `./src/*`. **TIDAK ADA direktori `app/`/`features/`/`components/` di root repo.** Plan 2–5 memakai `src/...` (bukan path root).
- **Payload `@payloadcms/*` ≥3.78.0**; **Next `16.3.6`**; **TS `5.9.3`**.
- **Satu schema owner:** Payload memiliki 100% tabel. DILARANG `drizzle-kit`/`prisma`/migrasi SQL eksternal (tabel non-Payload = koleksi Payload).
- **Runtime DB:** Supavisor transaction mode **6543**, `pool.max` kecil (1–5), `prepare: false`. Migrasi/`pg_dump`: **direct 5432**.
- **`push:true`** hanya dev ke DB sandbox; prod **`push:false`**.
- **Migrasi prod:** build-guard, hanya bila `VERCEL_ENV==='production'`; gagal = deploy gagal.
- **Deploy:** **Vercel Pro**; region co-locate Supabase (Singapore `sin1`).
- **Slug koleksi (jamak):** `users`,`media`,`publikasi`,`lembaga`,`prestasi`,`fasilitas`,`kajian`,`phbi-recap`,`sync-runs`,`campaigns`,`donors`,`prayers`,`contact-messages`,`job-runs`, global `site-settings`.
- **Akses publik:** `read: readPublished` (draft) / `readPublicNoDraft`; query publik `overrideAccess:false`.
- Verifikasi Step dijalankan di **Linux (Git Bash/CI)**; Windows alternatif `Select-String`.
- Copy Bahasa Indonesia. Setiap task berakhir commit.

## Todos

- [ ] 1. Prasyarat eksternal (operator) + rekonsiliasi repo yang SUDAH ADA
- [ ] 2. Setup tooling: vitest + eslint + pin deps (payload, vitest)
- [ ] 3. Selaraskan konfigurasi app (pertahankan `src/`, putuskan Flowbite, ganti ke `withPayload`)
- [ ] 4. Pindahkan rute legacy ke `src/app/(site)/` (MOVE, bukan copy) + bereskan `(lembaga)`
- [ ] 5. Payload CMS in-app (route group `(payload)` + importMap)
- [ ] 6. Koleksi `Users` + RBAC 2 role
- [ ] 7. Kontrak migrasi (build-guard) + pool Supabase + scripts
- [ ] 8. `src/access/published.ts` + `src/lib/slug.ts`
- [ ] 9. Koleksi `Media` (upload) + storage adapter
- [ ] 10. Koleksi `Lembaga` + `Prestasi` + `Fasilitas`
- [ ] 11. Koleksi `Publikasi` (galeri)
- [ ] 12. Koleksi `Kajian` (video/artikel/kitab) + validasi
- [ ] 13. Koleksi `PhbiRecap` + `SyncRun` + parse/sync Sheet→DB
- [ ] 14. Koleksi `Campaign`/`Donor`/`Prayer` + seam `PaymentProvider`
- [ ] 15. Koleksi `ContactMessage` + global `SiteSettings`
- [ ] 16. Outbox + idempotency + relay (transaksional) + `JobRun`
- [ ] 17. Generate migrasi produksi (`src/migrations`) — WAJIB
- [ ] 18. Lifecycle L0 — health + scheduler Supabase (GUC) + healthcheck ping
- [ ] 19. CI + build-guard Vercel + env docs

## Final Verification Wave

- [ ] F1. Verifikasi akhir Plan 1 (lint+typecheck+test+build; `/admin` render setelah Users; `src/migrations` NON-KOSONG; query anon tak kembalikan draft; donor non-publik tak kebaca; `/api/health` 200)

---

### Task 1: Prasyarat eksternal + REKONSILIASI repo (WAJIB pertama)

**Konteks KRITIS:** Repo **sudah berisi** aplikasi lama: `src/app/**`, `tsconfig` `@/* → ./src/*`, `next.config.js` (Flowbite), `src/lib/midtrans.ts`, `src/app/api/donasi/route.ts`, `src/types/donation.ts`. Plan ini **tidak menghancurkan** kerja lama; ia **mengadaptasi** di tempat.

**Files:** `docs/runbooks/prerequisites.md`; Create `src/lib/store/donations.ts` (flag).

- **Step 1: Dokumentasikan prasyarat (tulis `docs/runbooks/prerequisites.md`)**
```
Supabase Pro (region Singapore) → catat <ref>/<region>; aktifkan: create extension if not exists pg_cron; create extension if not exists pg_net;
Storage bucket `media` (public read).
Vercel Pro project `yayasan-app`, region sin1.
Env: DATABASE_URL(6543), DATABASE_URL_DIRECT(5432), PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL, PHBI_SHEET_CSV_URL, RELAY_SECRET, DATABASE_URL_DIRECT_SANDBOX(direct 5432 proyek sandbox KEDUA).
Backup: bucket `yayasan-backup` + AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY/S3_BUCKET/S3_ENDPOINT.
healthchecks.io check `yayasan-ready` → HEALTHCHECK_PING_URL.
Google Sheet PHBI: publish-to-web CSV → PHBI_SHEET_CSV_URL.
```
- **Step 2: Inventarisasi repo lama (record temuan, JANGAN hapus)** — cek: `src/app/{page,layout}.tsx`, `src/app/{tentang-kami,publikasi,kegiatan,donasi,kontak}/`, `src/components/**`, `src/lib/midtrans.ts`, `src/app/api/donasi/route.ts`. Tulis daftar di `docs/runbooks/prerequisites.md`.
- **Step 3: Netralkan endpoint donasi lama** (bertentangan dengan "gateway HOLD"): pindahkan detail Midtrans ke `src/lib/store/donations.ts` ber-flag `PAYMENT_ENABLED=false`; `/api/donasi` mengembalikan `501 Not Implemented` bila flag false. **Jangan hapus** kode lama — hanya di-nonaktifkan.
- **Step 4: Verifikasi repo lama masih build** — `pnpm install && pnpm build` (dengan `next.config.js` lama) → sukses (baseline).
- **Step 5: Commit** `git commit -m "chore: prerequisites + neutralize legacy donation endpoint"`

---

### Task 2: Setup tooling — vitest + eslint + pin deps
**Files:** `package.json`, `vitest.config.ts`, `tests/smoke.test.ts`.
- **Step 1:** Tambah devDeps: `vitest`, `@vitejs/plugin-react` (bila perlu JSX), `eslint` + `eslint-config-next`. Install: `pnpm add -D vitest eslint eslint-config-next`.
- **Step 2: `vitest.config.ts`**
```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'
export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```
- **Step 3: `tests/smoke.test.ts`**
```ts
import { describe, it, expect } from 'vitest'
describe('smoke', () => { it('runs', () => expect(1 + 1).toBe(2)) })
```
- **Step 4:** `pnpm test` → PASS. **Step 5: Commit** `git commit -m "chore: vitest + eslint setup"`

---

### Task 3: Selaraskan konfigurasi app (PERTAHANKAN `src/`, putuskan Flowbite)
**Files:** Modify `package.json`, `tsconfig.json`, `next.config.js`→`next.config.ts`, `src/app/globals.css`.
- **Step 1: `package.json` scripts** (CATATAN: Next 16 menghapus `next lint` → pakai `eslint .`; Payload CLI butuh script `payload` + `cross-env`):
```json
"scripts": {
  "dev": "next dev", "build": "next build", "start": "next start",
  "lint": "eslint .", "typecheck": "tsc --noEmit", "test": "vitest run",
  "payload": "cross-env PAYLOAD_CONFIG_PATH=src/payload.config.ts payload",
  "migrate": "pnpm payload migrate",
  "migrate:create": "pnpm payload migrate:create --skip-empty",
  "ci:migrate": "node scripts/migrate.mjs"
}
```
Pin deps exact: `pnpm add payload@3.78.0 @payloadcms/next@3.78.0 @payloadcms/db-postgres@3.78.0 @payloadcms/richtext-lexical@3.78.0 zod@^3.23.8` dan `pnpm add -D cross-env`.
- **Step 2: `tsconfig.json`** — **PERTAHANKAN** `@/*` **DAN TAMBAHKAN** `@payload-config`:
```json
"paths": { "@/*": ["./src/*"], "@payload-config": ["./src/payload.config.ts"] }
```
- **Step 3: `next.config.js` → `next.config.ts`** — buang `withFlowbiteReact`, pakai `withPayload`:
```ts
import { withPayload } from '@payloadcms/next/withPayload'
export default withPayload({})
```
- **Step 4: Putuskan Flowbite di `src/app/globals.css`** — komponen lama memakai class Flowbite, jadi **PERTAHANKAN** plugin Tailwind Flowbite tapi HAPUS dependensi plugin Next: `globals.css` tetap:
```css
@import "tailwindcss";
@import "flowbite-react/plugin/tailwindcss";
@source "../../.flowbite-react/class-list.json";
```
Regenerasi class-list bila perlu: `pnpm exec flowbite-react register` (atau biarkan; file sudah ada). Bila komponen Flowbite dihapus total di kemudian hari, hapus dua baris terakhir + dep `flowbite-react`.
- **Step 5: Verifikasi** `pnpm build` sukses; `pnpm dev` `:3000`. **Step 6: Commit** `git commit -m "chore: align config to Payload (keep src/, keep flowbite css)"`

---

### Task 4: Pindahkan rute legacy ke `src/app/(site)/` (MOVE, bukan copy)
**Files:** Move `src/app/{page,layout}.tsx` + `src/app/{tentang-kami,publikasi,kegiatan,donasi,kontak}/**` → `src/app/(site)/...`; Create `src/app/(site)/layout.tsx`.
**Alasan:** Plan 2–5 merujuk `src/app/(site)/...`. Legacy tanpa `(site)` akan bentrok (dua `/kegiatan` → build error). Task ini MENG-HAPUS yang lama.
- **Step 0: Tangani root layout.** `git mv src/app/layout.tsx src/app/(site)/layout.tsx` (pertahankan chrome: Navbar/Footer/providers apa adanya — **jangan tulis ulang jadi shell kosong**). Lalu buat **root baru minimal** `src/app/layout.tsx`:
```tsx
import type { ReactNode } from 'react'
export default function RootLayout({ children }: { children: ReactNode }) {
  return (<html lang="id"><body>{children}</body></html>)
}
```
Ini agar `(site)` DAN `(payload)` bermount di bawah satu root; `src/app/(payload)/layout.tsx` **tidak** membuat `<html>` lagi.
- **Step 1: `src/app/(site)/` sudah punya layout dari Step 0** (hasil move) — tidak perlu membuat shell baru.
- **Step 2: Pindahkan (git mv) setiap segmen** `src/app/{tentang-kami,publikasi,kegiatan,donasi,kontak}` → `src/app/(site)/{...}`; pindahkan `src/app/page.tsx` → `src/app/(site)/page.tsx` dan hapus `src/app/page.tsx` lama. **JANGAN hapus Navbar/Footer** (`src/components/layout/*`) atau Navbar/Footer lokal TK.
- **Step 3: Bereskan `(lembaga)`** — `src/app/kegiatan/(lembaga)/{tk,takmir}` dipindah ke `src/app/(site)/kegiatan/(lembaga)/{tk,takmir}` (pertahankan Navbar/Footer lokal TK).
- **Step 4: Netralkan form donasi lama** — `src/app/(site)/donasi/[slug]/components/donation-form.tsx`: ganti handler submit agar, bila `PAYMENT_ENABLED===false`, tampilkan pesan "Donasi online belum tersedia" (bukan memanggil `/api/donasi`). Form donasi baru dibuat di Plan 4.
- **Step 5: Perbaiki import basi akibat move** — `/api/donasi/route.ts` mengimpor `@/app/donasi/components/data`; ubah ke `@/app/(site)/donasi/components/data` (atau hentikan impor itu bila rute di-nonaktifkan). Telusuri & perbaiki semua import `@/app/{donasi,kegiatan,kontak,tentang-kami,publikasi}`.
- **Step 6: Verifikasi** `grep -rn "@/app/donasi\|@/app/kegiatan\|@/app/kontak\|@/app/tentang-kami\|@/app/publikasi" src` → **kosong**; `git status --porcelain` → tak ada `src/app/<segmen-lama>/`; `pnpm build` → TIDAK ada error rute duplikat; hanya SATU `/kegiatan`.
- **Step 7: Commit** `git commit -m "refactor: move legacy routes into (site); fix imports; neutralize legacy form"`

---

### Task 5: Payload in-app (route group + importMap) — TANPA scaffold
**Files:** `src/payload.config.ts`; `src/app/(payload)/layout.tsx`; `src/app/(payload)/admin/[[...segments]]/{page,not-found}.tsx`; `src/app/(payload)/admin/importMap.js`; `src/app/(payload)/api/[...slug]/route.ts`.
- **Step 1: `src/payload.config.ts`** (adapter dengan `prepare: false`) — lihat Task 7 untuk isi final.
- **Step 2: Buat 5 file route group EKSPLISIT** (jangan scaffold dari create-payload-app — versi tak terkunci):
  - `layout.tsx` → re-export `RootLayout` dari `@payloadcms/next/layouts`; props **`{ config, importMap, children, serverFunction }`** di mana `serverFunction = handleServerFunctions` dari `@payloadcms/next/layouts`; sertakan `import '@payloadcms/next/css'`, `generateViewport` + `generatePayloadViewport`. **JANGAN** re-emit `<html>/<body>` di sini (root layout `src/app/layout.tsx` yang menyediakannya).
  - `admin/[[...segments]]/page.tsx` → `RootPage` + **`generatePageMetadata`** dari `@payloadcms/next/views`, pass `config` + `importMap`.
  - `admin/[[...segments]]/not-found.tsx` → `NotFoundPage` + **`generatePageMetadata`** dari `@payloadcms/next/views`.
  - `admin/importMap.js` → `export const importMap = {}` lalu jalankan `pnpm payload generate:importmap` dan commit hasilnya.
  - `api/[...slug]/route.ts` → `GET`, `POST`, `PATCH`, `DELETE`, **`PUT`, `OPTIONS`** dari `@payloadcms/next/routes` dengan `config`.
  > **Sumber kanonik:** salin isi persis dari `node_modules/@payloadcms/next/dist/...` versi **3.78.0** terpasang, atau template blank resmi pada versi yang sama — jangan tulis dari ingatan.
- **Step 3: Prasyarat runtime** — `/admin` & `pnpm build` **butuh `DATABASE_URL` valid** (sandbox). Set `.env.local` dari `.env.example` (Task 7) sebelum step ini; bila DB kosong, build gagal — itu ekspektasi, bukan bug.
- **Step 4: Verifikasi** `pnpm payload generate:importmap` sukses; `grep -rEc "RootLayout|RootPage|importMap" src/app/\(payload\)` → tiap simbol muncul.
- **Step 5: Commit** `git commit -m "feat: Payload in-app + importMap"`
> **Catatan urutan:** layar **create-first-user** `/admin` baru muncul setelah koleksi `Users` (Task 6) terdaftar. Assertion render `/admin` dipindah ke **Task 6 Step 7**.

---

### Task 6: `Users` + RBAC 2 role
**Files:** `src/access/rbac.ts`, `src/collections/Users.ts`; Test `tests/access/rbac.test.ts`.
- **Step 1: Test gagal** (`isAdmin`,`isAdminOrEditor`).
- **Step 2:** FAIL. **Step 3: `src/access/rbac.ts`**
```ts
export type Role = 'admin' | 'editor'
export type MaybeUser = { role?: Role } | null | undefined
export const isAdmin = (u: MaybeUser) => u?.role === 'admin'
export const isAdminOrEditor = (u: MaybeUser) => u?.role === 'admin' || u?.role === 'editor'
```
- **Step 4:** PASS. **Step 5:** `collections/Users.ts` (auth; `role` select default `editor`; create/delete/update `isAdmin`; read login). Daftarkan. **Step 6: Commit** `git commit -m "feat: Users + RBAC"`

---

### Task 7: Kontrak migrasi (build-guard) + pool + scripts
**Files:** `scripts/migrate.mjs`, `scripts/build-guard.mjs`, `.env.example`, `docs/runbooks/deploy.md`; Modify `src/payload.config.ts`.
- **Step 1: `.env.example`** (TANPA `prepare`; TAMBAH `RELAY_SECRET`):
```
DATABASE_URL=postgres://postgres.<ref>:<pw>@aws-<region>.pooler.supabase.com:6543/postgres
DATABASE_URL_DIRECT=postgres://postgres.<ref>:<pw>@db.<ref>.supabase.co:5432/postgres
PAYLOAD_SECRET=change-me-32-chars-min
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
PHBI_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/<id>/gviz/tq?tqx=out:csv
RELAY_SECRET=change-me-32-chars-min
# Sandbox untuk integration test (Plan 6) — proyek Supabase KEDUA (direct 5432)
DATABASE_URL_DIRECT_SANDBOX=postgres://postgres.<sandbox-ref>:<pw>@db.<sandbox-ref>.supabase.co:5432/postgres
```
- **Step 2: `src/payload.config.ts`** final:
```ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME',
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL, max: 3, prepare: false },
    push: process.env.NODE_ENV !== 'production',
    migrationDir: './src/migrations',
  }),
  collections: [],
})
```
- **Step 3: `scripts/migrate.mjs`** (advisory lock + script `payload`):
```js
import { execSync } from 'node:child_process'
process.env.DATABASE_URL = process.env.DATABASE_URL_DIRECT
try {
  execSync('psql "$DATABASE_URL_DIRECT" -c "select pg_advisory_lock(918273645)"', { stdio: 'inherit', shell: true })
  execSync('pnpm payload migrate', { stdio: 'inherit' })
  console.log('migrations: ok')
} catch { console.error('migrations: FAILED — deploy dibatalkan'); process.exit(1) }
```
- **Step 4: `scripts/build-guard.mjs`**
```js
import { execSync } from 'node:child_process'
const run = (c) => execSync(c, { stdio: 'inherit' })
if (process.env.VERCEL_ENV === 'production') run('node scripts/migrate.mjs')
else console.log('skip migrate (non-production deploy)')
run('pnpm build')
```
- **Step 5: Verifikasi** `NODE_ENV=production pnpm ci:migrate` ke sandbox → apply; koneksi salah → exit 1.
- **Step 6: Commit** `git commit -m "feat: migration contract + pool + scripts"`

---

### Task 8: `access/published.ts` + `lib/slug.ts`
**Files:** `src/access/published.ts`, `src/lib/slug.ts`; Test `tests/slug.test.ts`.
- **Step 1: Test gagal** (`toSlug`).
- **Step 2:** FAIL. **Step 3: `src/lib/slug.ts`**
```ts
export function toSlug(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}
```
- **Step 4:** PASS. **Step 5: `src/access/published.ts`**
```ts
import type { Access } from 'payload'
/** Draft-aware: anonim hanya published; user (CMS) melihat semua. */
export const readPublished: Access = ({ req: { user } }) =>
  user ? true : { _status: { equals: 'published' } }
/** Koleksi tanpa draft yang memang publik penuh (mis. media, phbi-recap non-draft). */
export const readPublicNoDraft: Access = () => true
/** Donor/prayer: publik HANYA baris isPublic (Where, BUKAN true). */
export const readPublicDonors: Access = () => ({ isPublic: { equals: true } })
```
> **ATURAN:** akses yang mengembalikan `true` = publik penuh (bahaya untuk PII). Untuk `donors` WAJIB pakai `readPublicDonors` (Where). Untuk `prayers` (memang publik) pakai `readPublicNoDraft` tapi scope via `where` campaign saat query.
- **Step 5b: Test akses (WAJIB)** — `tests/access/published.test.ts`: assert `readPublished({req:{user:null}})` mengembalikan Where `_status`, dan `readPublicDonors()` mengembalikan `{ isPublic: { equals: true } }` (bukan `true`).
- **Step 6: Commit** `git commit -m "feat: readPublished + readPublicDonors + toSlug"`

---

### Task 9: `Media` (upload) + storage adapter
**Files:** `src/collections/Media.ts`; Modify `payload.config.ts`.
- **Step 1:** `Media` (`slug:'media'`, upload mimeTypes image/*+pdf, `read:()=>true`, write `isAdminOrEditor`, field `alt`).
- **Step 2:** Daftarkan sebelum koleksi yang mereferensikan.
- **Step 3 (produksi):** storage adapter **Supabase Storage (S3-compatible)**; host/path samakan dengan `images.remotePatterns` (Plan 2): `*.supabase.co` + `/storage/v1/object/public/media/**`.
- **Step 4: Commit** `git commit -m "feat: Media + storage adapter"`

---

### Task 10: `Lembaga` + `Prestasi` + `Fasilitas`
**Files:** `src/collections/Lembaga.ts`, `src/collections/Prestasi.ts`, `src/collections/Fasilitas.ts`; Modify `payload.config.ts`.
- **Step 1:** `Lembaga` — `slug:'lembaga'`, field `nama`(text,required), `slug`(text,unique,hook `toSlug(nama)`), `kategori`(select: `pendidikan|operasional`), `deskripsi`(textarea), `profilImage`(rel `media`), `isActive`(checkbox); `access:{ read: readPublished }`; `versions:{drafts:true}`.
- **Step 2:** `Prestasi`(slug `prestasi`; `lembaga` rel, `title`, `event`, `date`) & `Fasilitas`(slug `fasilitas`; `lembaga` rel, `title`, `desc`, `icon`).
- **Step 3:** `pnpm build`. **Step 4: Commit** `git commit -m "feat: lembaga/prestasi/fasilitas"`

---

### Task 11: `Publikasi` (galeri)
**Files:** `src/collections/Publikasi.ts`; Modify `payload.config.ts`.
- **Step 1:** `Publikasi` — `slug:'publikasi'`, field `title`(required), `date`(required), `slug`(unique,hook `toSlug(title)`), `image`(rel `media`); `access:{ read: readPublished }`; `versions:{drafts:true}`.
- **Step 2:** `pnpm build`. **Step 3: Commit** `git commit -m "feat: publikasi gallery"`

---

### Task 12: `Kajian` (3 tipe) + validasi
**Files:** `src/collections/Kajian.ts`, `src/features/kajian/validate.ts`; Test `tests/kajian.validation.test.ts`.
- **Step 1: Test gagal** (video butuh `youtubeId`; artikel butuh `body`; kitab butuh `pdfId`).
- **Step 2:** FAIL. **Step 3: `src/features/kajian/validate.ts`**
```ts
export type KajianType = 'video' | 'artikel' | 'kitab'
export type KajianInput = { type: KajianType; youtubeId?: string; body?: string; pdfId?: string }
export function validateKajian(i: KajianInput): { ok: boolean; error?: string } {
  if (i.type === 'video' && !i.youtubeId) return { ok: false, error: 'youtubeId wajib' }
  if (i.type === 'artikel' && !i.body) return { ok: false, error: 'body wajib' }
  if (i.type === 'kitab' && !i.pdfId) return { ok: false, error: 'pdf wajib' }
  return { ok: true }
}
```
- **Step 4:** PASS. **Step 5:** `Kajian` (`type` select; `youtubeId` text, `body` richText, `pdf` rel `media`; hooks `beforeValidate`→`validateKajian`; `read: readPublished`; drafts). **Step 6: Commit** `git commit -m "feat: Kajian 3 types"`

---

### Task 13: `PhbiRecap` + `SyncRun` + parse/sync
**Files:** `src/collections/PhbiRecap.ts`, `src/collections/SyncRun.ts`, `src/features/sync/phbi/{parse,sync}.ts`; Test `tests/sync/phbi.parse.test.ts`.
- **Step 1: Test gagal** (`parsePhbiRows` → `rowKey` `idul-adha-2024`; drop baris invalid).
- **Step 2:** FAIL. **Step 3: Kontrak CSV** (header baris-1, koma, UTF-8): kolom WAJIB `event`(string), `year`(4-digit), `date`(ISO `YYYY-MM-DD`); opsional `description`,`image_url`. `rowKey = ${toSlug(event)}-${year}`. Zod `PhbiRow` di `parse.ts`.
```ts
import { z } from 'zod'
import { toSlug } from '@/lib/slug'
const Row = z.object({ event: z.string().min(1), year: z.string().regex(/^\d{4}$/), date: z.string().min(1), description: z.string().default('') })
export type PhbiRow = z.infer<typeof Row> & { rowKey: string }
export function parsePhbiRows(csv: string): PhbiRow[] {
  const [header, ...lines] = csv.trim().split(/\r?\n/)
  const cols = header.split(',').map((c) => c.trim())
  const out: PhbiRow[] = []
  for (const line of lines) {
    const cells = line.split(',')
    const obj = Object.fromEntries(cols.map((c, i) => [c, (cells[i] ?? '').trim()]))
    const p = Row.safeParse(obj); if (!p.success) continue
    out.push({ ...p.data, rowKey: `${toSlug(p.data.event)}-${p.data.year}` })
  }
  return out
}
```
- **Step 4:** PASS. **Step 5:** `sync.ts` — fetch `PHBI_SHEET_CSV_URL` → `parsePhbiRows` → upsert by `rowKey` → catat `sync-runs` → `revalidateTag('phbi')`. `PhbiRecap` slug `phbi-recap`, `read: readPublicNoDraft`. **Step 6: Commit** `git commit -m "feat: PHBI Sheet->DB sync"`

---

### Task 14: `Campaign`/`Donor`/`Prayer` + seam
**Files:** `src/collections/{Campaign,Donor,Prayer}.ts`, `src/features/donation/provider.ts`; Test `tests/donation/provider.test.ts`.
- **Step 1: Test gagal** (`ManualPaymentProvider().id === 'manual'`).
- **Step 2:** FAIL. **Step 3: `src/features/donation/provider.ts`** (perhatikan `campaignSlug`, BUKAN `campaignId`):
```ts
export type ProviderTransactionInput = { campaignSlug: string; amount: number; donorName: string; anonymous: boolean }
export type CreateResult = { token: string; orderId: string }
export interface PaymentProvider { id: string; createTransaction(i: ProviderTransactionInput): Promise<CreateResult> }
export class ManualPaymentProvider implements PaymentProvider {
  id = 'manual'
  async createTransaction(i: ProviderTransactionInput) { return { token: '', orderId: `MANUAL-${i.campaignSlug}-${Date.now()}` } }
}
```
- **Step 4:** PASS. **Step 5: Koleksi dengan FIELD EKSPLISIT:**
  - `campaigns`: `slug`(unique), `title`, `shortDescription`, `description`, `coverImage`(rel media), `targetAmount`(number), `collectedAmount`(number), `donorCount`(number), `isActive`(checkbox); `read: readPublished`; drafts.
  - `donors`: `campaignSlug`(text,required), `clientToken`(text,required,**unique**,index), `name`(text,required), `amount`(number,required), `isAnonymous`(checkbox), `orderId`(text, **`access.read: isAdmin`**), `isPublic`(checkbox,default false); **`read: readPublicDonors`** (Where `isPublic:true` — BUKAN `readPublicNoDraft`). Getter publik WAJIB `overrideAccess:false`.
  - `prayers`: `token`(text,required,**unique**,index), `campaignSlug`(text), `donorName`(text), `isAnonymous`(checkbox), `message`(textarea); `read: readPublicNoDraft` (publik) — query publik WAJIB `where: { campaignSlug: { equals } }`.
- **Step 6: Commit** `git commit -m "feat: donation collections + seam"`

---

### Task 15: `ContactMessage` + global `SiteSettings`
**Files:** `src/collections/ContactMessage.ts`, `src/globals/SiteSettings.ts`, `src/features/contact/validate.ts`; Test `tests/contact.rating.test.ts`.
- **Step 1: Test gagal** (rating 1..5, message wajib).
- **Step 2:** FAIL. **Step 3: `validate.ts`** (`{ ok: ratingOk && msgOk }`). **Step 4:** PASS.
- **Step 5:** `ContactMessage` — `slug:'contact-messages'`, field `name`,`email?`,`whatsapp?`,`rating`(number 1..5),`message`(textarea),`isAnonymous`(checkbox); access `read: isAdmin`, `create: () => true`, `update/delete: isAdmin`. Global `SiteSettings` **dengan `access.read: () => true` EKSPLISIT** (jangan biarkan undefined) + field tentang-kami/kontak/sosial/jam/`mapEmbedUrl`/mapping Sheet.
- **Step 5b: Test akses global** — `tests/site-settings.access.test.ts`: assert `SiteSettings.access.read()` mengembalikan `true` (anonim bisa baca). **Step 6: Commit** `git commit -m "feat: ContactMessage + SiteSettings (explicit public read)"`

---

### Task 16: Outbox + idempotency + relay + `JobRun`
**Files:** `src/collections/WebhookInbox.ts`, `src/collections/JobRun.ts`, `src/app/api/outbox/relay/route.ts`, `src/features/outbox/idempotency.ts`; Test `tests/outbox.idempotency.test.ts`.
- **Step 1: Test gagal** (`shouldAccept`: accept/duplicate/reject).
- **Step 2:** FAIL. **Step 3: `idempotency.ts`**
```ts
export type Decision = 'accept' | 'duplicate' | 'reject'
export function shouldAccept(seen: Map<string, string>, key: string): Decision {
  const [eventId] = key.split(':')
  const diffHash = [...seen.keys()].some((k) => k.split(':')[0] === eventId && k !== key)
  if (diffHash) return 'reject'
  if (seen.has(key)) return 'duplicate'
  return 'accept'
}
```
- **Step 4:** PASS. **Step 5:** `WebhookInbox` (`slug:'webhook-inbox'`) + relay route (`export const dynamic='force-dynamic'`): verifikasi header `x-relay-secret` = `process.env.RELAY_SECRET` (mismatch → **401**). **Relay WAJIB dalam SATU transaksi** agar `SKIP LOCKED` efektif:
```ts
await payload.db.drizzle.transaction(async (tx) => {
  const rows = await tx.execute(sql`SELECT * FROM webhook_inbox WHERE status='pending' FOR UPDATE SKIP LOCKED LIMIT 20`)
  // proses tiap row; setelah 2xx → status='done'; gagal → attempts+1, status='dead' bila attempts>=5
})
```
Bila DB tak terjangkau → **503**. Tambah kolom `attempts`, `nextAttemptAt`, `status` (`pending|done|dead`). `pg_net` **tidak retry** — retry hidup di state baris (row tetap `pending` → tick berikutnya memilih ulang).
- **Step 5b: Koleksi `JobRun` (`slug:'job-runs'`)** — field `name`(text,required,index), `lastSuccessAt`(date); access `read: isAdmin`, write server-only. Dipakai Plan 5 Task 4 (heartbeat/staleness). Daftarkan di `payload.config.ts`.
- **Step 6: Commit** `git commit -m "feat: outbox + transactional relay + JobRun"`

---

### Task 17: Generate migrasi produksi (WAJIB — tanpa ini prod TANPA tabel)
**Files:** `src/migrations/**` (baru).
**Alasan:** semua koleksi terdaftar di Task 6,9–16, tapi `push:false` di produksi → **tidak ada tabel** kecuali migrasi di-generate.
- **Step 1:** `pnpm migrate:create` (`payload migrate:create --skip-empty`) → menghasilkan migrasi dari schema saat ini.
- **Step 2:** commit `src/migrations/**`.
- **Step 3:** Verifikasi: `ls src/migrations` → **non-kosong**; `pnpm payload migrate:status` menampilkan migrasi terdaftar; **`grep -Ri unique src/migrations | grep -i client_token` → non-kosong** (membuktikan unique index `donors.client_token` benar-benar di-generate).
- **Step 4: Commit** `git commit -m "feat: generate production migrations (assert unique index)"`

---

### Task 18: Lifecycle L0 — health + scheduler Supabase
**Files:** `src/app/api/health/route.ts`, `src/app/api/health/ready/route.ts`, `docs/sql/schedule.sql`, `docs/runbooks/ops.md`.
- **Step 1:** `api/health/route.ts` liveness:
```ts
export const dynamic = 'force-static'
export function GET() { return Response.json({ ok: true, ts: Date.now() }) }
```
- **Step 2:** `api/health/ready/route.ts` — `getPayload` + `payload.db.pool.query('SELECT 1')` → 200/503 (bawa try/catch; `export const dynamic='force-dynamic'`).
- **Step 3: `docs/sql/schedule.sql`** — SET GUC dulu, lalu SATU job `outbox-relay` tiap menit:
```sql
create extension if not exists pg_cron; create extension if not exists pg_net;
-- WAJIB: set GUC (jalankan sekali). Tanpa ini current_setting akan error.
alter database postgres set app.relay_url = 'https://<domain>/api/outbox/relay';
alter database postgres set app.relay_secret = '<RELAY_SECRET>';
select cron.schedule('outbox-relay','* * * * *', $$
  select net.http_post(
    url := current_setting('app.relay_url', true),
    body := '{}'::jsonb,
    headers := jsonb_build_object('Content-Type','application/json','x-relay-secret', current_setting('app.relay_secret', true)),
    timeout_milliseconds := 5000
  ); $$);
```
Verifikasi: `select current_setting('app.relay_url', true);` → **non-null**.
- **Step 3b: [NEW] Implementasi dead-man's-switch di KODE** — `scripts/ping-healthcheck.mjs`: `if (process.env.HEALTHCHECK_PING_URL) await fetch(process.env.HEALTHCHECK_PING_URL)`. Panggil dari relay sukses + akhir backup workflow. Test `tests/ping-healthcheck.test.ts` (mock fetch; assert dipanggil saat env set).
- **Step 4: `docs/runbooks/ops.md`** — monitor `/api/health/ready` 60s alert 2×gagal; healthchecks.io ping (**kode Step 3b**, bukan prosa); **rollback = `vercel rollback`**; catatan: **`vercel rollback` mengembalikan KODE, bukan schema** — karena migrasi additive-only, rollback kode aman; migrasi destruktif DILARANG. Rollback juga mengembalikan cron + mematikan auto-assign domain → scheduler di Supabase.
- **Step 5: Verifikasi lokal** health endpoints (`curl`). **Step 6: Commit** `git commit -m "feat: L0 health + scheduler (GUC) + healthcheck ping"`

---

### Task 19: CI + build-guard Vercel + env docs
**Files:** `.github/workflows/ci.yml`, `vercel.json`, `docs/runbooks/deploy.md`.
- **Step 1: `.github/workflows/ci.yml`** — install/lint/typecheck/test.
- **Step 2: `vercel.json`** → `{ "buildCommand": "node scripts/build-guard.mjs" }`.
- **Step 3:** `docs/runbooks/deploy.md` — env lengkap (lihat Task 0/4); region `sin1`; plan Pro.
- **Step 4:** `pnpm lint && pnpm typecheck && pnpm test` → lulus.
- **Step 5: Commit** `git commit -m "ci: pipeline + build-guard"`

---

## Self-Review
- **Repo non-greenfield ditangani** (Task 1 & 4): pertahankan `src/`, MOVE rute legacy ke `(site)`, netralkan Midtrans lama, `paths` tetap `./src/*`.
- **CANONICAL ROOT `src/`** ditegaskan; Plan 2–5 memakai `src/...`.
- Coverage: prasyarat+repo (1), tooling (2), config (3), move legacy (4), Payload+importMap (5), RBAC (6), migrasi (7), access+slug (8), Media (9), lembaga (10), publikasi (11), kajian (12), phbi (13), donasi+seam (14), kontak (15), outbox (16), L0 (17), CI (18), verifikasi (F1).
- Fix audit: importMap+env (5), Publikasi (11), field donasi eksplisit + `campaignSlug` (14), kontrak CSV (13), `RELAY_SECRET` header (16,17), script `ci:migrate` (3,7), vitest (2), lint `eslint .` (3), Flowbite decision (3), move legacy (4), form donasi lama (4).
- **Bersih dari Docker/VPS/container.**
