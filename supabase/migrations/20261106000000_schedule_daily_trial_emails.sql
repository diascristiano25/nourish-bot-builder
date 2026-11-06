-- Schedule the daily trial/patient follow-up email job (08:00 BRT = 11:00 UTC)
-- Requires a Vault secret named 'cron_secret' holding the same value as the
-- CRON_SECRET edge-function secret:
--   select vault.create_secret('<CRON_SECRET>', 'cron_secret');

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule('process-daily-trial-emails')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-daily-trial-emails');

SELECT cron.schedule(
  'process-daily-trial-emails',
  '0 11 * * *',
  $$
  SELECT net.http_post(
    url := 'https://nwenbxqmfpyspxpibgwp.supabase.co/functions/v1/process-daily-trial-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
