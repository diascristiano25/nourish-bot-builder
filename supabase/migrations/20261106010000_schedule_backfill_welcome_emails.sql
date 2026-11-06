-- Daily safety net for welcome emails (Google SSO signups, signups without a
-- session, failed sends). Runs 30 min before the trial follow-up job so welcome goes first.
-- Uses the same Vault secret 'cron_secret'.

SELECT cron.unschedule('backfill-welcome-emails')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'backfill-welcome-emails');

SELECT cron.schedule(
  'backfill-welcome-emails',
  '30 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://nwenbxqmfpyspxpibgwp.supabase.co/functions/v1/backfill-welcome-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
