# Plan 4 — Donasi (Seam Manual) & Kontak Submission (REVISI 3 — path `src/`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Alur donasi (gateway ON HOLD → provider `manual`), simpan donor/doa + konfirmasi WhatsApp, dan form kritik & saran ke DB + inbox admin. Server Actions + Zod satu sumber, idempotency DB (pre-`find` `clientToken` + unique index).

**Architecture:** **CANONICAL ROOT `src/`**. Form → Server Action (Zod) → koleksi Payload (`donors`,`prayers`,`contact-messages`). Idempotency donasi via **pre-`find` pada `clientToken`** (jalur utama) + unique index sebagai jaring race; race ditangkap sebagai **`ValidationError`** Payload (BUKAN `23505`). Tidak ada SDK gateway di luar seam.

**Tech Stack:** Next.js 16.3.6 Server Actions, Payload Local API, Zod, Vitest.

## Global Constraints
- Gateway TIDAK diaktifkan; hanya `ManualPaymentProvider`. Endpoint donasi lama sudah di-nonaktifkan (Plan 1 Task 1/4: `PAYMENT_ENABLED=false`).
- **Path `src/`**. Mutasi via Server Actions; Zod satu sumber; `unstable_rethrow` bila `catch` memanggil `redirect()`.
- **Idempotency donasi: pre-`find` pada `clientToken` (jalur utama) + unique index sebagai jaring race** (race → `ValidationError` Payload, BUKAN `23505`).
- Slug jamak: `donors`,`prayers`,`contact-messages`. Copy Bahasa Indonesia. Setiap task berakhir commit.

## Todos

- [ ] 1. Skema Zod donasi + kontak + field `clientToken` unik
- [ ] 2. Server Action `submitDonation` (manual) + idempotency DB
- [ ] 3. UI form donasi + dialog donasi besar (WhatsApp)
- [ ] 4. Server Action `submitFeedback` + inbox admin
- [ ] 5. Uji idempotency (anti double-submit) + doc rate-limit

## Final Verification Wave

- [ ] F4. Verifikasi akhir Plan 4 (build+lint+test; submit donasi dedup; feedback masuk inbox)

---

### Task 1: Skema Zod donasi + kontak
**Files:** `src/features/donation/schema.ts`, `src/features/contact/schema.ts`; Test keduanya.
- **Step 1: Test gagal** (tolak amount < MIN; terima valid; tolak WA salah).
- **Step 2:** FAIL. **Step 3: Implementasi**
```ts
import { z } from 'zod'
export const DONATION_LIMITS = { MIN: 10000, MAX: 1000000 } as const
const wa = /^(\+62|62|0)[0-9]{9,12}$/
export const donationSchema = z.object({
  campaignSlug: z.string().min(1),
  clientToken: z.string().min(8),
  donorName: z.string().min(3),
  anonymous: z.boolean(),
  whatsapp: z.string().regex(wa, 'Format nomor WhatsApp tidak valid'),
  email: z.string().email().optional().or(z.literal('')),
  amount: z.number().int().min(DONATION_LIMITS.MIN).max(DONATION_LIMITS.MAX),
  prayer: z.string().max(500).optional(),
})
export type DonationInput = z.infer<typeof donationSchema>
```
> **Prasyarat DB (Plan 1 Task 14):** `donors.clientToken` = `{ type:'text', required:true, unique:true, index:true }`; `prayers.token` unik.
- **Step 4:** PASS. **Step 5:** `src/features/contact/schema.ts` (rating 1..5, message min 1, honeypot kosong) + test. **Step 6: Commit** `git commit -m "feat: Zod schemas"`

---

### Task 2: Server Action `submitDonation` + idempotency DB
**Files:** `src/features/donation/actions.ts`; Test `tests/donation.action.test.ts`.
- **Step 1: Test (mock meniru perilaku Payload)** — token sama kedua kali → action `deduped:true` tanpa baris kedua (pre-`find` menangkapnya); invalid → tidak membuat. Mock `create` melempar **`ValidationError`** pada token duplikat:
```ts
if (data.clientToken && store.has(data.clientToken)) {
  throw Object.assign(new Error('Value must be unique'), { name: 'ValidationError', data: { errors: [{ message: 'Value must be unique', path: 'clientToken' }] } })
}
```ts
import { describe, it, expect, vi } from 'vitest'
const store = new Map<string, any>()
const mockPayload = {
  find: vi.fn(async ({ where }: any) => ({ docs: where?.clientToken?.equals && store.has(where.clientToken.equals) ? [store.get(where.clientToken.equals)] : [] })),
  create: vi.fn(async ({ data }: any) => {
    if (data.clientToken && store.has(data.clientToken)) throw Object.assign(new Error('Value must be unique'), { name: 'ValidationError', data: { errors: [{ message: 'Value must be unique', path: 'clientToken' }] } })
    store.set(data.clientToken, data); return { id: '1', ...data }
  }),
}
vi.mock('payload', () => ({ getPayload: vi.fn(async () => mockPayload) }))
vi.mock('@/payload.config', () => ({ default: {} }))
import { submitDonation } from '@/features/donation/actions'
const base = { campaignSlug: 'x', clientToken: 'tok-123456', donorName: 'Ali', anonymous: false, whatsapp: '081234567890', amount: 50000 }
describe('submitDonation', () => {
  it('creates once; second submit deduped', async () => {
    const a = await submitDonation(base); const b = await submitDonation(base)
    expect(a.ok).toBe(true); expect(b.ok).toBe(true); expect((b as any).deduped).toBe(true); expect(store.size).toBe(1)
  })
  it('rejects invalid', async () => { expect((await submitDonation({ ...base, whatsapp: 'bad' })).ok).toBe(false) })
})
```
- **Step 2:** FAIL. **Step 3: Implementasi**
```ts
'use server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { donationSchema } from './schema'
import { ManualPaymentProvider } from './provider'
const provider = new ManualPaymentProvider()
/**
 * Payload MEMBUNGKUS unique violation menjadi `ValidationError` (tanpa `.code`).
 * JANGAN cari '23505' di cause-chain (itu TIDAK ada di produksi).
 */
export function isUniqueViolation(e: unknown): boolean {
  const err = e as any
  // 1) Payload ValidationError (normal di produksi)
  if (err?.name === 'ValidationError') return true
  if (Array.isArray(err?.data?.errors)) {
    return err.data.errors.some((x: any) => String(x?.message ?? '').toLowerCase().includes('unique'))
  }
  // 2) Fallback: bila adapter melempar pg error mentah
  let cur: any = e
  while (cur) { if (cur.code === '23505') return true; cur = cur.cause }
  return false
}
export async function submitDonation(input: unknown) {
  const parsed = donationSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, errors: parsed.error.flatten().fieldErrors }
  const p = parsed.data
  const payload = await getPayload({ config })
  // Idempotency UTAMA: cek token dulu (Payload tidak andalkan 23505).
  const pre = await payload.find({ collection: 'donors', where: { clientToken: { equals: p.clientToken } }, limit: 1, overrideAccess: true })
  if (pre.docs.length > 0) {
    return { ok: true as const, orderId: (pre.docs[0] as any)?.orderId, deduped: true }
  }
  const { orderId } = await provider.createTransaction({ campaignSlug: p.campaignSlug, amount: p.amount, donorName: p.donorName, anonymous: p.anonymous })
  // Donor + prayer ATOMIK via Payload transaction API.
  const tx = await payload.db.beginTransaction() // returns bare id (string|number), BUKAN object
  if (!tx) throw new Error('DB tidak mendukung transaksi')
  try {
    await payload.create({ collection: 'donors', req: { transactionID: tx }, data: { campaignSlug: p.campaignSlug, clientToken: p.clientToken, name: p.anonymous ? 'Hamba Allah' : p.donorName, amount: p.amount, isAnonymous: p.anonymous, orderId } })
    if (p.prayer) await payload.create({ collection: 'prayers', req: { transactionID: tx }, data: { token: p.clientToken, campaignSlug: p.campaignSlug, donorName: p.anonymous ? 'Hamba Allah' : p.donorName, isAnonymous: p.anonymous, message: p.prayer } })
    await payload.db.commitTransaction(tx)
  } catch (err) {
    await payload.db.rollbackTransaction(tx)
    // Race: dua submit paralel token sama → salah satu kena unique (ValidationError).
    if (isUniqueViolation(err)) {
      const existing = await payload.find({ collection: 'donors', where: { clientToken: { equals: p.clientToken } }, limit: 1, overrideAccess: true })
      return { ok: true as const, orderId: (existing.docs[0] as any)?.orderId ?? orderId, deduped: true }
    }
    throw err
  }
  return { ok: true as const, orderId }
}
```
> **KOREKSI PENTING:** `payload.db.beginTransaction()` mengembalikan **id langsung** (`string|number`) → pakai `tx` (BUKAN `tx.id`) di `req.transactionID`, `commitTransaction(tx)`, `rollbackTransaction(tx)`. Idempotency **tidak** mengandalkan kode `23505` (Payload membungkusnya jadi `ValidationError`); gunakan pre-`find` + tangkap `ValidationError`.
- **Step 4:** PASS. **Step 5: Commit** `git commit -m "feat: submitDonation (DB idempotency + atomic donor+prayer)"`

---

### Task 3: UI form donasi + dialog donasi besar
**Files:** `src/app/(site)/donasi/[slug]/components/{DonationForm,LargeDonationDialog}.tsx`; Modify page.
- **Step 1:** Form (client) quick amounts, toggle anonim, WA, amount, doa; **`clientToken = crypto.randomUUID()`** saat mount; kirim ke `submitDonation`.
- **Step 2:** `amount > MAX` → `LargeDonationDialog` (wa.me), tidak submit.
- **Step 3:** Verifikasi: submit valid → data masuk `/admin`. **Step 4: Commit** `git commit -m "feat: donation form + big-donation dialog"`

---

### Task 4: Server Action `submitFeedback` + inbox admin
**Files:** `src/features/contact/actions.ts`, `src/app/(site)/kontak/components/FeedbackForm.tsx`; Modify page.
- **Step 1: Test gagal** (honeypot terisi → tolak tanpa menyimpan). **Step 2:** FAIL.
- **Step 3:** implementasi `submitFeedback` (Zod + honeypot + `payload.create({ collection:'contact-messages', ... })`). **Step 4:** PASS.
- **Step 5:** `FeedbackForm.tsx` (rating, pesan, anonim, honeypot tersembunyi) + render. **Step 6:** verifikasi inbox admin. **Step 7: Commit** `git commit -m "feat: feedback + inbox"`

---

### Task 5: Uji idempotency + doc rate-limit
**Files:** `tests/donation.idempotency.test.ts`, `docs/runbooks/rate-limit.md`.
- **Step 1: Test** — token BEDA → dua baris (additif, pelengkap Task 2). **Step 2:** PASS.
- **Step 3:** `docs/runbooks/rate-limit.md`: rate-limit proses-lokal **tidak** melindungi di serverless; opsi nyata = edge/Upstash; tandai future work.
- **Step 4: Commit** `git commit -m "test: idempotency; doc: serverless rate-limit"`

## Self-Review
- Fix audit: path `src/`, idempotency pre-`find` + `ValidationError` (bukan `cause.code`), slug jamak, `retry` prop, legacy endpoint neutralized.
- Coverage: skema (1), submit (2), UI (3), kontak (4), idempotency+doc (5).
- Type consistency: `donationSchema` (1) dipakai (2,3); `ManualPaymentProvider`/`ProviderTransactionInput` (Plan 1 Task 14) dipakai (2).
