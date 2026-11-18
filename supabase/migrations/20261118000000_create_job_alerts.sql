-- Weekly job email ("jobbmejl"), opt-in.
--
-- One row per user who clicked "Få nya jobb på mejl varje vecka" in the CV
-- editor. The row holds the search to rerun each Monday, not any ads: those are
-- fetched live from Arbetsförmedlingen's JobSearch API by the cron route
-- (app/api/cron/job-alerts/route.ts).
--
-- A row only ever comes into existence through that explicit click
-- (POST /api/jobs/alerts). Nothing is pre-enabled and nothing is backfilled.

CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- One alert per user. Deleting the account deletes the alert.
  uid UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- The free-text q sent to the API, e.g. 'undersköterska'. Always a term the
  -- API recognised as an occupation when the alert was switched on.
  search_text TEXT NOT NULL,

  -- Lowercase, for the sentence "nya jobb som <occupation_label>".
  occupation_label TEXT NOT NULL,

  -- Where to search. All three are NULL for "hela Sverige".
  location_kind TEXT CHECK (location_kind IN ('municipality', 'region')),
  -- JobTech taxonomy concept id, e.g. '8deT_FRF_2SP' for Västerås.
  location_id TEXT,
  -- Display name, e.g. 'Västerås' or 'Västmanlands län'.
  location_name TEXT,

  -- FALSE when the user switched the email off, in the editor or through the
  -- link in the email. The row stays so that last_sent_at survives an off/on.
  active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Set when the email was switched off through the link in an email (the
  -- unsubscribe route), NULL otherwise. While it is set the editor cannot
  -- switch the email back on and the cron skips the row: the stop came from
  -- whoever reads the mailbox. Only the undo link behind that same email link
  -- clears it. Switching off in the editor does not touch it.
  unsubscribed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Set only after an email was actually sent. The next run searches for ads
  -- published after this moment.
  last_sent_at TIMESTAMPTZ,

  -- Set whenever the cron got an answer for this alert, email or not. The cron
  -- takes the longest-unchecked alerts first, so a run that has to stop early
  -- continues with the rest next time.
  last_checked_at TIMESTAMPTZ,

  CONSTRAINT job_alerts_location_complete CHECK (
    (location_kind IS NULL AND location_id IS NULL AND location_name IS NULL)
    OR (location_kind IS NOT NULL AND location_id IS NOT NULL AND location_name IS NOT NULL)
  )
);

-- In case an earlier draft of this file was already run: CREATE TABLE IF NOT
-- EXISTS would then skip the column, and the alerts API route, the cron route
-- and the unsubscribe route all need it.
ALTER TABLE public.job_alerts
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- The cron only scans active rows, longest-unchecked first.
CREATE INDEX IF NOT EXISTS job_alerts_active_idx
  ON public.job_alerts (last_checked_at ASC NULLS FIRST)
  WHERE active = TRUE;

ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies on purpose, same as email_reminders: the table
-- is read and written only by the service role (the alerts API route, the cron
-- route and the unsubscribe route). With RLS on and no policy, the anon key
-- sees nothing.

COMMENT ON TABLE public.job_alerts IS
  'Opt-in weekly job email. One row per user with the search to rerun; written only by the service role.';

-- Double sends are prevented by the existing public.email_reminders table: the
-- cron reserves a row with reminder_type 'job_alert_<year>w<week>' before each
-- send, and UNIQUE(uid, reminder_type) rejects a second one for the same week.
