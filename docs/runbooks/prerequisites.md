# Prasyarat — Yayasan App (Plan 1 Task 1)

## Prasyarat eksternal (diisi operator sebelum deploy)

- **Supabase Pro** — region **Singapore**. Catat `<ref>`/`<region>`. Aktifkan ekstensi (SQL editor):
  ```sql
  create extension if not exists pg_cron;
  create extension if not exists pg_net;
  ```
- **Storage bucket** `media` (public read).
- **Proyek Supabase sandbox KEDUA** (untuk integration test Plan 6) → ambil URI **direct 5432** → `DATABASE_URL_DIRECT_SANDBOX`.
- **Vercel Pro** project `yayasan-app`, region `sin1`.
- **Env lengkap:**
  - `DATABASE_URL` — Supavisor **transaction mode 6543**
  - `DATABASE_URL_DIRECT` — direct **5432** (migrasi/pg_dump)
  - `DATABASE_URL_DIRECT_SANDBOX` — direct **5432** proyek sandbox kedua
  - `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `PHBI_SHEET_CSV_URL`, `RELAY_SECRET`
- **Backup**: bucket `yayasan-backup` + `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/`S3_BUCKET`/`S3_ENDPOINT`.
- **healthchecks.io** check `yayasan-ready` → `HEALTHCHECK_PING_URL`.
- **Google Sheet PHBI**: publish-to-web CSV → `PHBI_SHEET_CSV_URL`.

## Baseline repo (SEBELUM rebuild)

- Repo sudah berisi app legacy: `src/app/{page,layout}.tsx`, `src/app/{tentang-kami,publikasi,kegiatan,donasi,kontak}/`, `src/app/kegiatan/(lembaga)/{tk,takmir}`, `src/components/{layout,sections}`, `src/lib/midtrans.ts`, `src/app/api/donasi/route.ts`, `src/types/donation.ts`.
- `tsconfig.json` alias `@/* → ./src/*`.
- `next.config.js` memakai `withFlowbiteReact`.
- Seluruh konten legacy masih hardcoded (`.tsx`/`data.ts`).
- **Baseline build** (sebelum perubahan): `(catat hasil pnpm build di sini)`.

## Catatan rekonsiliasi
- Prinsip: **adaptasi di tempat**, `src/` dipertahankan, tidak ada rewrite besar-besaran.
- Endpoint donasi legacy (`/api/donasi`) dinonaktifkan (gateway HOLD), bukan dihapus.
