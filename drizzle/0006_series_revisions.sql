-- Series: group posts in a sequence
ALTER TABLE posts ADD COLUMN series TEXT;
ALTER TABLE posts ADD COLUMN series_order INTEGER;

-- Post revisions: save history on each edit
CREATE TABLE IF NOT EXISTS post_revisions (
  id       TEXT PRIMARY KEY,
  post_id  TEXT NOT NULL,
  title    TEXT NOT NULL,
  content  TEXT NOT NULL,
  version  INTEGER NOT NULL DEFAULT 1,
  saved_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rev_post ON post_revisions(post_id, saved_at DESC);
