# CatitéoCMS

> Blog CMS com painel admin, posts em Markdown, e IA para geração de resumos e sugestão de tags.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-cms.catiteo.com-6366f1?style=for-the-badge)](https://cms.catiteo.com/)

**Live:** [cms.catiteo.com](https://cms.catiteo.com/) · **Repositório:** [github.com/thiago-tap/site_cms](https://github.com/thiago-tap/site_cms)

![Astro](https://img.shields.io/badge/Astro-5-FF5D01?logo=astro&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/licença-MIT-22c55e)

---

## Sobre o projeto

**CatitéoCMS** é um blog com painel de administração construído com **Astro 5** e hospedado no edge da Cloudflare. O projeto faz parte de um portfólio de três aplicações que demonstram frameworks modernos diferentes:

| Projeto | Framework | Link |
|---|---|---|
| DevToolbox | Next.js 15 (App Router) | [devtools.catiteo.com](https://devtools.catiteo.com) |
| SnipHub | SvelteKit 2 + Svelte 5 | [snippets.catiteo.com](https://snippets.catiteo.com) |
| CatitéoCMS | **Astro 5** | [cms.catiteo.com](https://cms.catiteo.com) |

### Por que Astro?

- **Zero JS por padrão** — páginas do blog são HTML puro, sem JavaScript enviado ao cliente
- **Islands Architecture** — só hidrata componentes interativos (botões AI, formulários)
- **SSR híbrido** — blog estático rápido + admin dinâmico no mesmo projeto
- **View Transitions** — navegação suave sem SPA overhead
- **Sem framework de UI** — HTML e vanilla JS onde necessário, sem React/Vue/Svelte

---

## Funcionalidades

| Feature | Descrição |
|---|---|
| Blog público | Lista de posts com filtro por tag, RSS feed |
| Post individual | Markdown renderizado server-side, contagem de views |
| Painel Admin | Dashboard com stats, CRUD de posts protegido por login |
| GitHub OAuth | Login seguro para acessar o admin |
| Editor Markdown | Textarea com suporte a MDX/Markdown no admin |
| IA: Resumo | Llama 3 8B gera resumo do post em PT-BR |
| IA: Tags | Llama 3 8B sugere tags relevantes para o conteúdo |
| RSS Feed | `/rss.xml` automático com todos os posts publicados |
| Edge Deploy | Cloudflare Pages + D1 na edge global |

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
│   │   ├── markdown.ts                 # renderMarkdown() via marked
│   │   ├── utils.ts                    # generateId, slugify, formatDate, calcReadingTime
│   │   └── db/
│   │       ├── schema.ts               # Tabelas: users, sessions, posts
│   │       └── index.ts                # getDb(D1Database) → DrizzleD1Database
│   ├── components/
│   │   ├── Header.astro                # Navbar com links e avatar do usuário
│   │   ├── Footer.astro                # Links RSS e GitHub
│   │   ├── PostCard.astro              # Card de post para a listagem
│   │   └── admin/
│   │       └── AdminNav.astro          # Sidebar do painel admin
│   └── pages/
│       ├── index.astro                 # Blog home — lista posts + filtro por tag
│       ├── blog/
│       │   └── [slug].astro            # Post individual com markdown + AI summary
│       ├── rss.xml.ts                  # RSS feed dinâmico
│       ├── auth/
│       │   ├── github.ts               # GET → redireciona para GitHub OAuth
│       │   ├── callback.ts             # GET → processa callback, cria sessão
│       │   └── logout.ts               # POST → deleta sessão
│       ├── admin/
│       │   ├── index.astro             # Dashboard com stats
│       │   └── posts/
│       │       ├── index.astro         # Lista todos os posts
│       │       ├── new.astro           # Criar post com editor + IA
│       │       └── [id].astro          # Editar/excluir post
│       └── api/
│           └── ai/
│               ├── summary.ts          # POST → Llama 3 gera resumo em PT-BR
│               └── tags.ts             # POST → Llama 3 sugere tags
├── drizzle/
│   └── 0000_init.sql                   # Migration: users, sessions, posts
├── astro.config.mjs                    # output: server, @astrojs/cloudflare
├── wrangler.toml                       # D1 binding, AI binding, Pages config
├── drizzle.config.ts
└── package.json
```

---

## Schema do banco

```sql
users    (id, github_id, username, avatar_url, created_at)
sessions (id, user_id → users, expires_at)
posts    (
  id, title, slug UNIQUE,
  content,           -- Markdown completo
  excerpt,           -- Resumo manual (para cards)
  cover_image,       -- URL da imagem de capa
  tags,              -- JSON array: '["astro","cloudflare"]'
  status,            -- 'draft' | 'published'
  ai_summary,        -- Resumo gerado pela IA (exibido no topo do post)
  reading_time,      -- Calculado automaticamente (palavras / 200)
  views,             -- Incrementado assincronamente
  published_at, created_at, updated_at
)
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

### 3. Rode a migration

```bash
npm run db:migrate:local    # banco local
npm run db:migrate:remote   # banco em produção
```

### 4. Configure o GitHub OAuth

1. Crie um app em [github.com/settings/applications/new](https://github.com/settings/applications/new):
   - **Callback URL**: `http://localhost:4321/auth/callback`
2. Crie `.dev.vars`:

```bash
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
```

### 5. Inicie o servidor

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
4. **Variables**: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
5. **D1 binding**: `DB` → `site-cms-db`
6. **AI binding**: `AI` (ativar Workers AI)

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

Construído com Astro 5, Tailwind CSS 4, Drizzle ORM e Cloudflare Workers AI.
