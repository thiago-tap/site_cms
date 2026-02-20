import type { APIRoute } from 'astro';
import { getDb, posts } from '../../lib/db';
import { eq } from 'drizzle-orm';
import { getSettings } from '../../lib/settings';

export const GET: APIRoute = async ({ params, locals }) => {
  const { slug } = params;
  if (!slug) return new Response('Not found', { status: 404 });

  const db = getDb(locals.runtime.env.DB);
  const [post, config] = await Promise.all([
    db.select().from(posts).where(eq(posts.slug, slug)).get(),
    getSettings(locals.runtime.env.DB),
  ]);

  if (!post) return new Response('Not found', { status: 404 });

  const title = post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const siteName = config.site_name.replace(/&/g, '&amp;');
  const tags = (() => {
    try { return (JSON.parse(post.tags) as string[]).slice(0, 3).join(' · '); }
    catch { return ''; }
  })();

  // Wrap title into lines of max ~40 chars
  const words = post.title.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > 38) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
    if (lines.length >= 3) break;
  }
  if (current && lines.length < 3) lines.push(current);

  const titleLines = lines.map((line, i) =>
    `<text x="60" y="${200 + i * 72}" font-family="system-ui,sans-serif" font-size="56" font-weight="700" fill="#f4f4f5">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`
  ).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="6" fill="url(#accent)"/>
  <rect x="60" y="100" width="80" height="6" rx="3" fill="url(#accent)"/>
  ${titleLines}
  ${tags ? `<text x="60" y="${200 + lines.length * 72 + 40}" font-family="system-ui,sans-serif" font-size="28" fill="#6366f1">${tags.replace(/&/g, '&amp;')}</text>` : ''}
  <text x="60" y="580" font-family="system-ui,sans-serif" font-size="28" font-weight="600" fill="#71717a">${siteName}</text>
  <text x="1140" y="580" text-anchor="end" font-family="system-ui,sans-serif" font-size="24" fill="#3f3f46">${post.readingTime} min de leitura</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
