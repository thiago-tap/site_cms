# Blog do Thiago

> Blog pessoal com painel admin, posts em Markdown, IA para resumos/tags/meta, upload de imagens via MinIO e muito mais.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-thiago.catiteo.com-6366f1?style=for-the-badge)](https://thiago.catiteo.com/)

**Live:** [thiago.catiteo.com](https://thiago.catiteo.com/) · **Repositório:** [github.com/thiago-tap/site_cms](https://github.com/thiago-tap/site_cms)

![Astro](https://img.shields.io/badge/Astro-5-FF5D01?logo=astro&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/licença-MIT-22c55e)

---

## Sobre o projeto

Blog pessoal construído com **Astro 5** e hospedado no edge da Cloudflare. Parte de um portfólio de três aplicações que demonstram frameworks modernos diferentes:

| Projeto | Framework | Link |
|---|---|---|
| DevToolbox | Next.js 15 (App Router) | [devtools.catiteo.com](https://devtools.catiteo.com) |
| SnipHub | SvelteKit 2 + Svelte 5 | [snippets.catiteo.com](https://snippets.catiteo.com) |
| Blog do Thiago | **Astro 5** | [thiago.catiteo.com](https://thiago.catiteo.com) |

---

## Funcionalidades

### Blog público

| Feature | Descrição |
|---|---|
| Lista de posts | Filtro por tag, paginação, busca full-text |
| Post individual | Markdown renderizado, contagem de views, TOC automático |
| SEO completo | Open Graph, Twitter Card, JSON-LD structured data |
| Compartilhamento | Botões para Twitter/X, LinkedIn, WhatsApp e copiar link |
| Posts relacionados | Sugeridos automaticamente por tags em comum |
| Comentários | Giscus (GitHub Discussions) configurável |
| Newsletter | Formulário de inscrição com armazenamento em D1 |
| RSS Feed | `/rss.xml` automático com todos os posts publicados |
| Sitemap | `/sitemap.xml` dinâmico |
| Páginas estáticas | Sobre e Contato editáveis pelo admin |
| Formulário de contato | Mensagens armazenadas e gerenciadas no admin |

### Painel Admin

| Feature | Descrição |
|---|---|
| Dashboard | Stats: posts, views, contatos não lidos, assinantes |
| Editor Markdown | Toolbar com formatação, inserção de imagens e upload |
| Upload de imagens | Integração com MinIO (S3-compatible self-hosted) |
| IA: Resumo | Llama 3 8B gera resumo do post em PT-BR |
| IA: Tags | Llama 3 8B sugere tags relevantes |
| IA: Meta description | Llama 3 8B gera meta description para SEO |
| Gerenciar páginas | Editar conteúdo de Sobre e Contato via Markdown |
| Gerenciar contatos | Listar, marcar como lido, responder por e-mail, excluir |
| Gerenciar assinantes | Listar, ativar/desativar, excluir |
| Configurações | Nome do site, descrição, autor, redes sociais, Giscus, newsletter |

### Auth & Segurança

| Feature | Descrição |
|---|---|
| GitHub OAuth | Login seguro via Arctic v2 |
| Allowlist | Apenas o usuário configurado em `ADMIN_GITHUB_USERNAME` acessa o admin |

---

## Stack

```
Framework:    Astro 5 (output: server)
Adapter:      @astrojs/cloudflare v12
Database:     Cloudflare D1 (SQLite na edge) + Drizzle ORM
Auth:         GitHub OAuth via Arctic v2
Markdown:     marked v15 (server-side rendering)
Estilo:       Tailwind CSS 4 (via @tailwindcss/vite)
IA:           Cloudflare Workers AI — Llama 3 8B
Storage:      MinIO (S3-compatible) via @aws-sdk/client-s3
Deploy:       Cloudflare Pages
```

---

## Arquitetura

```
site_cms/
├── src/
│   ├── env.d.ts                        # Types: Runtime<Env>, App.Locals
│   ├── middleware/
│   │   └── index.ts                    # Valida sessão + protege /admin
│   ├── styles/
│   │   └── global.css                  # Tailwind 4 + classes .prose para markdown
│   ├── lib/
│   │   ├── auth.ts                     # GitHub OAuth, sessions, upsert user
│   │   ├── markdown.ts                 # renderMarkdown() + extractHeadings() via marked
│   │   ├── settings.ts                 # getSettings() / saveSettings() no D1
│   │   ├── utils.ts                    # generateId, slugify, formatDate, calcReadingTime
│   │   └── db/
│   │       ├── schema.ts               # Tabelas: users, sessions, posts, settings, pages, contacts, subscribers
│   │       └── index.ts                # getDb(D1Database) → DrizzleD1Database
│   ├── components/
│   │   ├── Header.astro                # Navbar dinâmica com nome e logo do site
│   │   ├── Footer.astro                # Links sociais e RSS
│   │   ├── PostCard.astro              # Card de post para a listagem
│   │   ├── SEO.astro                   # Open Graph, Twitter Card, JSON-LD
│   │   ├── TOC.astro                   # Sumário automático dos headings
│   │   ├── ShareButtons.astro          # Compartilhar no Twitter, LinkedIn, WhatsApp
│   │   ├── RelatedPosts.astro          # Posts relacionados por tags
│   │   ├── GiscusComments.astro        # Comentários via GitHub Discussions
│   │   ├── NewsletterForm.astro        # Formulário de inscrição na newsletter
│   │   ├── MarkdownToolbar.astro       # Toolbar do editor com upload de imagem
│   │   └── admin/
│   │       └── AdminNav.astro          # Sidebar do painel admin com badges
│   └── pages/
│       ├── index.astro                 # Blog home — lista posts + filtro por tag
│       ├── busca.astro                 # Busca full-text nos posts
│       ├── sobre.astro                 # Página Sobre (conteúdo do D1)
│       ├── contato.astro               # Página Contato com formulário
│       ├── sitemap.xml.ts              # Sitemap dinâmico
│       ├── blog/
│       │   └── [slug].astro            # Post com markdown, TOC, SEO, Giscus
│       ├── rss.xml.ts                  # RSS feed dinâmico
│       ├── auth/
│       │   ├── github.ts               # GET → redireciona para GitHub OAuth
│       │   ├── callback.ts             # GET → processa callback, valida allowlist
│       │   └── logout.ts               # POST → deleta sessão
│       ├── admin/
│       │   ├── index.astro             # Dashboard com stats
│       │   ├── posts/
│       │   │   ├── index.astro         # Lista todos os posts
│       │   │   ├── new.astro           # Criar post com editor + IA + upload
│       │   │   └── [id].astro          # Editar/duplicar/excluir post
│       │   ├── pages/
│       │   │   └── [slug].astro        # Editar páginas estáticas (sobre, contato)
│       │   ├── contacts/
│       │   │   └── index.astro         # Gerenciar mensagens de contato
│       │   ├── subscribers/
│       │   │   └── index.astro         # Gerenciar assinantes da newsletter
│       │   └── settings/
│       │       └── index.astro         # Configurações do site
│       └── api/
│           ├── upload.ts               # POST → upload de imagem para MinIO
│           ├── contact.ts              # POST → salva mensagem de contato
│           ├── subscribe.ts            # POST → inscreve na newsletter
│           └── ai/
│               ├── summary.ts          # POST → Llama 3 gera resumo em PT-BR
│               ├── tags.ts             # POST → Llama 3 sugere tags
│               └── meta.ts             # POST → Llama 3 gera meta description
├── drizzle/
│   ├── 0000_init.sql                   # Migration: users, sessions, posts
│   ├── 0001_features.sql               # Migration: settings, pages, contacts, subscribers
│   └── 0002_rename_site.sql            # Migration: atualiza site_name
├── astro.config.mjs
├── wrangler.toml                       # D1, AI binding, SITE_URL
├── drizzle.config.ts
└── package.json
```

---

## Schema do banco

```sql
users       (id, github_id, username, avatar_url, created_at)
sessions    (id, user_id → users, expires_at)
posts       (id, title, slug, content, excerpt, cover_image, tags,
             status, ai_summary, meta_description, reading_time,
             views, published_at, created_at, updated_at)
settings    (key, value, updated_at)        -- configurações do site
pages       (slug, title, content, updated_at) -- sobre, contato
contacts    (id, name, email, subject, message, created_at, read)
subscribers (id, email, name, created_at, active)
```

---

## Como rodar localmente

### Pré-requisitos

- Node.js 22+
- Conta Cloudflare (gratuita)
- Wrangler CLI (`npm install -g wrangler`)
- OAuth App no GitHub

### 1. Clone e instale

```bash
git clone https://github.com/thiago-tap/site_cms.git
cd site_cms
npm install
```

### 2. Crie o banco D1

```bash
npx wrangler login
npx wrangler d1 create site-cms-db
```

Copie o `database_id` e atualize o `wrangler.toml`.

### 3. Rode as migrations

```bash
npm run db:migrate:local    # banco local
npm run db:migrate:remote   # banco em produção
npx wrangler d1 execute site-cms-db --local  --file=./drizzle/0001_features.sql
npx wrangler d1 execute site-cms-db --remote --file=./drizzle/0001_features.sql
```

### 4. Configure o GitHub OAuth

1. Crie um app em [github.com/settings/applications/new](https://github.com/settings/applications/new):
   - **Callback URL**: `http://localhost:4321/auth/callback`
2. Crie `.dev.vars`:

```bash
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
ADMIN_GITHUB_USERNAME=seu_usuario_github
SITE_URL=http://localhost:4321
```

### 5. (Opcional) Configure o MinIO para upload de imagens

Adicione ao `.dev.vars`:

```bash
MINIO_ENDPOINT=https://seu-minio.exemplo.com
MINIO_ACCESS_KEY=sua_access_key
MINIO_SECRET_KEY=sua_secret_key
MINIO_BUCKET=nome-do-bucket
MINIO_PUBLIC_URL=https://seu-minio.exemplo.com/nome-do-bucket
```

O bucket precisa ter política de leitura pública. Com o `mc`:

```bash
mc alias set minio https://seu-minio.exemplo.com ACCESS_KEY SECRET_KEY
mc mb minio/nome-do-bucket
mc anonymous set download minio/nome-do-bucket
```

### 6. Inicie o servidor

```bash
npm run dev
```

Acesse: `http://localhost:4321`

---

## Deploy no Cloudflare Pages

1. **Cloudflare Dashboard** → Workers & Pages → Create → Pages
2. Conecte `thiago-tap/site_cms`
3. Build:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. **Secrets** (Settings → Environment Variables):
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   - `ADMIN_GITHUB_USERNAME`
   - `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` *(se usar upload de imagens)*
5. **D1 binding**: `DB` → `site-cms-db`
6. **AI binding**: `AI` (ativar Workers AI)

> `SITE_URL` e variáveis não sensíveis do MinIO são definidas no `wrangler.toml`.

---

## Scripts

```bash
npm run dev               # Servidor de desenvolvimento
npm run build             # Build de produção (dist/)
npm run deploy            # Deploy manual Cloudflare Pages
npm run db:migrate:local  # Migration no banco local
npm run db:migrate:remote # Migration no banco remoto
npm run type-check        # astro check (TypeScript)
```

---

## Licença

MIT — use à vontade, inclusive comercialmente.

---

Construído com Astro 5, Tailwind CSS 4, Drizzle ORM, Cloudflare Workers AI e MinIO.
