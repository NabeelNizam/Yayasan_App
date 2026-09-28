# Plan 2 — Struktur Web, Error Boundary, ISR & Media (REVISI 3 — path `src/`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Struktur `src/app/(site)` + `src/features/` sederhana; error boundary per-segmen & per-widget; ISR + tag; media aman (tanpa proxy); bukti isolasi segmen yang benar-benar berjalan.

**Architecture:** Next.js 16.3.6. **CANONICAL ROOT = `src/`** (semua kode di `src/`; import via `@/*` → `./src/*`). Publik di `src/app/(site)`, admin di `src/app/(payload)`. `error.tsx` per-segmen (prop **`retry`**) + `WidgetBoundary` per-widget. Media via `next/image` `remotePatterns` + `onError` placeholder. Pembacaan publik via `PUBLIC_READ` + `readPublished`.

**Tech Stack:** Next.js 16.3.6, Payload 3.x, React `catchError`/ErrorBoundary, Vitest.

## Global Constraints
- **Path `src/`**: `src/app/(site)/...`, `src/features/...`, `src/components/...`, `src/lib/...`.
- Tidak fetch di `layout.tsx`. `unstable_rethrow` di awal `catch`.
- Prop error boundary = **`retry`** (bukan `unstable_retry`); `error.tsx` `'use client'`; `global-error.tsx` render html+body.
- Pembacaan publik: `PUBLIC_READ` (`overrideAccess:false`) **DAN** koleksi punya `read: readPublished`.
- Media via `MediaImage`; `next/image` `remotePatterns` host `*.supabase.co` path `/storage/v1/object/public/media/**`; lint `no-img-element` = 0 warning.
- Port dev = `3000`. Copy Bahasa Indonesia. Verifikasi di Linux/Git Bash. Setiap task berakhir commit.

## Todos

- [ ] 1. `src/app/(site)` layout + heading penanda
- [ ] 2. `global-error.tsx` + `not-found.tsx` (prop `retry`)
- [ ] 3. Getters ISR + tag + `PUBLIC_READ`
- [ ] 4. Error boundary per-segmen (prop `retry`)
- [ ] 5. `unstable_rethrow` di getter `notFound()`
- [ ] 6. `WidgetBoundary` per-widget
- [ ] 7. Uji isolasi segmen (runnable)
- [ ] 8. `MediaImage` + `remotePatterns` (TANPA proxy)
- [ ] 9. Koreksi spec `docs/` → Vercel + deprecate plan lama
- [ ] 10. Route modul kosong (error-protected)

## Final Verification Wave

- [ ] F2. Verifikasi akhir Plan 2 (lint+typecheck+test+build; uji isolasi PASS; 0 warning no-img)

---

### Task 1: `src/app/(site)` layout + heading penanda
**Files:** `src/app/(site)/layout.tsx`; `src/app/(site)/page.tsx`.
- **Step 1:** `layout.tsx` shell statis (tanpa fetch) `<div className="min-h-screen">`.
- **Step 2:** `page.tsx` **WAJIB memuat `<h1>Yayasan Al-Muhajirin</h1>`** (penanda konten Task 7).
- **Step 3:** `pnpm build` sukses. **Step 4: Commit** `git commit -m "refactor: (site) layout + marker heading"`

---

### Task 2: `global-error.tsx` + `not-found.tsx` (prop `retry`)
**Files:** `src/app/global-error.tsx`, `src/app/not-found.tsx`.
- **Step 1: `global-error.tsx`**
```tsx
'use client'
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (<html lang="id"><body style={{ padding: 24 }}><h2>Terjadi kesalahan sistem</h2><button onClick={() => retry()}>Coba lagi</button></body></html>)
}
```
- **Step 2:** `not-found.tsx` + Link ke `/`. **Step 3:** `pnpm dev` `/halaman-tidak-ada` → 404. **Step 4: Commit** `git commit -m "feat: global-error + not-found (retry)"`

---

### Task 3: Getters ISR + tag + `PUBLIC_READ`
**Files:** `src/features/data/getters.ts`; Test `tests/data.getters.test.ts`.
- **Step 1: Test gagal** (`REVALIDATE_SECONDS===300`, `PHBI_TAG==='phbi'`).
- **Step 2:** FAIL. **Step 3: Implementasi**
```ts
import { unstable_cache } from 'next/cache'
export const REVALIDATE_SECONDS = 300
export const PHBI_TAG = 'phbi'
export const PUBLIC_READ = { overrideAccess: false as const }
export function tagged<TArgs extends unknown[], TResult>(keyParts: string[], tags: string[], fn: (...args: TArgs) => Promise<TResult>) {
  return unstable_cache(fn, keyParts, { revalidate: REVALIDATE_SECONDS, tags })
}
```
- **Step 4:** PASS. **Step 5: Commit** `git commit -m "feat: public getters (ISR+tag+PUBLIC_READ)"`

---

### Task 4: Error boundary per-segmen (prop `retry`)
**Files:** `src/components/ErrorFallback.tsx`, `src/app/(site)/{kegiatan,kajian,recap,donasi,kontak,tentang-kami,publikasi}/error.tsx`.
- **Step 1:** `ErrorFallback` (`'use client'`, props `{ title, onRetry }`).
- **Step 2:** tiap `error.tsx`:
```tsx
'use client'
import ErrorFallback from '@/components/ErrorFallback'
export default function RecapError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorFallback title="Rekap PHBI sedang tidak tersedia" onRetry={retry} />
}
```
Ulangi untuk `kajian`, `donasi`, `kontak`, `tentang-kami`, `publikasi`, `kegiatan`.
- **Step 3: Commit** `git commit -m "feat: per-segment error boundaries (retry)"`

---

### Task 5: `unstable_rethrow` di getter
**Files:** `src/features/data/getBySlug.ts`; Test `tests/data.getBySlug.test.ts`.
- **Step 1: Test gagal** (`pickOrNull`). **Step 2:** FAIL. **Step 3: Implementasi**
```ts
import { notFound, unstable_rethrow } from 'next/navigation'
export function pickOrNull<T extends { slug: string }>(items: T[], slug: string): T | null {
  return items.find((i) => i.slug === slug) ?? null
}
export async function requireBySlug<T extends { slug: string }>(load: () => Promise<T[]>, slug: string): Promise<T> {
  try {
    const items = await load(); const found = pickOrNull(items, slug)
    if (!found) notFound(); return found as T
  } catch (err) { unstable_rethrow(err); throw err }
}
```
- **Step 4:** PASS. **Step 5: Commit** `git commit -m "feat: slug getter + unstable_rethrow"`

---

### Task 6: `WidgetBoundary` per-widget
**Files:** `src/components/WidgetBoundary.tsx`; Test `tests/widget.boundary.test.ts`.
- **Step 1: Test gagal** (render fallback saat anak throw). **Step 2:** FAIL. **Step 3: Implementasi**
```tsx
'use client'
import { Component, type ReactNode } from 'react'
export default class WidgetBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}
```
- **Step 4:** PASS. **Step 5:** bungkus section home dengan `WidgetBoundary` (fallback "Data sedang diperbarui"). **Step 6: Commit** `git commit -m "feat: per-widget error boundary"`

---

### Task 7: Uji isolasi segmen (runnable)
**Files:** `src/app/(site)/test-throw/page.tsx`, `src/app/(site)/test-throw/error.tsx`, `src/app/(site)/no-boundary/page.tsx` (tanpa error.tsx), `tests/segment-isolation.test.ts`.
**Catatan semantik Next 16:** RSC yang throw DAN punya `error.tsx` sendiri → **HTTP 200** (boundary render in-place). Hanya error yang lolos ke atas **tanpa** boundary selevel → **500**. Test harus mengassert yang BENAR.
- **Step 1: Halaman pemicu (dengan boundary)**
```tsx
export const dynamic = 'force-dynamic'
export default function ThrowPage() {
  if (process.env.ENABLE_TEST_THROW === '1') throw new Error('intentional test error')
  return <div>ok</div>
}
```
`src/app/(site)/test-throw/error.tsx` render fallback ber-marker `Data sedang diperbarui`.
- **Step 1b: Halaman tanpa boundary** `src/app/(site)/no-boundary/page.tsx` (throw bila flag) — **tanpa** `error.tsx` → untuk membuktikan jalur 500.
- **Step 2: Test**
```ts
import { describe, it, expect } from 'vitest'
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'
const get = async (p: string) => { const r = await fetch(`${BASE}${p}`, { redirect: 'manual' }); return { status: r.status, body: await r.text() } }
describe('segment isolation', () => {
  it('bounded throw → 200+fallback; unbounded → 500; siblings intact', async () => {
    const [t, nb, home, tentang, health] = await Promise.all([get('/test-throw'), get('/no-boundary'), get('/'), get('/tentang-kami'), get('/api/health')])
    expect(t.status).toBe(200)                       // boundary aktif → 200
    expect(t.body).toContain('Data sedang diperbarui') // fallback marker → boundary benar-benar jalan
    expect(t.body).not.toContain('intentional test error')
    expect(nb.status).toBe(500)                      // tanpa boundary → 500 (jalur benar)
    expect(home.status).toBe(200); expect(tentang.status).toBe(200); expect(health.status).toBe(200)
    expect(home.body).toContain('Yayasan Al-Muhajirin')
  })
})
```
- **Step 3:** alur tunggal:
```bash
ENABLE_TEST_THROW=1 pnpm build
ENABLE_TEST_THROW=1 pnpm start & SRV=$!
until curl -sf localhost:3000/api/health >/dev/null; do sleep 1; done
pnpm test tests/segment-isolation.test.ts; RC=$?
kill $SRV; exit $RC
```
- **Step 4: Commit** `git commit -m "test: segment isolation (200+fallback vs 500 unbounded)"`

---

### Task 8: `MediaImage` + `remotePatterns` (TANPA proxy)
**Files:** `src/components/MediaImage.tsx`; Modify `next.config.ts`.
- **Step 1: `next.config.ts`** tambah `images.remotePatterns: [{ protocol:'https', hostname:'*.supabase.co', pathname:'/storage/v1/object/public/media/**' }]` (gabung dengan `withPayload`).
- **Step 2:** `MediaImage.tsx` (`'use client'`) — `next/image` `onError` → placeholder `/images/placeholder.svg` (tanpa route server).
- **Step 3:** Verifikasi URL rusak → placeholder, halaman tetap 200. **Step 4: Commit** `git commit -m "feat: MediaImage + remotePatterns (no proxy)"`

---

### Task 9: Koreksi spec `docs/` → Vercel + deprecate plan lama
**Files:** `docs/superpowers/specs/2026-09-27-yayasan-arsitektur-design.md`; `docs/superpowers/plans/2026-09-27-plan-1-foundation-cms.md`.
- **Step 1:** Ganti semua "container Docker"/"VPS"/"long-running container"/"entrypoint" → **Vercel Pro (serverless)**; **hapus/ganti juga §4 (Turborepo/monorepo) dan §11 (Drizzle/Supabase Auth) di body spec** — arsitektur final = 1 app Next.js + Payload (tanpa Turborepo, tanpa packages, tanpa Drizzle terpisah).
- **Step 2:** Migrasi: CI step ter-gate `VERCEL_ENV==='production'` + `src/migrations` di-generate; scheduler `pg_cron`/`pg_net`; koneksi transaction mode 6543 + `prepare:false`; rollback `vercel rollback`.
- **Step 3:** Verifikasi portabel (harus `PASS`): `grep -riE 'docker|vps|container|entrypoint|turborepo|apps/web|apps/admin|drizzle|packages/db' docs/superpowers/specs/2026-09-27-yayasan-arsitektur-design.md && echo FAIL || echo PASS`.
- **Step 4:** Tandai plan lama `docs/.../plan-1-foundation-cms.md` di baris pertama: `> DEPRECATED — digantikan .omo/plans/yayasan-plan-*.md`.
- **Step 5: Commit** `git commit -m "docs: align spec to Vercel; deprecate old plan"`

---

### Task 10: Route modul kosong (error-protected)
**Files:** `src/app/(site)/{tentang-kami,publikasi,kegiatan,donasi,kontak}/page.tsx` (bila belum ada dari move Task 4 Plan 1).
- **Step 1:** pastikan tiap page ada + `export const revalidate = REVALIDATE_SECONDS`. **Step 2:** `pnpm build && pnpm lint`. **Step 3: Commit** `git commit -m "feat: public route scaffolding"`

## Self-Review
- Fix audit: semua path `src/` (A), heading penanda (B/Task 1), isolasi one-flow (Task 7), grep portabel + deprecate (Task 9), media tanpa proxy (Task 8), prop `retry` (Task 2/4).
- Coverage spec: layout (1), global-error (2), getters (3), error per-segmen (4), unstable_rethrow (5), widget boundary (6), isolasi (7), media (8), spec (9), rute (10).
- Type consistency: `PUBLIC_READ`/`tagged`/`PHBI_TAG`/`REVALIDATE_SECONDS` (3) dipakai Plan 3; `MediaImage` (8) dipakai Plan 3.
