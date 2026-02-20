-- Track daily views per post for analytics chart
CREATE TABLE IF NOT EXISTS post_views_log (
  post_id TEXT NOT NULL,
  day     TEXT NOT NULL,   -- YYYY-MM-DD
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, day)
);

CREATE INDEX IF NOT EXISTS idx_pvl_day ON post_views_log(day);
