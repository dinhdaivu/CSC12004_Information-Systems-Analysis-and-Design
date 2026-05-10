-- Enable Supabase Realtime for chat tables
-- After running this migration, go to Supabase Dashboard → Database → Replication
-- and verify that both tables appear under "Realtime" publication.

ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Grant SELECT to anon and authenticated so Realtime postgres_changes works
-- (RLS is not enabled on these tables, so this is the permission layer)
GRANT SELECT ON conversations TO anon, authenticated;
GRANT SELECT ON messages      TO anon, authenticated;
