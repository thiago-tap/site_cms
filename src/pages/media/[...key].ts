import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env as typeof locals.runtime.env & { MEDIA?: R2Bucket };
  if (!env.MEDIA) {
    return new Response('Media storage not configured.', { status: 503 });
  }

  const key = params.key;
  if (!key) return new Response('Not found', { status: 404 });

  const object = await env.MEDIA.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
};
