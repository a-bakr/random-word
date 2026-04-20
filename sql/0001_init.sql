CREATE TABLE IF NOT EXISTS events (
  id         BIGSERIAL PRIMARY KEY,
  ts         TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT        NOT NULL,
  name       TEXT        NOT NULL,
  path       TEXT,
  referrer   TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  country    TEXT,
  region     TEXT,
  city       TEXT,
  device     TEXT,
  browser    TEXT,
  os         TEXT,
  props      JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS events_ts         ON events (ts DESC);
CREATE INDEX IF NOT EXISTS events_name_ts    ON events (name, ts DESC);
CREATE INDEX IF NOT EXISTS events_session_id ON events (session_id);

CREATE TABLE IF NOT EXISTS sessions (
  session_id   TEXT PRIMARY KEY,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  country      TEXT,
  device       TEXT,
  browser      TEXT,
  referrer     TEXT,
  utm_source   TEXT,
  pageviews    INT NOT NULL DEFAULT 0,
  words        INT NOT NULL DEFAULT 0,
  recordings   INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_stats (
  day          DATE PRIMARY KEY,
  sessions     INT     NOT NULL DEFAULT 0,
  pageviews    INT     NOT NULL DEFAULT 0,
  words        INT     NOT NULL DEFAULT 0,
  recordings   INT     NOT NULL DEFAULT 0,
  avg_session_secs NUMERIC NOT NULL DEFAULT 0
);
