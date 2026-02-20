import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const key = params.key;
  if (!key) return new Response(null, { status: 400 });

  const env = locals.runtime.env as { MEDIA_BUCKET?: R2Bucket };

  if (!env.MEDIA_BUCKET) {
    return new Response('R2 não configurado.', { status: 503 });
  }

  try {
    const obj = await env.MEDIA_BUCKET.get(key);
    if (!obj) return new Response(null, { status: 404 });

    const headers = new Headers();
    headers.set('Content-Type', obj.httpMetadata?.contentType ?? 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    if (obj.size) headers.set('Content-Length', String(obj.size));

    return new Response(obj.body, { headers });
  } catch {
    return new Response(null, { status: 500 });
  }
};
