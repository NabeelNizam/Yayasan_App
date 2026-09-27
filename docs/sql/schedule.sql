create extension if not exists pg_cron;
create extension if not exists pg_net;

alter database postgres set app.relay_url = 'https://<domain>/api/outbox/relay';
alter database postgres set app.relay_secret = '<RELAY_SECRET>';

select cron.schedule(
  'outbox-relay',
  '* * * * *',
  $$
    select net.http_post(
      url := current_setting('app.relay_url', true),
      body := '{}'::jsonb,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-relay-secret', current_setting('app.relay_secret', true)
      ),
      timeout_milliseconds := 5000
    );
  $$
);
