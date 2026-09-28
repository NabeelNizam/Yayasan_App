# Runbook Monitoring

## Health checks

- `GET /api/health` — liveness (proses hidup, tanpa DB). Static.
- `GET /api/health/ready` — readiness (cek DB `SELECT 1` via koneksi `pg` ringan).

**Poll** `/api/health/ready` tiap **60 detik**; alert setelah **2 kegagalan berturut-turut**.

## Dead-man's-switch

- `scripts/ping-healthcheck.mjs` — ping ke healthchecks.io.
- Dipanggil pada **relay sukses** dan **akhir job backup**.
- Env: `HEALTHCHECK_PING_URL`, `HEALTHCHECK_PING_URL_BACKUP`.
- Absen ping = alert (mendeteksi job yang tidak berjalan).

## Scheduler & staleness

- Scheduler = Supabase `pg_cron` + `pg_net` (bukan Vercel Cron).
- Job `outbox-relay` tiap menit; heartbeat = koleksi `job-runs` (`lastSuccessAt`).
- Deteksi job basi: `isStale(lastSuccessMs, intervalMs, nowMs)` di `src/features/ops/heartbeat.ts` → true bila melewati **1.5× interval**.
- Verifikasi `pg_cron`: query `cron.job_run_details` (lihat `docs/sql/heartbeat.sql`).

## Kanál alert

- healthchecks.io (email/Telegram sesuai konfigurasi check).

## Rollback

- `vercel rollback` mengembalikan **kode**, bukan schema. Migrasi additive-only → aman.
- Rollback juga mengembalikan cron Vercel (jika ada) dan mematikan auto-assign domain → karena itu scheduler sengaja di Supabase.
