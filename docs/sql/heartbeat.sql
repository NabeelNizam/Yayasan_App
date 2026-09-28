-- Heartbeat / verifikasi scheduler (Plan 5 Task 4)
-- TIDAK membuat job kedua. Hanya query status job 'outbox-relay' yang dijadwalkan
-- oleh docs/sql/schedule.sql. JobRun Payload (koleksi job-runs) menyimpan heartbeat aplikasi.

-- Status run terakhir untuk job outbox-relay
select jobname, status, start_time, end_time
from cron.job_run_details
where jobname = 'outbox-relay'
order by start_time desc
limit 10;

-- Job yang benar-benar terdaftar
select jobid, schedule, jobname, active
from cron.job
where jobname = 'outbox-relay';

-- Heartbeat aplikasi (koleksi Payload job-runs)
select name, last_success_at
from job_runs
order by last_success_at desc nulls last;
