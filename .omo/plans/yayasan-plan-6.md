# Plan 6 — Hardening & Integration Tests (Yayasan Al-Muhajirin) — REVISI 1

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Menutup sisa risiko lewat **integration test ke sandbox Supabase** (fail-closed), proof bentuk error Payload nyata, access-control e2e (draft & PII), concurrency relay deterministik, dan restore drill nyata — sehingga plan set production-grade.

**Architecture:** Test integrasi WAJIB memakai **proyek Supabase sandbox terpisah** (via `DATABASE_URL_DIRECT_SANDBOX`), dan **fail-closed**: bila dipanggil di CI tanpa sandbox → **throw**, bukan skip senyap. Tanpa Docker. Requirement inti utuh.

**Tech Stack:** Vitest, Payload Local API, Supabase sandbox, `pg`, Node `fetch`.

## Global Constraints
- **CANONICAL ROOT `src/`**.
- **Fail-closed sandbox:** `tests/integration/setup.ts` men-set `process.env.DATABASE_URL = DATABASE_URL_DIRECT_SANDBOX` SEBELUM `getPayload` di-import; bila `CI=true` & sandbox kosong → **throw**. Bila sandbox == prod ref → **throw**.
- Pemakaian **`DATABASE_URL_DIRECT_SANDBOX`** (dideklarasikan di Plan 1 `.env.example`).
- Semua test **idempoten**: prefix unik run + `afterAll` cleanup.
- Test akses WAJIB punya **positive control** (bukan sekadar assert "kosong").
- Concurrency test WAJIB bikin implementasi serial GAGAL (negative control `SKIP LOCKED`).
- Setiap task berakhir commit.

## Todos

- [ ] 1. Harness integrasi fail-closed + wiring ke `DATABASE_URL`
- [ ] 2. Integration test bentuk error nyata Payload (`ValidationError`, bukan `23505`)
- [ ] 3. Access-control e2e dengan positive control (draft & donor PII)
- [ ] 4. Concurrency relay deterministik (HTTP, overlap, negative control)
- [ ] 5. Restore drill nyata (flag dump benar + assert kuat)
- [ ] 6. CI integration job + seed migrasi sandbox
- [ ] 7. Assertion unique index `clientToken` di migrasi (Plan 1 Task 17 lanjutan)

## Final Verification Wave

- [ ] F6. Verifikasi akhir Plan 6 — perintah eksplisit: `pnpm vitest --project integration` (dengan sandbox) → `N passed, 0 skipped`; concurrency: `processed===20 && disjoint===20`; access: `anon.length===1` & tak memuat draft/non-public; restore: row counts == source & `payload_migrations` utuh. Catat hasil di `docs/runbooks/testing.md`.

---

### Task 1: Harness integrasi fail-closed + wiring
**Files:** `tests/integration/setup.ts`, `tests/integration/guard.ts`, `vitest.config.ts`; Modify `.env.example` (Plan 1 Task 7).
- **Step 0: Deklarasikan env (di Plan 1 `.env.example`):**
```
DATABASE_URL_DIRECT_SANDBOX=postgres://postgres.<sandbox-ref>:<pw>@db.<sandbox-ref>.supabase.co:5432/postgres
```
(Cara dapat: buat proyek Supabase kedua (gratis), salin URI **direct 5432**.)
- **Step 1: `tests/integration/setup.ts`** — fail-closed + wiring:
```ts
const SANDBOX = process.env.DATABASE_URL_DIRECT_SANDBOX
if (process.env.CI === 'true' && !SANDBOX) {
  throw new Error('FATAL: CI integration tanpa DATABASE_URL_DIRECT_SANDBOX — menolak jalan/skip')
}
export const hasSandbox = Boolean(SANDBOX)
if (hasSandbox) process.env.DATABASE_URL = SANDBOX // WAJIB sebelum getPayload di-import
```
> Jangan sentuh `src/payload.config.ts` (tetap baca `DATABASE_URL`).
- **Step 2: `tests/integration/guard.ts`** — assert bukan prod:
```ts
export function assertNotProd() {
  const prod = process.env.DATABASE_URL_DIRECT ?? ''
  const sb = process.env.DATABASE_URL_DIRECT_SANDBOX ?? ''
  const refOf = (u: string) => u.match(/postgres\.([a-z0-9]+):/)?.[1] ?? u.match(/db\.([a-z0-9]+)\./)?.[1] ?? ''
  if (refOf(prod) && refOf(prod) === refOf(sb)) throw new Error('sandbox ref == prod ref — DIBATALKAN')
}
```
- **Step 3: `vitest.config.ts`** — dua project dengan include presisi:
```ts
export default defineConfig({ test: { projects: [
  { test: { name: 'unit', include: ['tests/**/*.test.ts'], exclude: ['tests/integration/**'] } },
  { test: { name: 'integration', include: ['tests/integration/**/*.test.ts'], testTimeout: 60000 } },
] } })
```
- **Step 4:** `pnpm test` (unit) hijau tanpa sandbox. **Step 5: Commit** `git commit -m "test: fail-closed integration harness + sandbox wiring"`

---

### Task 2: Bentuk error nyata Payload
**Files:** `tests/integration/donation.error-shape.test.ts`; Modify `src/features/donation/actions.ts` (export `isUniqueViolation`).
- **Step 1:** Export `isUniqueViolation` dari `actions.ts` (agar bisa di-test langsung).
- **Step 2:** Test — buktikan **bentuk nyata** + `isUniqueViolation` benar:
```ts
import { describe, it, expect, beforeAll } from 'vitest'
import { hasSandbox } from './setup'
import { assertNotProd } from './guard'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isUniqueViolation } from '@/features/donation/actions'
describe.runIf(hasSandbox)('Payload unique error shape', () => {
  let payload: Awaited<ReturnType<typeof getPayload>>
  beforeAll(async () => { assertNotProd(); payload = await getPayload({ config }) })
  it('second insert same clientToken throws; isUniqueViolation true', async () => {
    const tok = `ERR-${Date.now()}`
    await payload.create({ collection: 'donors', data: { campaignSlug: 'x', clientToken: tok, name: 'A', amount: 10000, isAnonymous: false, isPublic: false }, overrideAccess: true })
    let caught: unknown
    try { await payload.create({ collection: 'donors', data: { campaignSlug: 'x', clientToken: tok, name: 'B', amount: 10000, isAnonymous: false, isPublic: false }, overrideAccess: true }) }
    catch (e) { caught = e }
    expect(caught).toBeDefined()                 // WAJIB throw (anti vacuous pass)
    expect(isUniqueViolation(caught)).toBe(true) // predicate produksi BENAR
    await payload.delete({ collection: 'donors', where: { clientToken: { equals: tok } }, overrideAccess: true })
  })
})
```
- **Step 3:** Jalankan ke sandbox → PASS (membuktikan `ValidationError` → `isUniqueViolation` true). **Step 4: Commit** `git commit -m "test: real Payload unique-error shape (ValidationError)"`

---

### Task 3: Access-control e2e (positive control)
**Files:** `tests/integration/access.leak.test.ts`.
- **Step 1:** Buat: 1 `publikasi` **published** + 1 **draft**; 1 donor `isPublic:true` + 1 `isPublic:false` (nama unik per-run). Assert tiap `create` mengembalikan `id` (non-vacuity).
- **Step 2 (anon, fidelity produksi):** `overrideAccess:false`, tanpa user:
```ts
const anonPub = await payload.find({ collection: 'publikasi', overrideAccess: false })
expect(anonPub.docs.length).toBe(1)                            // positive control: publik kelihatan
const anonDon = await payload.find({ collection: 'donors', overrideAccess: false, where: { isPublic: { equals: true } } })
expect(anonDon.docs.length).toBe(1)                            // exactly 1 (bukan 0 vacuous)
expect(anonDon.docs[0].name).toContain(RUN_PREFIX)             // yang publik
// draft & donor non-public TIDAK muncul:
expect(anonPub.docs.some(d => d._status === 'draft')).toBe(false)
expect(anonDon.docs.some(d => d.isPublic === false)).toBe(false)
```
- **Step 3 (admin):** `payload.find({ collection:'publikasi', overrideAccess:true })` → memuat draft; donor non-public tampak. **Step 4:** cleanup `afterAll`. **Step 5: Commit** `git commit -m "test: access leak e2e with positive controls"`

---

### Task 4: Concurrency relay deterministik (HTTP)
**Files:** `tests/integration/outbox.concurrency.test.ts`; Modify relay route: hook `RELAY_TEST_DELAY_MS` (hanya aktif bila env set) + dukung `RELAY_DISABLE_SKIP_LOCKED=1` untuk kontrol negatif.
- **Step 1:** Insert 20 `webhook-inbox` `status='pending'` (prefix run). Set `RELAY_SECRET`.
- **Step 2:** Dua `fetch('/api/outbox/relay')` **benar-benar overlap** (`Promise.all`), dengan `RELAY_TEST_DELAY_MS=300` (relay menahan lock antara SELECT & UPDATE → memaksa `SKIP LOCKED` bekerja).
```ts
const [a, b] = await Promise.all([
  fetch(`${BASE}/api/outbox/relay`, { headers: { 'x-relay-secret': SECRET } }),
  fetch(`${BASE}/api/outbox/relay`, { headers: { 'x-relay-secret': SECRET } }),
])
```
- **Step 3:** Assert `processed === 20` **dan** `claimedIdsA ∩ claimedIdsB === ∅` **dan** `|A ∪ B| === 20` (overlap nyata terjadi). Simpan `claimedIds` di response (test-only).
- **Step 4 (negative control):** jalankan ulang dengan `RELAY_DISABLE_SKIP_LOCKED=1` → **assert gagal** (`processed > 20`) → membuktikan test mampu GAGAL.
- **Step 5: Commit** `git commit -m "test: deterministic relay concurrency (overlap + negative control)"`

---

### Task 5: Restore drill nyata (flag benar + assert kuat)
**Files:** `scripts/restore-drill.mjs` (dari Plan 5; **jangan buat ulang**), `docs/runbooks/restore.md`.
- **Step 1 (dump dengan flag benar — perbaiki juga Plan 5 Task 1):**
```bash
pg_dump "$DATABASE_URL_DIRECT" -Fc --no-owner --no-privileges --schema=public \
  --exclude-schema=auth --exclude-schema=storage --exclude-schema=graphql \
  -f backup.dump
```
- **Step 2:** `pg_restore` ke proyek throwaway → assert: row count **== sumber** (bukan sekadar >0) untuk `campaigns`,`donors`; `payload_migrations` utuh; boot aplikasi (smoke) terhadap DB hasil restore.
- **Step 3:** Catat RPO/RTO nyata + tanggal. **Step 4: Commit** `git commit -m "ops: restore drill (public schema, no-owner, strong asserts)"`

---

### Task 6: CI integration job + seed migrasi sandbox
**Files:** `.github/workflows/ci.yml`, `docs/runbooks/testing.md`.
- **Step 1: job `integration`** — `if: ${{ secrets.DATABASE_URL_DIRECT_SANDBOX != '' }}`; langkah: **apply migrasi ke sandbox** (`DATABASE_URL=$DATABASE_URL_DIRECT_SANDBOX pnpm migrate`) → `pnpm vitest --project integration`.
- **Step 2:** Bila di `main`/release dan secret kosong → **warning mencolok** (bukan hijau senyap).
- **Step 3:** `docs/runbooks/testing.md` — cara dapat sandbox + jalankan. **Step 4: Commit** `git commit -m "ci: integration job (migrate sandbox first)"`

---

### Task 7: Assertion unique index `clientToken`
**Files:** `docs/runbooks/deploy.md`; lanjutan Plan 1 Task 17.
- **Step 1:** Setelah `migrate:create`, verify SQL: `grep -Ri "client_token\|clientToken" src/migrations | grep -i unique` → **non-kosong**.
- **Step 2:** Verifikasi **DB-level** (bukan validation Payload): `psql "$DATABASE_URL_DIRECT_SANDBOX" -c "\\d donors"` → ada unique index pada `client_token`.
- **Step 3: Commit** `git commit -m "test: assert unique index on donors.client_token"`

## Self-Review
- Menutup temuan Oracle+Momus: M1 (bentuk error nyata + predicate benar), M2 (fail-closed), M3 (concurrency deterministik + negative control), M4 (restore flag+assert), M5 (uji jalur), M6 (positive control); blocker Momus (env dideklarasikan, wiring `DATABASE_URL`, symbol nyata, admin overrideAccess, de-dup Plan 5).
- Requirement inti utuh; tanpa Docker; payment hold.
- Scope Plan 6 = **test saja** (+ 2 export kecil); tak mengubah arsitektur.
