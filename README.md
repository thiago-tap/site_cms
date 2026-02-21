# Blog do Thiago

> Blog pessoal completo com painel admin, editor Markdown, IA generativa (OpenAI + Workers AI), analytics por post, posts relacionados por embeddings vetoriais, PWA, modo claro/escuro e muito mais.

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
| Lista de posts | Filtro por tag, paginação numerada, busca por D1 LIKE queries |
| Página de tags | `/tags` com tag cloud proporcional e contagem de posts |
| Post individual | Markdown renderizado, contagem de views, barra de leitura, lightbox de imagens |
| TOC automático | Sumário inline (mobile) + sidebar sticky (desktop ≥1280px) |
| Posts relacionados por IA | Embeddings vetoriais (OpenAI ou Workers AI) com fallback por tags |
| Resumo IA | Painel colapsável com resumo gerado por IA no topo do post |
| SEO completo | Open Graph, Twitter Card, JSON-LD (BlogPosting + WebSite Schema.org) |
| Compartilhamento | Botões para Twitter/X, LinkedIn, WhatsApp e copiar link |
| Comentários | Giscus (GitHub Discussions) com lazy load via IntersectionObserver |
| Newsletter | Formulário de inscrição com armazenamento em D1 |
| RSS Feed | `/rss.xml` com nome/descrição dinâmicos, enclosure de imagem e `content:encoded` |
| Sitemap | `/sitemap.xml` dinâmico com posts, `/tags` e `/busca` |
| Série de posts | Navegação entre posts de uma mesma série |
| Modo claro/escuro | Toggle persistido no localStorage, FOUC prevention, transição suave |
| PWA | `manifest.json` + service worker cache-first para assets estáticos |
| Atalho ⌘K / Ctrl+K | Abre a busca de qualquer página |
| Páginas estáticas | Sobre (timeline, skills, experiência) e Contato editáveis pelo admin |
| Formulário de contato | Mensagens armazenadas e gerenciadas no admin |

### Painel Admin

| Feature | Descrição |
|---|---|
| Dashboard | Stats: posts, views totais, contatos não lidos, assinantes |
| Editor Markdown | Toolbar com formatação, preview, inserção de imagens e upload |
| Upload de imagens | Integração com MinIO (S3-compatible self-hosted) |
| Biblioteca de mídia | Grid com preview, copiar URL, deletar imagens |
| IA: Resumo | Gera resumo do post em PT-BR (OpenAI GPT-4o-mini ou Workers AI Llama 3) |
| IA: Tags | Sugere tags relevantes baseadas no conteúdo |
| IA: Meta description | Gera meta description para SEO |
| IA: Títulos | Sugere títulos alternativos |
| IA: Tradução | Traduz o post para outro idioma |
| IA: Revisão gramatical | Corrige gramática e estilo |
| Embeddings vetoriais | Gera embedding do post para "posts relacionados" precisos |
| Analytics por post | Gráfico de views (últimos 30 dias) + top referrers por fonte |
| Histórico de revisões | Versões anteriores do post com restauração |
| Preview do post | Visualização antes de publicar |
| Posts em série | Define série e ordem dentro dela |
| Agendamento | Publica automaticamente em data/hora definida |
| Gerenciar páginas | Editar Sobre e Contato via Markdown |
| Gerenciar contatos | Listar, marcar como lido, responder por e-mail, excluir |
| Gerenciar assinantes | Listar, ativar/desativar, excluir |
| Configurações | Nome, descrição, autor, avatar, logo, redes sociais, Giscus, GA4, newsletter |

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
Markdown:     marked v15 (server-side) + embeds YouTube/Twitter/CodePen
Estilo:       Tailwind CSS 4 (via @tailwindcss/vite)
IA:           OpenAI GPT-4o-mini + text-embedding-3-small (preferencial)
              Cloudflare Workers AI — Llama 3 8B + bge-small (fallback gratuito)
Storage:      MinIO (S3-compatible) via @aws-sdk/client-s3
PWA:          manifest.json + service worker cache-first
Deploy:       Cloudflare Pages
```

---

## Arquitetura

```
site_cms/
├── public/
│   ├── favicon.svg
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service worker
├── src/
│   ├── env.d.ts                   # Types: Runtime<Env>, App.Locals
│   ├── middleware/
│   │   └── index.ts               # Valida sessão + protege /admin
│   ├── styles/
│   │   └── global.css             # Tailwind 4 + prose + dark/light mode CSS vars
│   ├── lib/
│   │   ├── auth.ts                # GitHub OAuth, sessions, upsert user
│   │   ├── markdown.ts            # renderMarkdown() + embeds + extractHeadings()
│   │   ├── embeddings.ts          # cosineSimilarity() + getRelatedPosts()
│   │   ├── settings.ts            # getSettings() / saveSettings() no D1
│   │   ├── utils.ts               # generateId, slugify, formatDate, imgProxy
│   │   └── db/
│   │       ├── schema.ts          # Todas as tabelas Drizzle
│   │       └── index.ts           # getDb(D1Database) → DrizzleD1Database
│   ├── components/
│   │   ├── Header.astro           # Navbar + toggle dark/light + ⌘K
│   │   ├── Footer.astro           # Links sociais e RSS
│   │   ├── SEO.astro              # Open Graph, Twitter Card, JSON-LD Schema.org
│   │   ├── TOC.astro              # Sumário inline + sidebar sticky
│   │   ├── PostCard.astro         # Card de post para a listagem
│   │   ├── SeriesNav.astro        # Navegação entre posts da série
│   │   ├── ShareButtons.astro     # Compartilhar no Twitter, LinkedIn, WhatsApp
│   │   ├── RelatedPosts.astro     # Posts relacionados por embeddings/tags
│   │   ├── GiscusComments.astro   # Comentários lazy-loaded via IntersectionObserver
│   │   ├── NewsletterForm.astro   # Formulário de inscrição na newsletter
│   │   ├── TrackingScripts.astro  # GA4, FB Pixel, PWA manifest, SW registration
│   │   ├── MarkdownToolbar.astro  # Toolbar do editor com upload de imagem
│   │   └── admin/
│   │       └── AdminNav.astro     # Sidebar do painel admin com badges
│   └── pages/
│       ├── index.astro            # Blog home — posts + filtro por tag + paginação
│       ├── busca.astro            # Busca via LIKE queries no D1
│       ├── tags/
│       │   └── index.astro        # Tag cloud com contagem de posts
│       ├── sobre.astro            # Página Sobre com timeline e skills
│       ├── contato.astro          # Página Contato com formulário
│       ├── sitemap.xml.ts         # Sitemap dinâmico
│       ├── rss.xml.ts             # RSS feed com content:encoded e enclosures
│       ├── blog/
│       │   └── [slug].astro       # Post: markdown, TOC sidebar, analytics, Giscus
│       ├── auth/
│       │   ├── github.ts          # GET → redireciona para GitHub OAuth
│       │   ├── callback.ts        # GET → processa callback, valida allowlist
│       │   └── logout.ts          # POST → deleta sessão
│       ├── admin/
│       │   ├── index.astro        # Dashboard com stats
│       │   ├── posts/
│       │   │   ├── index.astro    # Lista todos os posts
│       │   │   ├── new.astro      # Criar post com editor + IA + upload
│       │   │   ├── [id].astro     # Editar/duplicar/excluir post
│       │   │   └── [id]/
│       │   │       ├── analytics.astro   # Views 30 dias + top referrers
│       │   │       ├── preview.astro     # Preview do post
│       │   │       └── revisions.astro   # Histórico de versões
│       │   ├── media/
│       │   │   └── index.astro    # Biblioteca de mídia (MinIO)
│       │   ├── pages/
│       │   │   └── [slug].astro   # Editar páginas estáticas
│       │   ├── contacts/
│       │   │   └── index.astro    # Gerenciar mensagens de contato
│       │   ├── subscribers/
│       │   │   └── index.astro    # Gerenciar assinantes da newsletter
│       │   └── settings/
│       │       └── index.astro    # Configurações do site
│       └── api/
│           ├── upload.ts          # POST → upload de imagem para MinIO
│           ├── img.ts             # GET → proxy/cache de imagens
│           ├── contact.ts         # POST → salva mensagem de contato
│           ├── subscribe.ts       # POST → inscreve na newsletter
│           └── ai/
│               ├── embed.ts       # POST → gera embedding vetorial do post
│               ├── summary.ts     # POST → gera resumo em PT-BR
│               ├── tags.ts        # POST → sugere tags
│               ├── meta.ts        # POST → gera meta description
│               ├── titles.ts      # POST → sugere títulos alternativos
│               ├── translate.ts   # POST → traduz o post
│               └── grammar.ts     # POST → revisão gramatical
├── drizzle/                       # 12 migrations SQL
├── astro.config.mjs
├── wrangler.toml                  # D1, AI binding, SITE_URL
├── drizzle.config.ts
└── package.json
```

---

## Schema do banco

```sql
users           (id, github_id, username, avatar_url, created_at)
sessions        (id, user_id → users, expires_at)
posts           (id, title, slug, content, excerpt, cover_image, tags,
                 status, ai_summary, meta_description, reading_time,
                 views, published_at, scheduled_at, created_at, updated_at,
                 featured, series, series_order)
post_views_log  (post_id, day, count)              -- views diárias por post
post_referrers  (post_id, day, referrer, count)    -- tráfego por origem
post_embeddings (post_id, embedding, model, updated_at)  -- vetores para related posts
post_revisions  (id, post_id, title, content, version, saved_at)
settings        (key, value, updated_at)           -- configurações do site
pages           (slug, title, content, updated_at) -- sobre, contato
contacts        (id, name, email, subject, message, created_at, read)
subscribers     (id, email, name, created_at, active, confirmed, confirmation_token)
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
# Local
for f in drizzle/*.sql; do npx wrangler d1 execute site-cms-db --local --file="$f"; done

# Produção
for f in drizzle/*.sql; do npx wrangler d1 execute site-cms-db --remote --file="$f"; done
```

### 4. Configure as variáveis de ambiente

Crie `.dev.vars` na raiz (nunca comite este arquivo):

```bash
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
ADMIN_GITHUB_USERNAME=seu_usuario_github
SITE_URL=http://localhost:4321

# Opcional — IA com OpenAI (mais preciso que Workers AI)
OPENAI_API_KEY=sk-proj-...

# Opcional — upload de imagens via MinIO
MINIO_ENDPOINT=https://seu-minio.exemplo.com
MINIO_ACCESS_KEY=sua_access_key
MINIO_SECRET_KEY=sua_secret_key
MINIO_BUCKET=nome-do-bucket
MINIO_PUBLIC_URL=https://seu-minio.exemplo.com/nome-do-bucket
```

### 5. Configure o GitHub OAuth

Crie um app em [github.com/settings/applications/new](https://github.com/settings/applications/new):
- **Callback URL**: `http://localhost:4321/auth/callback`

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
4. **Secrets** (Settings → Environment Variables → tipo Secret):
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   - `ADMIN_GITHUB_USERNAME`
   - `OPENAI_API_KEY` *(opcional — ativa GPT-4o-mini e text-embedding-3-small)*
   - `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` *(se usar upload de imagens)*
5. **D1 binding**: `DB` → `site-cms-db`
6. **AI binding**: `AI` (ativar Workers AI — fallback gratuito quando sem OpenAI)

> `SITE_URL` e variáveis não sensíveis são definidas no `wrangler.toml`.

---

## IA: OpenAI vs Workers AI

O sistema usa automaticamente o melhor provider disponível:

| Recurso | Com `OPENAI_API_KEY` | Sem (gratuito) |
|---|---|---|
| Resumo, tags, meta, títulos | GPT-4o-mini | Llama 3 8B |
| Embeddings (posts relacionados) | text-embedding-3-small | bge-small-en-v1.5 |
| Qualidade | Alta | Boa |
| Custo | ~$0.01 por post | Gratuito |

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

Construído com Astro 5, Tailwind CSS 4, Drizzle ORM, Cloudflare Workers AI, OpenAI e MinIO.
