import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime.env as typeof locals.runtime.env & { MEDIA?: R2Bucket };
    if (!env.MEDIA) {
      return Response.json({ error: 'Upload de imagens não configurado. Adicione o binding R2 "MEDIA" no Cloudflare Pages.' }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return Response.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Tipo de arquivo não permitido. Use JPG, PNG, GIF, WebP ou SVG.' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return Response.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const buffer = await file.arrayBuffer();
    await env.MEDIA.put(key, buffer, {
      httpMetadata: { contentType: file.type },
    });

    const url = `/media/${key}`;
    return Response.json({ ok: true, url });
  } catch {
    return Response.json({ error: 'Erro ao enviar arquivo.' }, { status: 500 });
  }
};
