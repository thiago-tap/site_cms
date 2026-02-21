import type { APIRoute } from 'astro';

/**
 * Image proxy with Cloudflare Image Resizing support.
 *
 * - Free plan:  routes image through Cloudflare edge → CF Polish converts to WebP automatically.
 * - Pro plan:   cf.image also resizes and converts format at the edge (faster, no extra origin hit).
 *
 * Usage: /api/img?src=<encoded-url>&w=<width>
 * Response is cached immutably for 1 year at the edge.
 */
export const GET: APIRoute = async ({ url }) => {
  const src = url.searchParams.get('src');
  const w = url.searchParams.get('w');

  if (!src) return new Response('Missing src', { status: 400 });

  try {
    const cfImage = w ? { width: parseInt(w, 10), format: 'webp', quality: 82 } : undefined;

    // cf.image is a Cloudflare Workers extension — ignored on non-CF environments (e.g. local dev)
    const res = await fetch(src, { cf: cfImage ? { image: cfImage } : undefined } as RequestInit);

    if (!res.ok) return new Response(null, { status: res.status });

    return new Response(res.body, {
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'image/jpeg',
        // Immutable 1-year cache so CF edge serves from cache on subsequent requests
        'Cache-Control': 'public, max-age=31536000, immutable',
        // Vary by Accept so browsers that support WebP get the converted version
        'Vary': 'Accept',
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
};
