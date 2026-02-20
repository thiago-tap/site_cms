import type { APIRoute } from 'astro';
import { getDb, posts } from '../../../lib/db';
import { eq } from 'drizzle-orm';

interface Env {
  DB: D1Database;
  AI?: { run: (model: string, options: Record<string, unknown>) => Promise<unknown> };
  SITE_URL?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { postId, prompt: customPrompt } = await request.json() as { postId?: string; prompt?: string };
    const env = locals.runtime.env as Env;

    if (!env.AI) {
      return Response.json({ error: 'Workers AI não está disponível neste ambiente.' }, { status: 503 });
    }

    let finalPrompt = customPrompt?.trim();

    // If no prompt provided and postId given, build from title
    if (!finalPrompt && postId) {
      const db = getDb(env.DB);
      const post = await db.select({ title: posts.title }).from(posts).where(eq(posts.id, postId)).get();
      if (post?.title) {
        finalPrompt = `A high-quality, modern blog cover image for an article titled: "${post.title}". Minimalist, professional, dark background, tech aesthetic.`;
      }
    }

    if (!finalPrompt) {
      finalPrompt = 'A high-quality modern blog cover image, minimalist, professional, dark background, tech aesthetic.';
    }

    const result = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt: finalPrompt,
      num_steps: 4,
    }) as { image?: string };

    if (!result?.image) {
      return Response.json({ error: 'Falha ao gerar imagem.' }, { status: 500 });
    }

    // Return as data URL
    const dataUrl = `data:image/png;base64,${result.image}`;

    return Response.json({ ok: true, url: dataUrl });
  } catch (err) {
    console.error('AI cover error:', err);
    return Response.json({ error: 'Erro ao gerar imagem.' }, { status: 500 });
  }
};
