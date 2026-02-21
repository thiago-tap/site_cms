import type { APIRoute } from 'astro';
import { getDb, posts } from '../lib/db';
import { eq, desc } from 'drizzle-orm';
import { getSettings } from '../lib/settings';
import { renderMarkdown } from '../lib/markdown';

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const db = getDb(env.DB);
  const siteUrl = env.SITE_URL ?? 'https://thiago.catiteo.com';

  const [allPosts, config] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(eq(posts.status, 'published'))
      .orderBy(desc(posts.publishedAt))
      .limit(50)
      .all(),
    getSettings(env.DB),
  ]);

  const siteName = config.site_name || 'Blog do Thiago';
  const siteDescription = config.site_description || 'Blog sobre desenvolvimento web, cloud e tecnologia.';

  const items = allPosts
    .map((post) => {
      const html = renderMarkdown(post.content);
      const cover = post.coverImage?.startsWith('http') ? post.coverImage : null;
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid>${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt ?? post.title}]]></description>
      <content:encoded><![CDATA[${html}]]></content:encoded>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt * 1000).toUTCString()}</pubDate>` : ''}
      ${cover ? `<enclosure url="${cover}" type="image/jpeg" length="0"/>` : ''}
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>${siteDescription}</description>
    <language>pt-BR</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
