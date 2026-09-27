# Runbook Ops

## Monitoring
- Poll `/api/health/ready` tiap 60s. Alert bila 2× gagal berturut.
- `/api/health` (liveness) — proses hidup tanpa cek DB.
- `/api/health/ready` (readiness) — cek DB (`SELECT 1`); 503 bila DB down.

## Dead-man's-switch
- `scripts/ping-healthcheck.mjs` dipanggil pada relay sukses & akhir job backup.
- healthchecks.io: absen ping = alert. Env: `HEALTHCHECK_PING_URL`, `HEALTHCHECK_PING_URL_BACKUP`.

## Scheduler
- `docs/sql/schedule.sql` — SATU job `pg_cron` `outbox-relay` tiap menit → `net.http_post` ke `/api/outbox/relay` dengan header `x-relay-secret`.
- `pg_net` TIDAK retry: retry hidup di state baris (`status='pending'` dipilih ulang tick berikutnya).

## Rollback
- `vercel rollback` mengembalikan **kode**, bukan schema. Karena migrasi additive-only, aman.
- Rollback juga **mengembalikan cron** (karena cron config ikut versi deploy) dan **mematikan auto-assign domain** → scheduler sengaja ditaruh di Supabase, bukan Vercel Cron.
