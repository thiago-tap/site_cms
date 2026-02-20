import type { APIRoute } from 'astro';
import { getDb, posts } from '../../../../lib/db';
import { inArray } from 'drizzle-orm';
import { generateId, slugify, calcReadingTime } from '../../../../lib/utils';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return Response.json({ error: 'Não autorizado.' }, { status: 401 });

  const db = getDb(locals.runtime.env.DB);
  const body = await request.json() as {
    action: 'delete' | 'publish' | 'unpublish' | 'import';
    ids?: string[];
    markdown?: string;
    filename?: string;
  };

  const { action } = body;

  if (action === 'import') {
    const { markdown = '', filename = 'post' } = body;
    if (!markdown.trim()) return Response.json({ error: 'Conteúdo vazio.' }, { status: 400 });

    // Parse front matter (---\nkey: value\n---)
    let content = markdown;
    let title = filename.replace(/\.md$/, '').replace(/[-_]/g, ' ');
    let tagsArr: string[] = [];
    let excerpt = '';

    const fmMatch = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (fmMatch) {
      const fmBlock = fmMatch[1];
      content = fmMatch[2].trim();
      for (const line of fmBlock.split('\n')) {
        const m = line.match(/^(\w+):\s*(.+)$/);
        if (!m) continue;
        const [, key, val] = m;
        if (key === 'title') title = val.replace(/^["']|["']$/g, '');
        if (key === 'tags') {
          const inner = val.replace(/^\[|\]$/g, '');
          tagsArr = inner.split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        }
        if (key === 'excerpt' || key === 'description') excerpt = val.replace(/^["']|["']$/g, '');
      }
    }

    const baseSlug = slugify(title);
    const existing = await db.select({ id: posts.id }).from(posts).all();
    const slugs = new Set(existing.map(() => ''));
    let slug = baseSlug;
    const existingSlug = await db.select({ slug: posts.slug }).from(posts).all();
    const allSlugs = new Set(existingSlug.map((p) => p.slug));
    if (allSlugs.has(slug)) slug = `${baseSlug}-${Date.now()}`;

    const now = Math.floor(Date.now() / 1000);
    const newId = generateId();
    await db.insert(posts).values({
      id: newId,
      title,
      slug,
      content,
      excerpt: excerpt || null,
      metaDescription: null,
      coverImage: null,
      tags: JSON.stringify(tagsArr),
      status: 'draft',
      readingTime: calcReadingTime(content),
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
      featured: 0,
      scheduledAt: null,
    });

    return Response.json({ ok: true, id: newId, title });
  }

  const { ids = [] } = body;
  if (ids.length === 0) return Response.json({ error: 'Nenhum post selecionado.' }, { status: 400 });

  if (action === 'delete') {
    await db.delete(posts).where(inArray(posts.id, ids));
    return Response.json({ ok: true, deleted: ids.length });
  }

  if (action === 'publish') {
    const now = Math.floor(Date.now() / 1000);
    for (const id of ids) {
      const post = await db.select().from(posts).where(inArray(posts.id, [id])).get();
      if (!post) continue;
      await db.update(posts)
        .set({ status: 'published', publishedAt: post.publishedAt ?? now, updatedAt: now })
        .where(inArray(posts.id, [id]));
    }
    return Response.json({ ok: true, updated: ids.length });
  }

  if (action === 'unpublish') {
    const now = Math.floor(Date.now() / 1000);
    await db.update(posts)
      .set({ status: 'draft', updatedAt: now })
      .where(inArray(posts.id, ids));
    return Response.json({ ok: true, updated: ids.length });
  }

  return Response.json({ error: 'Ação inválida.' }, { status: 400 });
};
