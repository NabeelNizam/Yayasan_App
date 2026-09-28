# Runbook Restore (Supabase Postgres)

Tujuan: memulihkan database dari backup bila terjadi kehilangan data.

## RPO / RTO jujur

- RPO (kehilangan data maksimum): **≤ 24 jam** (daily backup Pro) atau **≤ 1 minggu** (off-site).
- RTO (waktu pemulihan): **~1–3 jam** (manual).

PITR (point-in-time recovery) **ditunda** (~$100/mo). Trigger upgrade: saat memproses donasi berulang / RPO < 1 jam dibutuhkan.

## Prasyarat

- Akses ke bucket `yayasan-backup` (S3/B2) berisi `backup.dump` mingguan.
- `psql` / `pg_restore` (PostgreSQL 17+).
- Proyek Supabase kosong (throwaway) untuk uji restore.

## Prosedur restore

1. **Umumkan maintenance** (situs publish tetap hidup via ISR; admin tulis mati).
2. **Siapkan target**: buat database/proyek baru, catat `DATABASE_URL_DIRECT`-nya.
3. **Restore**:
   ```bash
   pg_restore --no-owner --no-privileges --clean --if-exists \
     -d "$DATABASE_URL_DIRECT_TARGET" backup.dump
   ```
4. **Verifikasi** jumlah baris tabel kunci == sumber:
   ```sql
   select count(*) from campaigns;
   select count(*) from donors;
   select count(*) from payload_migrations;   -- ledger utuh
   ```
5. **Repoint** `DATABASE_URL` aplikasi ke target, lalu smoke test:
   `/api/health/ready` = 200, `/` = 200, `/admin` = 200.
6. **Cabut maintenance**.

## Drill

- **Setiap 6 bulan**, jalankan `scripts/restore-drill.mjs` (lihat Plan 6) terhadap proyek throwaway.
- Catat tanggal drill + hasil di bawah.

| Tanggal drill | Sumber | Hasil | Catatan |
|---|---|---|---|
| _(belum)_ | | | |
