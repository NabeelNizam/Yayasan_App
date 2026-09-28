# Plan 5 — Durability & Ops Lengkap (REVISI 2 — path `src/`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Data tidak hilang & sistem observable: backup off-site mingguan, runbook restore + drill, monitoring + dead-man's-switch, verifikasi scheduler `pg_cron`/`pg_net`, gate migrasi produksi.

**Architecture:** **Target Vercel Pro**. Supabase Pro daily (7 hari) + `pg_dump` mingguan ke object storage (S3/B2) + mirror media via rclone. Scheduler = database Supabase (bukan Vercel Cron).

**Tech Stack:** Supabase Pro, `pg_dump`, `rclone`, GitHub Actions, healthchecks.io, Vercel Pro.

## Global Constraints
- Supabase **Pro** wajib. Backup mingguan off-site WAJIB. Media mirror wajib.
- PITR DITUNDA; dokumentasikan trigger.
- Scheduler = `pg_cron`+`pg_net` (Supabase), BUKAN Vercel Cron. **Path `src/`**.
- Rollback = `vercel rollback`. Setiap task berakhir commit.

## Todos

- [ ] 1. Skrip backup off-site mingguan (DB + media)
- [ ] 2. Runbook restore + drill 6 bulan
- [ ] 3. Monitoring health + dead-man's-switch
- [ ] 4. Verifikasi scheduler `pg_cron`/`pg_net` + deteksi job basi (`isStale`)
- [ ] 5. Gate migrasi produksi + smoke pasca-deploy

## Final Verification Wave

- [ ] F5. Verifikasi akhir Plan 5 (backup jalan; runbook+drill ada; monitoring alert; smoke auto-revert; heartbeat deteksi)

---

### Task 1: Skrip backup off-site mingguan
**Files:** `.github/workflows/backup.yml`, `scripts/backup/README.md`.
- **Step 1:** Workflow `schedule: '0 3 * * 0'` → `pg_dump "$DATABASE_URL_DIRECT" -Fc --no-owner --no-privileges --schema=public --exclude-schema=auth --exclude-schema=storage --exclude-schema=graphql -f backup.dump` → upload S3/B2. Secrets: `DATABASE_URL_DIRECT`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_ENDPOINT`.
- **Step 2 (mirror media):** `rclone sync supabase:media s3:yayasan-backup/media --checksum` (remote `supabase` = endpoint S3-compatible `https://<ref>.supabase.co/storage/v1/s3` region `<region>`; remote `s3` = bucket `yayasan-backup`). Creds: `SUPABASE_S3_ACCESS_KEY_ID`/`SUPABASE_S3_SECRET_ACCESS_KEY` + `AWS_*`. Tambah ke `backup.yml` setelah `pg_dump`.
- **Step 3:** `workflow_dispatch` → file `.dump` muncul. **Ping dead-man's-switch di akhir job**: `curl -fsS "$HEALTHCHECK_PING_URL_BACKUP"` (gagal backup → tak ping → alert). **Step 4: Commit** `git commit -m "ops: weekly backup + rclone media + healthcheck ping"`

---

### Task 2: Runbook restore + drill EKSEKUSI
**Files:** `docs/runbooks/restore.md`, `scripts/restore-drill.mjs`.
- **Step 1:** prosedur (maintenance → `pg_restore` ke proyek baru → repoint `DATABASE_URL` → smoke → cabut). **Step 2:** checklist drill 6 bulan + RPO/RTO eksplisit (RPO ≤24 jam daily / ≤1 minggu off-site; RTO 1–3 jam).
- **Step 3 (EKSEKUSI drill T0, bukan masa depan):** `scripts/restore-drill.mjs` — `pg_restore` ke Supabase throwaway project, assert jumlah baris `donors`/`campaigns` **== sumber** (bukan sekadar > 0), lalu tandai lulus di `docs/runbooks/restore.md`. **Sumber dump = PRODUKSI (`DATABASE_URL_DIRECT`)** — drill harus membuktikan recoverability prod. Plan 6 hanya **menjalankan ulang** script ini (tidak menulis ulang).
- **Step 4: Commit** `git commit -m "ops: restore runbook + executable drill"`

---

### Task 3: Monitoring health + dead-man's-switch
**Files:** `docs/runbooks/monitoring.md`.
- **Step 1:** monitor `/api/health/ready` 60s → alert 2× gagal. **Step 2:** dead-man's-switch **di kode** (`scripts/ping-healthcheck.mjs`, dipanggil relay sukses + backup; lihat Plan 1 Task 18 Step 3b) — bukan prosa. **Step 3:** kanal alert (Telegram/email yayasan). **Step 4: Commit** `git commit -m "ops: monitoring + dead-man's-switch (code)"`

---

### Task 4: Verifikasi scheduler + deteksi job basi
**Files:** `docs/sql/heartbeat.sql`, `src/features/ops/heartbeat.ts`; Test `tests/ops.heartbeat.test.ts`.
- **Step 1: Test gagal**
```ts
import { describe, it, expect } from 'vitest'
import { isStale } from '@/features/ops/heartbeat'
describe('isStale', () => {
  it('true beyond 1.5x interval', () => {
    expect(isStale(0, 1000, 1600)).toBe(true); expect(isStale(0, 1000, 1400)).toBe(false)
  })
})
```
- **Step 2:** FAIL. **Step 3: Implementasi**
```ts
export function isStale(lastSuccessMs: number, intervalMs: number, nowMs: number): boolean {
  return nowMs - lastSuccessMs > intervalMs * 1.5
}
```
- **Step 4:** PASS. **Step 5:** `heartbeat.sql` **TIDAK** membuat job kedua — query `SELECT status,start_time FROM cron.job_run_details WHERE jobname='outbox-relay'`; `job_runs` = **koleksi Payload `job-runs`**. **Step 6: Commit** `git commit -m "ops: heartbeat staleness + pg_cron verify"`

---

### Task 5: Gate migrasi + smoke pasca-deploy
**Files:** `.github/workflows/smoke.yml`; verifikasi `vercel.json` (build-guard dari Plan 1).
- **Step 1:** smoke: curl `/`, `/api/health/ready`, `/admin` → gagal → `vercel rollback` (otomatis pilih produksi sebelumnya). Eksplisit: `vercel ls --prod | sed -n '2p'` → `vercel promote <url>`.
- **Step 2:** dokumenkan urutan `payload migrate` (direct 5432, gate produksi) → `next build` → deploy → smoke.
- **Step 3:** dry-run preview. **Step 4: Commit** `git commit -m "ops: migration gate + post-deploy smoke"`

## Self-Review
- Fix audit: path `src/`, `rclone` + secrets (1), `vercel rollback` (5), `job-runs` collection + single job (4).
- Coverage: backup (1), restore+drill (2), monitoring (3), scheduler+heartbeat (4), gate+smoke (5).
- Type consistency: `isStale` (4); `/api/outbox/relay` (Plan 1) dipakai scheduler; `vercel rollback` (5).
