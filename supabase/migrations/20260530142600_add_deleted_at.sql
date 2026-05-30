-- Add deleted_at column to checkins for soft deletes
ALTER TABLE checkins ADD COLUMN deleted_at TIMESTAMPTZ;

-- Update RLS policies for checkins to exclude soft-deleted records (optional for SELECT, but good practice)
-- Actually, the client handles the exclusion during queries in most offline-first apps, 
-- but doing it on the server ensures they aren't synced down.
DROP POLICY "Users can view own checkins" ON checkins;
CREATE POLICY "Users can view own checkins" ON checkins FOR SELECT USING (auth.uid() = user_id);

-- We keep the SELECT policy simple because the client will sync all records, including deleted ones, 
-- so the local DB knows to delete them. If we filter them out on the server SELECT, the client
-- will never receive the 'deleted_at' update! So we MUST let the client see them.
