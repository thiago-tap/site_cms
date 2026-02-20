CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `github_id` integer NOT NULL UNIQUE,
  `username` text NOT NULL,
  `avatar_url` text,
  `created_at` integer NOT NULL
);

CREATE TABLE `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `expires_at` integer NOT NULL
);

CREATE TABLE `posts` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `slug` text NOT NULL UNIQUE,
  `content` text NOT NULL,
  `excerpt` text,
  `cover_image` text,
  `tags` text NOT NULL DEFAULT '[]',
  `status` text NOT NULL DEFAULT 'draft',
  `ai_summary` text,
  `reading_time` integer NOT NULL DEFAULT 1,
  `views` integer NOT NULL DEFAULT 0,
  `published_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE INDEX `idx_posts_status` ON `posts` (`status`);
CREATE INDEX `idx_posts_slug` ON `posts` (`slug`);
CREATE INDEX `idx_posts_published_at` ON `posts` (`published_at`);
