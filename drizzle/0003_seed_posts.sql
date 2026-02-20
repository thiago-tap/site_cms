-- Seed: posts dos projetos do portfólio
INSERT OR IGNORE INTO posts (id, title, slug, content, excerpt, cover_image, tags, status, ai_summary, meta_description, reading_time, views, published_at, created_at, updated_at) VALUES

('post-devtoolbox-01',
'DevToolbox: uma coleção de ferramentas para desenvolvedores feita com Next.js 15',
'devtoolbox-ferramentas-desenvolvedor-nextjs-15',
'## O que é o DevToolbox?

O **DevToolbox** é uma aplicação web com uma coleção de ferramentas úteis para desenvolvedores — aquelas que você usa no dia a dia mas sempre precisa pesquisar no Google: formatadores, codificadores, geradores e conversores.

Acesse em: [devtools.catiteo.com](https://devtools.catiteo.com)

## Ferramentas disponíveis

O projeto reúne diversas utilidades em um só lugar:

- **Formatador JSON** — cola um JSON bagunçado, recebe ele identado e legível
- **Codificador/Decodificador Base64** — converte strings para Base64 e vice-versa
- **Codificador URL** — encode e decode de query strings
- **Gerador de UUID** — gera UUIDs v4 com um clique
- **Conversor de cores** — HEX, RGB, HSL
- **Diff de texto** — compara dois blocos de texto e destaca as diferenças
- **Hash generator** — MD5, SHA-1, SHA-256 no browser, sem enviar nada para servidor

## Por que Next.js 15?

Escolhi o **Next.js 15** com App Router para explorar as últimas novidades do ecossistema React:

### Server Components
A maioria das páginas do DevToolbox são Server Components — o HTML chega pronto ao browser, sem JavaScript desnecessário. Só os componentes interativos (os que precisam de estado) são Client Components.

### App Router e layouts aninhados
O App Router permite layouts aninhados nativamente. O DevToolbox usa isso para manter a barra lateral de navegação entre ferramentas sem re-renderizações.

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Sidebar />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

### Turbopack no desenvolvimento
Com Next.js 15, o Turbopack está estável para desenvolvimento. O hot reload ficou perceptivelmente mais rápido comparado ao webpack.

## Stack técnica

```
Framework:   Next.js 15 (App Router)
Linguagem:   TypeScript 5
Estilo:      Tailwind CSS 4
Deploy:      Cloudflare Pages (static export)
```

## Aprendizados

O maior aprendizado foi entender **quando usar Server Components vs Client Components**. A regra que adotei: começa como Server Component, só vira Client se precisar de `useState`, `useEffect` ou event listeners do browser.

Outra lição foi o **static export** do Next.js no Cloudflare Pages — algumas funcionalidades do App Router não funcionam no modo estático, como Route Handlers com métodos dinâmicos. Para o DevToolbox, que não precisa de backend, o export estático foi a escolha certa.

## Próximos passos

- Conversor Markdown → HTML
- Minificador de CSS/JS
- Gerador de senhas seguras
- Validador de expressões regulares com testes em tempo real

Se tiver alguma ferramenta que sente falta, deixa nos comentários!',
'Uma coleção de ferramentas para desenvolvedores construída com Next.js 15 App Router: formatadores, codificadores, geradores e conversores em um só lugar.',
NULL,
'["nextjs","react","typescript","cloudflare","ferramentas"]',
'published',
'O DevToolbox é uma aplicação Next.js 15 com ferramentas para desenvolvedores como formatador JSON, codificador Base64, gerador de UUID e mais. Usa App Router, Server Components e Tailwind CSS 4.',
'Conheça o DevToolbox: uma coleção de ferramentas para desenvolvedores feita com Next.js 15 App Router, Server Components e Tailwind CSS 4.',
6, 0, unixepoch(), unixepoch(), unixepoch()),

('post-sniphub-01',
'SnipHub: gerenciador de snippets de código com SvelteKit 2 e Svelte 5',
'sniphub-gerenciador-snippets-sveltekit-svelte-5',
'## O que é o SnipHub?

O **SnipHub** é um gerenciador de snippets de código — aquele lugar onde você guarda aquele trecho de regex que sempre esquece, o comando Docker que nunca lembra, ou a configuração do Nginx que pesquisou por meia hora.

Acesse em: [snippets.catiteo.com](https://snippets.catiteo.com)

## Funcionalidades

- Criar, editar e excluir snippets
- Highlight de sintaxe para dezenas de linguagens
- Busca instantânea por título, conteúdo e tags
- Filtro por linguagem
- Copiar snippet com um clique
- Interface rápida e responsiva

## Por que SvelteKit + Svelte 5?

Escolhi o **SvelteKit 2** com **Svelte 5** para explorar a nova API de reatividade chamada **Runes**, que mudou bastante a forma de escrever componentes Svelte.

### Svelte 5 Runes

O Svelte 5 introduziu as Runes — uma nova forma de declarar estado reativo usando funções especiais como `$state`, `$derived` e `$effect`:

```svelte
<script>
  // Antes (Svelte 4)
  let count = 0;
  $: double = count * 2;

  // Agora (Svelte 5)
  let count = $state(0);
  let double = $derived(count * 2);
</script>
```

A diferença pode parecer pequena, mas as Runes funcionam em arquivos `.ts` normais, fora de componentes `.svelte`. Isso permite extrair lógica reativa para arquivos separados — algo que era muito mais difícil antes.

### Menos magia, mais explícito

Uma das críticas ao Svelte era que a reatividade "mágica" (baseada em atribuição) dificultava o entendimento em projetos maiores. Com Runes, fica explícito o que é estado reativo e o que é variável comum.

## Stack técnica

```
Framework:   SvelteKit 2
UI:          Svelte 5 (Runes)
Linguagem:   TypeScript 5
Highlight:   highlight.js
Estilo:      Tailwind CSS 4
Deploy:      Cloudflare Pages
```

## O que aprendi

**Svelte compila para JavaScript vanilla** — sem runtime pesado. O bundle final do SnipHub é significativamente menor do que um equivalente em React/Vue.

O sistema de **stores do SvelteKit** com Runes também facilitou muito o compartilhamento de estado entre componentes sem precisar de Context API ou Zustand.

## Próximos passos

- Exportar snippets como Gist do GitHub
- Pastas/coleções para organizar snippets
- Snippets públicos e compartilháveis por link
- Integração com VS Code via extensão

O SnipHub resolve aquele problema clássico de desenvolvedor: "onde eu guardei aquele snippet mesmo?"',
'Um gerenciador de snippets de código construído com SvelteKit 2 e Svelte 5, explorando a nova API de reatividade chamada Runes.',
NULL,
'["sveltekit","svelte","typescript","cloudflare","snippets"]',
'published',
'O SnipHub é um gerenciador de snippets feito com SvelteKit 2 e Svelte 5 Runes. Suporta highlight de sintaxe, busca instantânea, filtro por linguagem e cópia com um clique.',
'Conheça o SnipHub: gerenciador de snippets de código feito com SvelteKit 2 e Svelte 5 Runes, com highlight de sintaxe e busca instantânea.',
5, 0, unixepoch(), unixepoch(), unixepoch()),

('post-blogthiago-01',
'Blog do Thiago: como construí um CMS completo com Astro 5 e Cloudflare',
'blog-do-thiago-cms-astro-5-cloudflare',
'## A ideia

Queria um blog pessoal com painel de administração próprio — sem depender do WordPress, Ghost ou qualquer CMS externo. O desafio: rodar tudo no plano gratuito da Cloudflare, sem servidor dedicado.

A solução: **Astro 5** no edge da Cloudflare com **D1** como banco de dados e **Workers AI** para funcionalidades de inteligência artificial.

## Por que Astro?

O Astro tem uma proposta diferente dos outros frameworks: **zero JavaScript por padrão**. As páginas do blog são HTML puro geradas no servidor — sem React, sem Vue, sem bundle pesado chegando no browser.

Isso importa muito para SEO e performance. O Lighthouse do blog está consistentemente acima de 95 em todas as métricas.

### Islands Architecture

O Astro usa o conceito de **Islands** — ilhas de interatividade em um oceano de HTML estático. Os formulários, botões de IA e o editor de markdown são "ilhas" que carregam JavaScript só quando necessário.

```astro
---
// Código do servidor — roda só no build/request
import { getDb, posts } from ''../lib/db'';
const allPosts = await getDb(Astro.locals.runtime.env.DB)
  .select().from(posts).all();
---

<!-- HTML puro, zero JS -->
{allPosts.map(post => (
  <article>
    <h2>{post.title}</h2>
  </article>
))}
```

## Stack completa

```
Framework:    Astro 5 (SSR no edge)
Adapter:      @astrojs/cloudflare v12
Banco:        Cloudflare D1 (SQLite na edge) + Drizzle ORM
Auth:         GitHub OAuth via Arctic v2
IA:           Cloudflare Workers AI (Llama 3 8B)
Storage:      MinIO self-hosted via @aws-sdk/client-s3
Estilo:       Tailwind CSS 4
Deploy:       Cloudflare Pages (gratuito)
```

## Funcionalidades implementadas

### Blog público
- Lista de posts com filtro por tag e busca full-text
- Post individual com TOC automático, contador de views e posts relacionados
- SEO completo: Open Graph, Twitter Card e JSON-LD structured data
- Compartilhamento no Twitter/X, LinkedIn e WhatsApp
- Comentários via Giscus (GitHub Discussions)
- Newsletter com armazenamento no D1
- RSS feed e sitemap dinâmicos

### Painel Admin
- Dashboard com estatísticas em tempo real
- Editor Markdown com toolbar de formatação
- Upload de imagens para MinIO (S3-compatible self-hosted)
- IA para gerar resumo, sugerir tags e criar meta descriptions
- Gerenciamento de mensagens de contato e assinantes
- Configurações completas do site

### Segurança
O acesso ao admin é protegido por GitHub OAuth com allowlist: só o usuário configurado em `ADMIN_GITHUB_USERNAME` consegue entrar. Qualquer outra conta GitHub recebe 403.

## Cloudflare D1: SQLite na edge

O D1 é o banco de dados serverless da Cloudflare — SQLite rodando na mesma edge que processa as requisições. Latência baixíssima, sem cold start de conexão TCP.

Uso o **Drizzle ORM** para type-safety:

```typescript
import { drizzle } from ''drizzle-orm/d1'';
import * as schema from ''./schema'';

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
```

## MinIO para imagens

O blog usa meu servidor **MinIO self-hosted** para armazenar imagens — uma alternativa ao Cloudflare R2 para quem já tem infraestrutura própria.

A integração usa o `@aws-sdk/client-s3` com `forcePathStyle: true` (necessário para MinIO):

```typescript
const client = new S3Client({
  endpoint: env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});
```

## Custo total

| Serviço | Plano | Custo |
|---|---|---|
| Cloudflare Pages | Free | R$ 0 |
| Cloudflare D1 | Free (5GB, 5M leituras/dia) | R$ 0 |
| Cloudflare Workers AI | Free (10k neurons/dia) | R$ 0 |
| MinIO | Self-hosted no meu servidor | R$ 0 extra |

**Total: R$ 0/mês** para um blog com IA, upload de imagens e painel admin completo.

## Código aberto

O código está disponível no GitHub: [github.com/thiago-tap/site_cms](https://github.com/thiago-tap/site_cms)

Sinta-se livre para usar como base para o seu próprio blog!',
'Como construí um CMS completo com Astro 5, Cloudflare D1, Workers AI e MinIO self-hosted — com painel admin, IA integrada e custo zero.',
NULL,
'["astro","cloudflare","typescript","cms","minio","ia"]',
'published',
'Este blog foi construído com Astro 5 no edge da Cloudflare, usando D1 como banco SQLite, Workers AI para geração de conteúdo e MinIO para armazenamento de imagens — tudo com custo zero.',
'Como construí o Blog do Thiago: um CMS completo com Astro 5, Cloudflare D1, Workers AI e MinIO self-hosted. Painel admin, IA e custo R$ 0/mês.',
8, 0, unixepoch(), unixepoch(), unixepoch());
