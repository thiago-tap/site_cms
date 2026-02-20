-- Add featured and scheduled_at columns to posts
ALTER TABLE posts ADD COLUMN featured INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN scheduled_at INTEGER;
