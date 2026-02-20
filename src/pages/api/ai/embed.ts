import type { APIRoute } from 'astro';
import { getDb, posts, postEmbeddings } from '../../../lib/db';
import { eq } from 'drizzle-orm';

interface Env {
  DB: D1Database;
  AI?: { run: (model: string, options: Record<string, unknown>) => Promise<unknown> };
  OPENAI_API_KEY?: string;
}

async function generateEmbedding(
  text: string,
  env: Env
): Promise<{ vector: number[]; model: string }> {
  // Prefer OpenAI if API key is configured
  if (env.OPENAI_API_KEY) {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text, model: 'text-embedding-3-small' }),
    });
    if (!res.ok) throw new Error(`OpenAI embeddings error: ${res.status}`);
    const data = await res.json() as { data: { embedding: number[] }[] };
    return { vector: data.data[0].embedding, model: 'text-embedding-3-small' };
  }

  // Fallback: Workers AI bge-small-en-v1.5 (free)
  if (env.AI) {
    const result = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
      text: [text],
    }) as { data: number[][] };
    return { vector: result.data[0], model: 'bge-small' };
  }

  throw new Error('Nenhum provider de embeddings disponível.');
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { postId } = await request.json() as { postId: string };
    if (!postId) return Response.json({ error: 'postId é obrigatório.' }, { status: 400 });

    const env = locals.runtime.env as Env;
    const db = getDb(env.DB);

    const post = await db.select().from(posts).where(eq(posts.id, postId)).get();
    if (!post) return Response.json({ error: 'Post não encontrado.' }, { status: 404 });

    // Build text input: title + excerpt + first 1000 chars of content
    const text = [post.title, post.excerpt ?? '', post.content.slice(0, 1000)]
      .filter(Boolean)
      .join(' ')
      .trim();

    const { vector, model } = await generateEmbedding(text, env);
    const now = Math.floor(Date.now() / 1000);

    await db
      .insert(postEmbeddings)
      .values({
        postId,
        embedding: JSON.stringify(vector),
        model,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: postEmbeddings.postId,
        set: { embedding: JSON.stringify(vector), model, updatedAt: now },
      });

    return Response.json({ ok: true, model, dimensions: vector.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return Response.json({ error: msg }, { status: 500 });
  }
};
