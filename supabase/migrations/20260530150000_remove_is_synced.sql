-- Remove is_synced column from checkins since it is a local-only concern
ALTER TABLE public.checkins DROP COLUMN is_synced;
