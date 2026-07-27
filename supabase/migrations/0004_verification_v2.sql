-- Verification v2: confidence score + moderation columns (all additive).
alter table public.verifications add column if not exists confidence int not null default 0;
alter table public.verifications add column if not exists status text not null default 'auto'; -- auto | manual_approved | manual_rejected
alter table public.verifications add column if not exists reviewed boolean not null default false;
alter table public.verifications add column if not exists rejected_reason text;

-- Optional photo retention: delete verification photos older than N days.
-- Enable pg_cron + pg_net, then schedule this (adjust the interval as you like):
--
--   select cron.schedule('purge-verif-photos', '0 3 * * *', $$
--     delete from storage.objects
--     where bucket_id = 'verifications' and created_at < now() - interval '90 days';
--   $$);
