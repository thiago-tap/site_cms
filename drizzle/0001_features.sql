-- Settings (key-value store for site config)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
  ('site_name', 'CatitéoBlog', unixepoch()),
  ('site_description', 'Blog sobre desenvolvimento web, cloud e tecnologia.', unixepoch()),
  ('accent_color', '#6366f1', unixepoch()),
  ('author_name', '', unixepoch()),
  ('author_bio', '', unixepoch()),
  ('author_avatar', '', unixepoch()),
  ('social_github', '', unixepoch()),
  ('social_twitter', '', unixepoch()),
  ('social_linkedin', '', unixepoch()),
  ('social_instagram', '', unixepoch()),
  ('logo_url', '', unixepoch()),
  ('giscus_repo', '', unixepoch()),
  ('giscus_repo_id', '', unixepoch()),
  ('giscus_category', '', unixepoch()),
  ('giscus_category_id', '', unixepoch()),
  ('newsletter_enabled', '1', unixepoch());

-- Editable static pages (sobre, contato, etc.)
CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO pages (slug, title, content, updated_at) VALUES
  ('sobre', 'Sobre', '## Sobre mim

Escreva aqui sobre você, sua experiência e seus interesses.

### Tecnologias

- TypeScript, JavaScript
- Astro, React, SvelteKit
- Cloudflare Workers, D1, R2

### Contato

Você pode me encontrar no [GitHub](https://github.com) ou pelo formulário de [contato](/contato).', unixepoch()),
  ('contato', 'Contato', '## Entre em contato

Preencha o formulário abaixo e responderei em breve.', unixepoch());

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read INTEGER NOT NULL DEFAULT 0
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

-- Add meta_description to posts
ALTER TABLE posts ADD COLUMN meta_description TEXT;
