# Runbook Deploy — Vercel Pro

## Environment (Vercel → Project → Settings → Environment Variables)
- `DATABASE_URL` — Supavisor **transaction mode 6543**
- `DATABASE_URL_DIRECT` — direct **5432** (dipakai migrasi/pg_dump)
- `DATABASE_URL_DIRECT_SANDBOX` — direct **5432** proyek sandbox (integration test)
- `PAYLOAD_SECRET` — ≥32 karakter acak
- `NEXT_PUBLIC_SERVER_URL` — URL produksi
- `PHBI_SHEET_CSV_URL` — publish-to-web CSV Sheet PHBI
- `RELAY_SECRET` — secret relay outbox

**Region:** `sin1` (Singapore), co-locate dengan Supabase.
**Plan:** Vercel Pro (Hobby tidak kompatibel: cron >1×/hari gagal deploy).

## Build
`vercel.json` → `buildCommand: node scripts/build-guard.mjs`.
`build-guard.mjs` menjalankan migrasi **hanya** bila `VERCEL_ENV==='production'`, lalu `next build`. Migrasi gagal → build gagal → deploy ditolak.

## Migrasi
- Direktori: `src/migrations` (dimiliki Payload; **tanpa** Drizzle/Prisma terpisah).
- Generate: `npm run migrate:create` (`payload migrate:create --skip-empty`) → commit.
- Jalankan: `npm run migrate` (via CI/direct 5432). **Additive-only** (expand/contract).

## Rollback
`vercel rollback` (kembalikan **kode**, bukan schema). Karena migrasi additive-only, rollback kode aman. Migrasi destruktif DILARANG.

## Connection budget
`pool.max=3` per instance serverless × jumlah instance ≤ pooler Supabase. Pantau pemakaian koneksi; jangan naikkan tanpa mengukur.

## Catatan
- Bila muncul `42P05`/`26000` (prepared statement): pastikan query tanpa `name`; eskalasi ke Supavisor session mode 5432.
