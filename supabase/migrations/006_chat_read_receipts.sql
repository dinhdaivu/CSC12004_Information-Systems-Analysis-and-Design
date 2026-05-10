-- Read receipts for chat messages.
-- Messages start unread; the backend marks incoming messages with read_at when
-- the recipient opens the thread.

ALTER TABLE messages
  ADD read_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_messages_read_receipts_conversation
  ON messages(conversation_id);