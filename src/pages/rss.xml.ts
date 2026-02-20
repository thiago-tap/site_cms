import type { APIRoute } from 'astro';
import { getDb, posts } from '../lib/db';
import { eq, desc } from 'drizzle-orm';
export const GET: APIRoute = async ({ locals }) => {
  const db = getDb(locals.runtime.env.DB);
  const allPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(20)
    .all();

  const siteUrl = locals.runtime.env.SITE_URL ?? 'https://thiago.catiteo.com';

  const items = allPosts
    .map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid>${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt ?? post.title}]]></description>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt * 1000).toUTCString()}</pubDate>` : ''}
    </item>`)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog do Thiago</title>
    <link>${siteUrl}</link>
    <description>Blog sobre desenvolvimento web, cloud e tecnologia.</description>
    <language>pt-BR</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
