import type { APIRoute } from 'astro';
import { getDb, posts } from '../lib/db';
import { eq, desc } from 'drizzle-orm';
export const GET: APIRoute = async ({ locals }) => {
  const db = getDb(locals.runtime.env.DB);
  const siteUrl = locals.runtime.env.SITE_URL ?? 'https://thiago.catiteo.com';

  const allPosts = await db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt })
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.updatedAt))
    .all();

  const staticPages = [
    { loc: '/', priority: '1.0' },
    { loc: '/tags', priority: '0.6' },
    { loc: '/busca', priority: '0.5' },
    { loc: '/sobre', priority: '0.7' },
    { loc: '/contato', priority: '0.6' },
  ];

  const postEntries = allPosts.map((p) => ({
    loc: `/blog/${p.slug}`,
    lastmod: new Date(p.updatedAt * 1000).toISOString().split('T')[0],
    priority: '0.9',
  }));

  const entries = [
    ...staticPages.map((p) => `
  <url>
    <loc>${siteUrl}${p.loc}</loc>
    <priority>${p.priority}</priority>
  </url>`),
    ...postEntries.map((p) => `
  <url>
    <loc>${siteUrl}${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <priority>${p.priority}</priority>
  </url>`),
  ].join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
