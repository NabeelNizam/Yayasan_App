> **DEPRECATED — digantikan `.omo/plans/yayasan-plan-*.md`** (Plan 1 final = `.omo/plans/yayasan-plan-1.md`). Dokumen ini disimpan hanya sebagai arsip revisi.

# Plan 1 — Fondasi, Backend & CMS Core (Yayasan Al-Muhajirin)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyiapkan fondasi aplikasi Next.js 16 + Payload CMS 3 (in-app), Payload sebagai pemilik tunggal schema Postgres Supabase, dengan kontrak migrasi, durability, dan lifecycle L0 yang siap produksi di Vercel.

**Architecture:** SATU aplikasi Next.js 16 App Router. Payload 3 hidup in-app via route group `app/(payload)`. Tidak ada Turborepo, tidak ada packages terpisah. Payload memiliki 100% schema Postgres (Supabase Pro). Halaman publik ISR/static-first. Isolasi kegagalan via route group + `error.tsx` per-segmen + middleware matcher. Outbox + idempotency untuk write-path. Scheduler = `pg_cron` + `pg_net` di Supabase memicu endpoint relay di Vercel.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.9, Tailwind v4, Payload CMS 3.x (≥3.78.0), `@payloadcms/db-postgres`, Supabase (Postgres Pro), Zod, Vitest.

## Global Constraints (berlaku untuk SEMUA task)

- **Payload versi:** `@payloadcms/*` **≥ 3.78.0** (menambal CVE-2026-34748 stored XSS). Pin exact di `package.json`.
- **Next.js:** `16.3.6` (versi terkunci saat ini).
- **TypeScript:** `5.9.3` (stabil, didukung `typescript-eslint`).
- **Satu schema owner:** Payload memiliki 100% tabel. **DILARANG** menambah `drizzle-kit`, `prisma`, atau migrasi SQL eksternal. Tabel non-Payload (mis. `outbox`, `phbi_snapshot`) dibuat sebagai **Payload collection** atau via hook `beforeSchemaInit`/`afterSchemaInit` + migrasi Payload.
- **Koneksi DB runtime:** gunakan **Supavisor transaction mode (port 6543)**; set `prepare: false` dan `max` kecil (1–5). Migrasi/`pg_dump` pakai **direct connection (5432)**.
- **`push: true`** hanya untuk dev ke **DB sandbox** (proyek Supabase terpisah). Prod **`push: false`**.
- **Migrasi prod:** via CI (bukan `prodMigrations` di runtime). `payload migrate` sebelum `next build`; gagal = deploy gagal.
- **Deployment:** Vercel **Pro** (Hobby tidak kompatibel: cron >1×/hari gagal deploy). Region Vercel di-**co-locate** dengan region Supabase (Singapore untuk Indonesia).
- **Nama folder:** struktur `features/` sederhana (BUKAN FSD penuh). Tidak ada layer `entities/widgets`.
- **Bahasa copy publik:** Bahasa Indonesia. Perbaiki copy campur bahasa yang ditemukan di repo lama.
- **Setiap task berakhir dengan commit.**

---

### Task 1: Inisialisasi aplikasi Next.js 16 + TypeScript strict

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`
- Test: (verifikasi build, bukan unit test)

**Interfaces:**
- Produces: aplikasi Next.js 16 yang bisa `pnpm build` bersih; struktur `app/` di root.

- [ ] **Step 1: Buat package.json**

```json
{
  "name": "yayasan-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "16.3.6",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "payload": "3.78.0",
    "@payloadcms/next": "3.78.0",
    "@payloadcms/db-postgres": "3.78.0",
    "@payloadcms/richtext-lexical": "3.78.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "5.9.3",
    "@types/react": "19.3.0",
    "@types/react-dom": "19.3.0",
    "@types/node": "^22.0.0",
    "vitest": "^2.1.0",
    "tailwindcss": "4.3.3",
    "@tailwindcss/postcss": "4.3.3",
    "postcss": "8.5.28"
  }
}
```

- [ ] **Step 2: Buat tsconfig.json (strict, path alias)**

```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Buat app/layout.tsx dan app/page.tsx minimal**

`app/layout.tsx`:
```tsx
import type { ReactNode } from 'react'

export const metadata = { title: 'Yayasan Masjid Al-Muhajirin' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
```

`app/page.tsx`:
```tsx
export default function Home() {
  return <main>Yayasan Masjid Al-Muhajirin</main>
}
```

- [ ] **Step 4: Install & verifikasi build**

Run: `pnpm install && pnpm build`
Expected: build sukses tanpa error TypeScript.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Next.js 16 app skeleton"
```

---

### Task 2: Konfigurasi Payload CMS in-app (route group `(payload)`)

**Files:**
- Create: `payload.config.ts`, `app/(payload)/layout.tsx`, `app/(payload)/admin/[[...segments]]/page.tsx`, `app/(payload)/admin/[[...segments]]/not-found.tsx`, `app/(payload)/api/[...slug]/route.ts`
- Modify: `next.config.ts`
- Test: (verifikasi admin menyala)

**Interfaces:**
- Consumes: Task 1 (app dasar).
- Produces: `getPayload()` dari `payload`; admin di `/admin`; API Payload di `/api/payload/*`.

- [ ] **Step 1: Buat payload.config.ts minimal**

```ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME',
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: process.env.NODE_ENV !== 'production',
  }),
  collections: [],
})
```

- [ ] **Step 2: Buat route group Payload (`app/(payload)/...`)**

Ikuti template resmi `@payloadcms/next` untuk empat file: `layout.tsx`, `admin/[[...segments]]/page.tsx`, `admin/[[...segments]]/not-found.tsx`, `api/[...slug]/route.ts`. (Ambil isi persis dari scaffold `npx create-payload-app@latest --template blank` lalu salin; jangan tulis dari ingatan.)

- [ ] **Step 3: Update next.config.ts agar Payload di-bundle**

```ts
import { withPayload } from '@payloadcms/next/withPayload'
export default withPayload({})
```

- [ ] **Step 4: Verifikasi admin menyala**

Run: `pnpm dev` lalu buka `http://localhost:3000/admin`
Expected: halaman pembuatan user pertama Payload muncul (butuh DATABASE_URL valid ke sandbox DB).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Payload CMS in-app via (payload) route group"
```

---

### Task 3: Koleksi Payload — `Users` (auth) + RBAC 2 role

**Files:**
- Create: `collections/Users.ts`, `access/isAdmin.ts`, `access/isAdminOrEditor.ts`
- Modify: `payload.config.ts`
- Test: `tests/access/rbac.test.ts`

**Interfaces:**
- Produces: role `admin` | `editor`; helper `isAdmin(user)`, `isAdminOrEditor(user)`.

- [ ] **Step 1: Tulis test RBAC yang gagal**

```ts
import { describe, it, expect } from 'vitest'
import { isAdmin, isAdminOrEditor } from '@/access/rbac'

describe('RBAC', () => {
  it('isAdmin true only for admin', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true)
    expect(isAdmin({ role: 'editor' })).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })
  it('isAdminOrEditor true for both', () => {
    expect(isAdminOrEditor({ role: 'editor' })).toBe(true)
    expect(isAdminOrEditor({ role: 'admin' })).toBe(true)
    expect(isAdminOrEditor(null)).toBe(false)
  })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `pnpm test tests/access/rbac.test.ts`
Expected: FAIL (module belum ada).

- [ ] **Step 3: Implementasi `access/rbac.ts`**

```ts
export type Role = 'admin' | 'editor'
export type MaybeUser = { role?: Role } | null | undefined

export function isAdmin(user: MaybeUser): boolean {
  return user?.role === 'admin'
}
export function isAdminOrEditor(user: MaybeUser): boolean {
  return user?.role === 'admin' || user?.role === 'editor'
}
```

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `pnpm test tests/access/rbac.test.ts`
Expected: PASS.

- [ ] **Step 5: Buat koleksi Users + daftarkan**

`collections/Users.ts`:
```ts
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/rbac'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    create: ({ req }) => isAdmin(req.user),
    update: ({ req, id }) => isAdmin(req.user) || req.user?.id === id,
    delete: ({ req }) => isAdmin(req.user),
    read: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}
```
Tambahkan `collections: [Users]` di `payload.config.ts`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Users collection with 2-role RBAC"
```

---

### Task 4: Migrasi produksi ter-gate (CI) + konfigurasi pool Supabase

**Files:**
- Create: `scripts/migrate.mjs`, `docs/runbooks/deploy.md`, `.env.example`
- Modify: `package.json` (script), `payload.config.ts` (push:false + pool)

**Interfaces:**
- Produces: prosedur deploy yang diblokir bila migrasi gagal; string koneksi terpisah (runtime pooled vs migrasi direct).

- [ ] **Step 1: Tulis `.env.example` dengan kontrak dua koneksi**

```
# Runtime (Vercel) — Supavisor TRANSACTION mode, port 6543, prepare:false
DATABASE_URL=postgres://postgres.<ref>:<pw>@aws-<region>.pooler.supabase.com:6543/postgres
# Migrasi / pg_dump / seed — DIRECT, port 5432
DATABASE_URL_DIRECT=postgres://postgres.<ref>:<pw>@db.<ref>.supabase.co:5432/postgres
PAYLOAD_SECRET=change-me-32-chars-min
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

- [ ] **Step 2: Konfigurasi adapter dengan flag aman**

Di `payload.config.ts`:
```ts
db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URL,
    max: 3,
    // @ts-expect-error prepared statements tidak didukung di transaction mode Supavisor
    prepare: false,
  },
  push: process.env.NODE_ENV !== 'production',
  migrationDir: './migrations',
})
```

- [ ] **Step 3: Buat skrip migrasi yang memakai koneksi DIRECT**

`scripts/migrate.mjs`:
```js
import { execSync } from 'node:child_process'
// Migrasi WAJIB pakai direct connection (5432), bukan pooler transaction.
process.env.DATABASE_URL = process.env.DATABASE_URL_DIRECT
try {
  execSync('payload migrate', { stdio: 'inherit' })
  console.log('migrations: ok')
} catch (e) {
  console.error('migrations: FAILED — deploy harus dibatalkan')
  process.exit(1)
}
```

- [ ] **Step 4: Tambahkan script CI**

Di `package.json` `scripts`:
```json
"ci:migrate": "node scripts/migrate.mjs",
"ci:build": "pnpm ci:migrate && next build"
```

- [ ] **Step 5: Verifikasi urutan manual (lokal, ke sandbox)**

Run: `NODE_ENV=production pnpm ci:migrate`
Expected: meng-apply migrasi ke sandbox; bila sengaja diberi koneksi salah → exit code 1 (deploy gagal).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: prod migration contract (direct conn) + Supabase pooler config"
```

---

### Task 5: Koleksi `Lembaga` + `LembagaProfile` (sub-site TK & Takmir)

**Files:**
- Create: `collections/Lembaga.ts`, `collections/Prestasi.ts`, `collections/Fasilitas.ts`
- Modify: `payload.config.ts`
- Test: `tests/collections/lembaga.slug.test.ts`

**Interfaces:**
- Produces: koleksi `lembaga` (slug, nama, kategori, deskripsi); dipakai Plan 3.

- [ ] **Step 1: Tulis test slug generator yang gagal**

```ts
import { describe, it, expect } from 'vitest'
import { toSlug } from '@/lib/slug'

describe('toSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(toSlug('TK Al-Muhajirin')).toBe('tk-al-muhajirin')
    expect(toSlug('Takmir  Masjid')).toBe('takmir-masjid')
  })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `pnpm test tests/collections/lembaga.slug.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementasi `lib/slug.ts`**

```ts
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
```

- [ ] **Step 4: Jalankan, pastikan lulus** → `pnpm test tests/collections/lembaga.slug.test.ts` → PASS.

- [ ] **Step 5: Buat koleksi Lembaga**

`collections/Lembaga.ts` (ringkas): slug unik (hook `beforeValidate` pakai `toSlug`), field `nama`, `kategori` (select: pendidikan/operasional), `deskripsi`, `profilImage` (upload), `isActive` (checkbox), akses: read publik bila `isActive`, write `isAdminOrEditor`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Lembaga collection with slug + access control"
```

---

### Task 6: Koleksi `Kajian` (3 tipe: video/artikel/kitab)

**Files:**
- Create: `collections/Kajian.ts`
- Modify: `payload.config.ts`
- Test: `tests/collections/kajian.validation.test.ts`

**Interfaces:**
- Produces: koleksi `kajian` dengan `type` = `video|artikel|kitab`; field kondisional (`youtubeId`, `body`, `pdf`).

- [ ] **Step 1: Tulis test validasi kondisional yang gagal**

```ts
import { describe, it, expect } from 'vitest'
import { validateKajian } from '@/features/kajian/validate'

describe('validateKajian', () => {
  it('video requires youtubeId', () => {
    expect(validateKajian({ type: 'video' }).ok).toBe(false)
    expect(validateKajian({ type: 'video', youtubeId: 'abc' }).ok).toBe(true)
  })
  it('kitab requires pdf', () => {
    expect(validateKajian({ type: 'kitab' }).ok).toBe(false)
    expect(validateKajian({ type: 'kitab', pdfId: 'file-1' }).ok).toBe(true)
  })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal** → FAIL.

- [ ] **Step 3: Implementasi `features/kajian/validate.ts` (murni, tanpa Payload)**

```ts
export type KajianType = 'video' | 'artikel' | 'kitab'
export type KajianInput = {
  type: KajianType
  youtubeId?: string
  body?: string
  pdfId?: string
}
export function validateKajian(input: KajianInput): { ok: boolean; error?: string } {
  if (input.type === 'video' && !input.youtubeId) return { ok: false, error: 'youtubeId wajib' }
  if (input.type === 'artikel' && !input.body) return { ok: false, error: 'body wajib' }
  if (input.type === 'kitab' && !input.pdfId) return { ok: false, error: 'pdf wajib' }
  return { ok: true }
}
```

- [ ] **Step 4: Jalankan, pastikan lulus** → PASS.

- [ ] **Step 5: Buat koleksi Kajian** dengan hook `beforeValidate` memanggil `validateKajian`; field kondisional via Payload `admin.condition`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Kajian collection (video/artikel/kitab) with validation"
```

---

### Task 7: Koleksi `PhbiRecap` + `SyncRun` + kontrak snapshot Sheet→DB

**Files:**
- Create: `collections/PhbiRecap.ts`, `collections/SyncRun.ts`, `features/sync/phbi/parse.ts`, `features/sync/phbi/sync.ts`
- Modify: `payload.config.ts`
- Test: `tests/sync/phbi.parse.test.ts`

**Interfaces:**
- Produces: `parsePhbiRows(csv: string): PhbiRow[]` (Zod-validated, idempoten via `row_key`); `runPhbiSync(payload)` meng-upsert + menulis `sync_run`.

- [ ] **Step 1: Tulis test parser yang gagal**

```ts
import { describe, it, expect } from 'vitest'
import { parsePhbiRows } from '@/features/sync/phbi/parse'

describe('parsePhbiRows', () => {
  it('parses valid rows and builds stable row_key', () => {
    const csv = 'event,year,date,description\nIdul Adha,2024,2024-06-10,qurban\n'
    const rows = parsePhbiRows(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].rowKey).toBe('idul-adha-2024')
  })
  it('drops rows missing required fields', () => {
    const csv = 'event,year,date,description\n,2024,,\n'
    expect(parsePhbiRows(csv)).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal** → FAIL.

- [ ] **Step 3: Implementasi `features/sync/phbi/parse.ts` (Zod)**

```ts
import { z } from 'zod'
import { toSlug } from '@/lib/slug'

const Row = z.object({
  event: z.string().min(1),
  year: z.string().regex(/^\d{4}$/),
  date: z.string().min(1),
  description: z.string().default(''),
})

export type PhbiRow = z.infer<typeof Row> & { rowKey: string }

export function parsePhbiRows(csv: string): PhbiRow[] {
  const [header, ...lines] = csv.trim().split(/\r?\n/)
  const cols = header.split(',').map((c) => c.trim())
  const out: PhbiRow[] = []
  for (const line of lines) {
    const cells = line.split(',')
    const obj = Object.fromEntries(cols.map((c, i) => [c, (cells[i] ?? '').trim()]))
    const parsed = Row.safeParse(obj)
    if (!parsed.success) continue
    out.push({ ...parsed.data, rowKey: `${toSlug(parsed.data.event)}-${parsed.data.year}` })
  }
  return out
}
```

- [ ] **Step 4: Jalankan, pastikan lulus** → PASS.

- [ ] **Step 5: Implementasi `features/sync/phbi/sync.ts`**

`runPhbiSync(payload)`: fetch CSV (URL Sheet dari env `PHBI_SHEET_CSV_URL`) → `parsePhbiRows` → untuk tiap row `payload.update`/`create` by `rowKey` (upsert) → catat `sync_run` (startedAt, status, rowCount, error) → bila sukses, `revalidateTag('phbi')`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: PHBI Sheet->DB sync (parse + idempotent upsert + sync_run)"
```

---

### Task 8: Koleksi `Campaign`, `Donor`, `Prayer` + seam `PaymentProvider`

**Files:**
- Create: `collections/Campaign.ts`, `collections/Donor.ts`, `collections/Prayer.ts`, `features/donation/provider.ts`
- Modify: `payload.config.ts`
- Test: `tests/donation/provider.test.ts`

**Interfaces:**
- Produces: `PaymentProvider` interface + `ManualPaymentProvider`; koleksi donasi (payment gateway HOLD).

- [ ] **Step 1: Tulis test seam yang gagal**

```ts
import { describe, it, expect } from 'vitest'
import { ManualPaymentProvider } from '@/features/donation/provider'

describe('ManualPaymentProvider', () => {
  it('has stable id and does not invent a gateway', () => {
    const p = new ManualPaymentProvider()
    expect(p.id).toBe('manual')
  })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal** → FAIL.

- [ ] **Step 3: Implementasi `features/donation/provider.ts`**

```ts
export type DonationInput = { campaignId: string; amount: number; donorName: string; anonymous: boolean }
export type CreateResult = { token: string; orderId: string }

export interface PaymentProvider {
  id: string
  createTransaction(input: DonationInput): Promise<CreateResult>
}

export class ManualPaymentProvider implements PaymentProvider {
  id = 'manual'
  async createTransaction(input: DonationInput): Promise<CreateResult> {
    return { token: '', orderId: `MANUAL-${input.campaignId}-${Date.now()}` }
  }
}
```

- [ ] **Step 4: Jalankan, pastikan lulus** → PASS.

- [ ] **Step 5: Buat koleksi donasi** (Campaign, Donor, Prayer) dengan akses: read publik (campaign isActive), donor list publik read-only bila `isPublic`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: donation collections + PaymentProvider seam (manual)"
```

---

### Task 9: Koleksi `ContactMessage` + `SiteSettings`

**Files:**
- Create: `collections/ContactMessage.ts`, `globals/SiteSettings.ts`
- Modify: `payload.config.ts`
- Test: `tests/contact/rating.test.ts`

**Interfaces:**
- Produces: inbox kontak; pengaturan situs (kontak, sosial, jam operasional, mapping Sheet).

- [ ] **Step 1: Tulis test validasi rating yang gagal**

```ts
import { describe, it, expect } from 'vitest'
import { validateFeedback } from '@/features/contact/validate'

describe('validateFeedback', () => {
  it('rating must be 1..5', () => {
    expect(validateFeedback({ rating: 0, message: 'x' }).ok).toBe(false)
    expect(validateFeedback({ rating: 5, message: 'x' }).ok).toBe(true)
  })
  it('message required', () => {
    expect(validateFeedback({ rating: 3, message: '' }).ok).toBe(false)
  })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal** → FAIL.

- [ ] **Step 3: Implementasi `features/contact/validate.ts`**

```ts
export function validateFeedback(input: { rating: number; message: string }): { ok: boolean } {
  const ratingOk = Number.isInteger(input.rating) && input.rating >= 1 && input.rating <= 5
  const msgOk = input.message.trim().length > 0
  return { ok: ratingOk && msgOk }
}
```

- [ ] **Step 4: Jalankan, pastikan lulus** → PASS.

- [ ] **Step 5: Buat koleksi ContactMessage + global SiteSettings.**

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: ContactMessage + SiteSettings global"
```

---

### Task 10: Outbox + idempotency + relay endpoint

**Files:**
- Create: `collections/WebhookInbox.ts`, `app/api/outbox/relay/route.ts`, `features/outbox/relay.ts`
- Test: `tests/outbox/idempotency.test.ts`

**Interfaces:**
- Produces: `enqueueWebhook(payload, { provider, eventId, payloadHash })`; relay menghasilkan `200` bila diproses, `503` bila DB down.

- [ ] **Step 1: Tulis test idempotency yang gagal**

```ts
import { describe, it, expect } from 'vitest'
import { shouldAccept } from '@/features/outbox/idempotency'

describe('shouldAccept', () => {
  const key = (e: string, h: string) => `${e}:${h}`
  it('accepts new event', () => {
    expect(shouldAccept(new Map(), key('evt1', 'a'))).toBe('accept')
  })
  it('accepts duplicate same-hash (idempotent)', () => {
    const seen = new Map([[key('evt1', 'a'), 'processing']])
    expect(shouldAccept(seen, key('evt1', 'a'))).toBe('duplicate')
  })
  it('rejects same id different hash (fail closed)', () => {
    const seen = new Map([[key('evt1', 'a'), 'done']])
    expect(shouldAccept(seen, key('evt1', 'b'))).toBe('reject')
  })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal** → FAIL.

- [ ] **Step 3: Implementasi `features/outbox/idempotency.ts`**

```ts
export type Decision = 'accept' | 'duplicate' | 'reject'
export function shouldAccept(seen: Map<string, string>, key: string): Decision {
  const [eventId] = key.split(':')
  const sameIdDifferentHash = [...seen.keys()].some(
    (k) => k.split(':')[0] === eventId && k !== key,
  )
  if (sameIdDifferentHash) return 'reject'
  if (seen.has(key)) return 'duplicate'
  return 'accept'
}
```

- [ ] **Step 4: Jalankan, pastikan lulus** → PASS.

- [ ] **Step 5: Buat WebhookInbox collection + relay route.**

`app/api/outbox/relay/route.ts`: select `WHERE status = 'pending' FOR UPDATE SKIP LOCKED LIMIT 20` → proses → tandai done/dead. Terima GET dari pg_cron (verifikasi shared secret header `x-relay-secret`). Bila DB tak terjangkau → `503`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: transactional outbox + idempotency + relay endpoint"
```

---

### Task 11: Lifecycle L0 — health endpoints + scheduler Supabase (pg_cron/pg_net)

**Files:**
- Create: `app/api/health/route.ts`, `app/api/health/ready/route.ts`, `docs/sql/schedule.sql`, `docs/runbooks/ops.md`

**Interfaces:**
- Produces: `/api/health` (liveness, tanpa DB), `/api/health/ready` (DB `SELECT 1`); SQL penjadwal untuk relay + sync.

- [ ] **Step 1: Buat health liveness**

```ts
export const dynamic = 'force-static'
export function GET() {
  return Response.json({ ok: true, ts: Date.now() })
}
```

- [ ] **Step 2: Buat health readiness (cek DB)**

```ts
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.db.pool.query('SELECT 1')
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 503 })
  }
}
```

- [ ] **Step 3: Tulis SQL penjadwal (Supabase) `docs/sql/schedule.sql`**

```sql
-- aktifkan ekstensi (jalankan sekali di Supabase SQL editor)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- relay outbox tiap menit
select cron.schedule(
  'outbox-relay',
  '* * * * *',
  $$ select net.http_post(
       url := current_setting('app.relay_url'),
       headers := jsonb_build_object('x-relay-secret', current_setting('app.relay_secret'))
     ); $$
);
```

- [ ] **Step 4: Tulis runbook ops (monitoring, dead-man's-switch, rollback Vercel)**

`docs/runbooks/ops.md`: jelaskan (a) monitor `/api/health/ready` 60s, alert 2× gagal; (b) healthchecks.io ping dari job cron (dead-man's-switch); (c) rollback = `vercel promote <deployment>` (Pro: mana pun); **CATATAN KRITIS: rollback Vercel tidak mengembalikan cron & mematikan auto-assign domain** — maka scheduler tinggal di Supabase, bukan Vercel Cron.

- [ ] **Step 5: Verifikasi health lokal**

Run: `pnpm dev` → `curl localhost:3000/api/health` → `{"ok":true}`; `curl localhost:3000/api/health/ready` → 200/503 sesuai DB.
Expected: sesuai.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: L0 health endpoints + Supabase pg_cron/pg_net scheduler + ops runbook"
```

---

### Task 12: CI (lint + typecheck + test + migrate+build) + environment Vercel

**Files:**
- Create: `.github/workflows/ci.yml`, `vercel.json`
- Modify: `package.json`

**Interfaces:**
- Produces: pipeline yang menolak merge/deploy bila lint/typecheck/test/migrasi gagal.

- [ ] **Step 1: Tulis workflow CI**

`.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
```

- [ ] **Step 2: Konfigurasi build Vercel agar menjalankan migrasi lebih dulu**

`vercel.json`:
```json
{ "buildCommand": "pnpm ci:migrate && pnpm build" }
```

- [ ] **Step 3: Dokumentasikan env Vercel**

`docs/runbooks/deploy.md`: daftar env (`DATABASE_URL` pooled 6543, `DATABASE_URL_DIRECT` 5432, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `PHBI_SHEET_CSV_URL`, `RELAY_SECRET`), region co-locate Singapore, plan Pro.

- [ ] **Step 4: Verifikasi CI lokal**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: semua lulus.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "ci: add pipeline (lint/typecheck/test) + Vercel build-with-migrate"
```

---

## Self-Review

**1. Spec coverage (spec v3 → task):**
- Satu app + Payload in-app → Task 1, 2 ✅
- Payload owns 100% schema → Global Constraints + Task 4 ✅
- RBAC 2 role → Task 3 ✅
- Migrasi ter-gate + additive → Task 4 ✅
- Durability → Task 4 (koneksi) + runbook Task 11 ✅ (backup Supabase Pro = konfigurasi dashboard, dicatat di runbook)
- L0 lifecycle (health, scheduler, outbox, rollback) → Task 10, 11 ✅
- PHBI Sheet→DB snapshot + revalidateTag → Task 7 ✅
- Donasi seam (hold) → Task 8 ✅
- Kontak/settings → Task 9 ✅
- CI → Task 12 ✅
- *Gap yang sengaja jadi Plan terpisah:* migrasi `apps/web` ke `features/` + error boundary + ISR (Plan 2), halaman publik per modul (Plan 3), donasi UI (Plan 4).

**2. Placeholder scan:** Tidak ada "TBD/TODO". Instruksi "ambil dari `create-payload-app`" disengaja (bukan placeholder — file generated harus disalin persis, bukan ditulis ulang dari ingatan, karena berubah antar versi).

**3. Type consistency:** `toSlug` (Task 5) dipakai Task 7; `isAdmin`/`isAdminOrEditor` (Task 3) dipakai Task 5–9; `PaymentProvider` (Task 8); `shouldAccept` (Task 10) dipakai relay. Konsisten.

---

## Urutan Plan berikutnya (belum ditulis — konfirmasi dulu)

- **Plan 2 — Web FSD-lite + error boundary + ISR:** restrukturisasi `features/`, `error.tsx`/`loading.tsx`/`not-found.tsx` per segmen, `global-error.tsx`, uji isolasi segmen.
- **Plan 3 — Halaman publik per modul:** tentang-kami, publikasi, kegiatan (lembaga/kajian/recap), donasi, kontak — baca dari DB, tampilan kartu.
- **Plan 4 — Donasi (seam) + Kontak submission:** Server Actions, form, inbox.
- **Plan 5 — Durability & Ops lengkap:** backup off-site, restore drill, monitoring, PITR trigger.
