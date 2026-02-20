-- Track traffic sources per post per day
CREATE TABLE IF NOT EXISTS post_referrers (
  post_id  TEXT NOT NULL,
  day      TEXT NOT NULL,  -- YYYY-MM-DD
  referrer TEXT NOT NULL,  -- hostname or 'direct'
  count    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, day, referrer)
);

CREATE INDEX IF NOT EXISTS idx_ref_day ON post_referrers(day);
