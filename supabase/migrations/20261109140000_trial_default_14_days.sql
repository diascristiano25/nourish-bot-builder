-- New signups get a 14-day trial (matches the pricing page and TRIAL_DURATION_DAYS).
-- Existing accounts keep their current trial_ends_at.
ALTER TABLE public.profiles
  ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '14 days');
