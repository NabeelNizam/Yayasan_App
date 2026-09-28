# Plan 3 — Halaman Publik per Modul (REVISI 3 — path `src/`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mengisi kelima modul publik dengan konten dari DB Payload via Local API — Recap = kartu per-event, Kajian = 3 tipe dengan render aman, Lembaga = sub-site.

**Architecture:** **CANONICAL ROOT `src/`**. Baca data via `getPayload` (Local API) di Server Components dengan `overrideAccess:false` (`PUBLIC_READ`). Render rich text via `convertLexicalToHTMLAsync` + `populate` (`getPayloadPopulateFn`). Gambar via `MediaImage`.

**Tech Stack:** Next.js 16.3.6, Payload 3.x, Tailwind v4.

## Global Constraints
- **Path `src/`**: `src/app/(site)/...`, `src/features/...`, `src/components/...`, `src/payload.config.ts`.
- Semua baca publik: `getPayload({ config })` + `...PUBLIC_READ`. **Slug koleksi jamak** (Plan 1): `publikasi`,`lembaga`,`kajian`,`phbi-recap`,`campaigns`,`donors`,`prayers`, global `site-settings`.
- Render rich text: `convertLexicalToHTMLAsync` + `getPayloadPopulateFn`; `dangerouslySetInnerHTML` hanya untuk konversi resmi.
- Gambar via `MediaImage`. Copy Bahasa Indonesia. `export const revalidate = REVALIDATE_SECONDS`. Setiap task berakhir commit.

## Todos

- [ ] 1. Komponen presentational bersama (ProgressBar, SectionHeading, ContentCard)
- [ ] 2. Modul `tentang-kami` dari DB
- [ ] 3. Modul `publikasi` (galeri + modal)
- [ ] 4. Modul `kegiatan` — tab Lembaga (direktori sub-site)
- [ ] 5. Modul Kajian 3 tipe + render Lexical aman (populate)
- [ ] 6. Modul Recap PHBI kartu per-event
- [ ] 7. Modul `donasi` — grid kampanye + detail
- [ ] 8. Modul `kontak` — info + peta

## Final Verification Wave

- [ ] F3. Verifikasi akhir Plan 3 (build+lint+test; semua modul render dari DB; 0 warning no-img; slug benar)

---

### Task 1: Komponen presentational bersama
**Files:** `src/components/ui/{ProgressBar,SectionHeading,ContentCard}.tsx`; Test `tests/ui.progress.test.ts`.
- **Step 1: Test gagal** (`toPercent` clamp 0..100, max<=0→0). **Step 2:** FAIL. **Step 3: Implementasi**
```tsx
export function toPercent(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)))
}
export default function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = toPercent(value, max)
  return (<div className="h-2 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuenow={pct}>
    <div className="h-full rounded-full bg-[#0B7932]" style={{ width: `${pct}%` }} /></div>)
}
```
- **Step 4:** PASS. **Step 5:** SectionHeading + ContentCard. **Step 6: Commit** `git commit -m "feat: shared presentational components"`

---

### Task 2: Modul `tentang-kami` dari DB
**Files:** `src/features/tentang-kami/getContent.ts`; Modify `src/app/(site)/tentang-kami/page.tsx`; Test `tests/tentang-kami.test.ts`.
- **Step 1: Test gagal** (`normalizeTentangKami(null)`).
- **Step 2:** FAIL. **Step 3: Implementasi**
```ts
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PUBLIC_READ } from '@/features/data/getters'
export function normalizeTentangKami(raw: any) {
  return { visi: raw?.visi ?? '', misi: Array.isArray(raw?.misi) ? raw.misi : [], program: Array.isArray(raw?.program) ? raw.program : [], detail: raw?.detail ?? '' }
}
export async function getTentangKami() {
  const payload = await getPayload({ config })
  const g = await payload.findGlobal({ slug: 'site-settings', ...PUBLIC_READ }).catch(() => null)
  return normalizeTentangKami((g as any)?.tentangKami ?? null)
}
```
- **Step 4:** PASS. **Step 5:** render di page. **Step 6: Commit** `git commit -m "feat: tentang-kami reads DB"`

---

### Task 3: Modul `publikasi` (galeri + modal)
**Files:** `src/features/publikasi/getList.ts`, `src/app/(site)/publikasi/components/GalleryCard.tsx`; Modify page.
- **Step 1:** Koleksi `publikasi` **sudah ada di Plan 1 Task 11 — JANGAN buat ulang.**
- **Step 2:** `getPublikasi()` = `payload.find({ collection:'publikasi', sort:'-date', ...PUBLIC_READ })`.
- **Step 3:** `GalleryCard.tsx` (client) modal preview pakai `MediaImage`.
- **Step 4:** render grid; `pnpm lint` → 0 warning no-img. **Step 5: Commit** `git commit -m "feat: publikasi gallery"`

---

### Task 4: Modul `kegiatan` — tab Lembaga
**Files:** `src/features/lembaga/getList.ts`, `src/app/(site)/kegiatan/components/LembagaDirectory.tsx`; Modify page.
- **Step 1:** `getLembaga()` = `payload.find({ collection:'lembaga', where:{ isActive:{equals:true} }, ...PUBLIC_READ })`.
- **Step 2:** `LembagaDirectory.tsx` (MediaImage logo, nama, kategori, CTA `src/app/(site)/kegiatan/lembaga/[slug]`).
- **Step 3:** tab Lembaga default. **Step 4:** `pnpm build`. **Step 5: Commit** `git commit -m "feat: Lembaga directory"`

---

### Task 5: Kajian 3 tipe + render Lexical aman (populate)
**Files:** `src/features/kajian/{getList,renderLexical}.ts`, `src/app/(site)/kajian/[slug]/page.tsx`, `src/app/(site)/kegiatan/components/KajianList.tsx`; Test `tests/kajian.render.test.ts`.
- **Step 1: Test gagal** (render null → `''`; paragraf memuat teks; tidak memuat `<script`).
- **Step 2:** FAIL. **Step 3: Implementasi render**
```ts
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import { getPayloadPopulateFn } from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'
import DOMPurify from 'isomorphic-dompurify'
import config from '@/payload.config'
export async function renderRichText(data: SerializedEditorState | null | undefined): Promise<string> {
  if (!data) return ''
  const payload = await getPayload({ config })
  const html = await convertLexicalToHTMLAsync({ data, populate: await getPayloadPopulateFn({ currentDepth: 0, depth: 1, payload, overrideAccess: false }) })
  return DOMPurify.sanitize(html) // wajib: converter TIDAK menyaring HTML}
```
- **Step 3b:** `pnpm add isomorphic-dompurify`. Test tambahkan: konten dengan `<script>` → output **tidak** memuat `<script`.
- **Step 4:** PASS. **Step 5:** `getKajianList/getKajianBySlug` (`...PUBLIC_READ`); `KajianList.tsx` (video→YT, artikel→`/kajian/[slug]`, kitab→`pdf.url`).
- **Step 4b (WAJIB, kompatibilitas sanitasi):** `pnpm add isomorphic-dompurify@^2.16.0 jsdom@25.0.1` (**production deps, BUKAN -D** — `jsdom` dipakai runtime serverless di bawah `serverExternalPackages`). Di `next.config.ts` tambah `serverExternalPackages: ['jsdom']`. Fallback bila build Vercel gagal: `sanitize-html` (server-only).
- **Step 6:** `src/app/(site)/kajian/[slug]/page.tsx` pakai `renderRichText` + `export const revalidate = REVALIDATE_SECONDS` + `generateStaticParams` (filter `type==='artikel'`). Catatan: converter Lexical **tidak menyaring** HTML — jangan aktifkan fitur HTML mentah; andalkan Payload ≥3.78.0.
- **Step 7:** `pnpm build && pnpm test`. **Step 8: Commit** `git commit -m "feat: kajian 3 types + populated safe render"`

---

### Task 6: Recap PHBI kartu per-event
**Files:** `src/features/recap/getList.ts`, `src/app/(site)/kegiatan/components/RecapCards.tsx`.
- **Step 1:** `getPhbiRecap()` = `tagged(['phbi'],[PHBI_TAG], async () => (await getPayload({config})).find({ collection:'phbi-recap', ...PUBLIC_READ }))`.
- **Step 2:** `RecapCards.tsx` satu kartu per event (tahun, tanggal, deskripsi, MediaImage bila ada).
- **Step 3:** `pnpm build`. **Step 4: Commit** `git commit -m "feat: PHBI recap card-per-event"`

---

### Task 7: Modul `donasi` — grid + detail
**Files:** `src/features/donasi/getCampaigns.ts`, `src/app/(site)/donasi/components/CampaignCard.tsx`, `src/app/(site)/donasi/[slug]/page.tsx`.
- **Step 1:** `getCampaigns()` = `payload.find({ collection:'campaigns', where:{isActive:{equals:true}}, ...PUBLIC_READ })`.
- **Step 2:** `CampaignCard.tsx` (MediaImage cover, `ProgressBar`, CTA `/donasi/[slug]`).
- **Step 3:** detail page: kampanye + `donors` **`where: { isPublic: { equals: true } }`** (WAJIB — `PUBLIC_READ` saja tidak menyaring) + `prayers` (`where: { campaignSlug: { equals } }`); semua `...PUBLIC_READ`.
- **Step 4:** `pnpm build`. **Step 5: Commit** `git commit -m "feat: donation grid + detail"`

---

### Task 8: Modul `kontak` — info + peta
**Files:** `src/features/kontak/getSettings.ts`, `src/app/(site)/kontak/components/LocationMap.tsx`; Modify page.
- **Step 1:** `getContactSettings()` dari global `site-settings` **wajib `...PUBLIC_READ`**.
- **Step 2:** `LocationMap.tsx` iframe (`loading="lazy"`).
- **Step 3:** render info+sosial+peta (form placeholder). **Step 4:** `pnpm build && pnpm lint`. **Step 5: Commit** `git commit -m "feat: kontak info + map"`

## Self-Review
- Fix audit: semua path `src/`, slug jamak, `PUBLIC_READ`, `populate`, MediaImage.
- Coverage: tentang-kami (2), publikasi (3), lembaga (4), kajian (5), recap (6), donasi (7), kontak (8).
- Type consistency: `PUBLIC_READ`/`tagged`/`PHBI_TAG`/`MediaImage`/`ProgressBar`.
