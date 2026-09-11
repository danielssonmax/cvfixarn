-- A user may legitimately have several CVs with the same name - the editor even
-- defaults every new CV to "cv.pdf". The unique index on (user_id, title) made
-- the second one fail to save with
--   duplicate key value violates unique constraint "cvs_user_title_idx"
-- which the app swallowed silently, so the user's edits were quietly lost.
--
-- CVs are identified by their primary key, never by title, so uniqueness here
-- buys nothing. Replace it with a plain (non-unique) index that still serves the
-- "list my CVs by name" lookups.

DROP INDEX IF EXISTS cvs_user_title_idx;

CREATE INDEX IF NOT EXISTS cvs_user_title_lookup_idx ON cvs (user_id, title);
