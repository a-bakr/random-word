ALTER TABLE events   ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS events_user_ts   ON events (user_id, ts DESC);
CREATE INDEX IF NOT EXISTS sessions_user_at ON sessions (user_id, started_at DESC);
