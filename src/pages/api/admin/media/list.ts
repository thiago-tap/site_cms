import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return Response.json({ error: 'Não autorizado.' }, { status: 401 });

  const env = locals.runtime.env as { MEDIA_BUCKET?: R2Bucket; SITE_URL?: string };

  if (!env.MEDIA_BUCKET) {
    return Response.json({ objects: [], r2Enabled: false });
  }

  try {
    const siteUrl = (env.SITE_URL ?? 'https://thiago.catiteo.com').replace(/\/$/, '');
    const listed = await env.MEDIA_BUCKET.list({ prefix: 'uploads/', limit: 200 });

    const objects = listed.objects.map((obj) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
      url: `${siteUrl}/media/${obj.key}`,
    }));

    return Response.json({ objects, r2Enabled: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    return Response.json({ error: msg }, { status: 500 });
  }
};
