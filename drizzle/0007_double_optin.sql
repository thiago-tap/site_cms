-- Double opt-in for newsletter subscribers
-- Default 1 to keep existing subscribers active
ALTER TABLE subscribers ADD COLUMN confirmed INTEGER NOT NULL DEFAULT 1;
ALTER TABLE subscribers ADD COLUMN confirmation_token TEXT;
