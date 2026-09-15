-- Lifecycle / "abandoned cart" email infrastructure.
--
-- Two things are needed to send reminder emails safely:
--   1. A log of what we already sent, so a cron that fires twice (or a retry
--      after a partial failure) can never email the same person twice.
--   2. A per-user marketing opt-out, so the unsubscribe link in the footer
--      actually does something. Required by GDPR / marknadsforingslagen.

CREATE TABLE IF NOT EXISTS public.email_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,

  -- e.g. 'abandoned_cv_4h'. Combined with uid this is the idempotency key.
  reminder_type TEXT NOT NULL,

  -- Which CV the email pointed at, for debugging and attribution.
  cv_id UUID,

  -- Resend's message id, so a bounce/complaint webhook can be traced back.
  provider_message_id TEXT,

  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- THE guard against double sends. The cron inserts this row before/with the
-- send; a duplicate insert fails loudly instead of producing a second email.
CREATE UNIQUE INDEX IF NOT EXISTS email_reminders_uid_type_idx
  ON public.email_reminders (uid, reminder_type);

CREATE INDEX IF NOT EXISTS email_reminders_sent_at_idx
  ON public.email_reminders (sent_at DESC);

ALTER TABLE public.email_reminders ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies on purpose: this table is written and read
-- exclusively by the service role (the cron route). With RLS on and no policy,
-- the anon key sees nothing.

COMMENT ON TABLE public.email_reminders IS
  'Log of lifecycle emails sent. UNIQUE(uid, reminder_type) makes sending idempotent.';


-- Marketing opt-out lives on premium, next to the email address we send to.
ALTER TABLE public.premium
  ADD COLUMN IF NOT EXISTS marketing_opt_out BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.premium.marketing_opt_out IS
  'TRUE when the user clicked unsubscribe. Lifecycle/marketing emails must skip these rows.';

-- Partial index: the cron only ever scans rows that have NOT opted out.
CREATE INDEX IF NOT EXISTS premium_marketing_candidates_idx
  ON public.premium (created_at DESC)
  WHERE marketing_opt_out = FALSE;
