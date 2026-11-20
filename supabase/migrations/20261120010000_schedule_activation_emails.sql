-- E-mails de ativação por comportamento: roda de hora em hora.
-- Usa o mesmo segredo 'cron_secret' do Vault dos outros jobs.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule('process-activation-emails')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-activation-emails');

SELECT cron.schedule(
  'process-activation-emails',
  '17 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://nwenbxqmfpyspxpibgwp.supabase.co/functions/v1/process-activation-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
