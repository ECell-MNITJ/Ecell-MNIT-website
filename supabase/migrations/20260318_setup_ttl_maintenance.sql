-- Migration: Setup Database TTL and Maintenance with pg_cron
-- This script enables pg_cron and sets up a template for auto-deleting old data.

-- 1. Enable the pg_cron extension (requires superuser, standard on Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create a maintenance function for chat_messages (Example - COMMENTED OUT)
/*
SELECT cron.schedule(
  'cleanup-old-chat-messages', -- name of the cron job
  '0 0 * * *',                -- every day at midnight (UTC)
  $$ DELETE FROM public.chat_messages WHERE created_at < now() - interval '30 days' $$
);
*/

-- 3. Template for other tables (Uncomment and modify as needed)
/*
SELECT cron.schedule(
  'cleanup-expired-sessions',
  '0 0 * * *',
  $$ DELETE FROM public.discovery_sessions WHERE created_at < now() - interval '60 days' $$
);
*/

-- 4. How to view your cron jobs:
-- SELECT * FROM cron.job;

-- 5. How to view job execution history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
