-- AI embeddings for semantic related posts
CREATE TABLE IF NOT EXISTS post_embeddings (
  post_id    TEXT PRIMARY KEY,
  embedding  TEXT NOT NULL,  -- JSON array of floats
  model      TEXT NOT NULL DEFAULT 'bge-small',
  updated_at INTEGER NOT NULL
);
