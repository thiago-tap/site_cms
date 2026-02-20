import type { APIRoute } from 'astro';

export const DELETE: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return Response.json({ error: 'Não autorizado.' }, { status: 401 });

  const env = locals.runtime.env as { MEDIA_BUCKET?: R2Bucket };
  if (!env.MEDIA_BUCKET) return Response.json({ error: 'R2 não configurado.' }, { status: 503 });

  try {
    const { key } = await request.json() as { key: string };
    if (!key) return Response.json({ error: 'key é obrigatório.' }, { status: 400 });

    await env.MEDIA_BUCKET.delete(key);
    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    return Response.json({ error: msg }, { status: 500 });
  }
};
