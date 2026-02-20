import type { APIRoute } from 'astro';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

type MinioEnv = {
  MINIO_ENDPOINT: string;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  MINIO_BUCKET: string;
  MINIO_PUBLIC_URL?: string;
  MINIO_REGION?: string;
};

function getMinioClient(env: MinioEnv): S3Client {
  return new S3Client({
    endpoint: env.MINIO_ENDPOINT,
    region: env.MINIO_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: env.MINIO_ACCESS_KEY,
      secretAccessKey: env.MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime.env as Env & Partial<MinioEnv> & { MEDIA_BUCKET?: R2Bucket; SITE_URL?: string };

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return Response.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: 'Tipo não permitido. Use JPG, PNG, GIF, WebP, AVIF ou SVG.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = await file.arrayBuffer();

    // ── Cloudflare R2 (preferred) ──────────────────────────────────────────────
    if (env.MEDIA_BUCKET) {
      await env.MEDIA_BUCKET.put(key, buffer, {
        httpMetadata: { contentType: file.type },
      });
      const siteUrl = (env.SITE_URL ?? 'https://thiago.catiteo.com').replace(/\/$/, '');
      return Response.json({ ok: true, url: `${siteUrl}/media/${key}` });
    }

    // ── MinIO fallback ─────────────────────────────────────────────────────────
    if (!env.MINIO_ENDPOINT || !env.MINIO_ACCESS_KEY || !env.MINIO_SECRET_KEY || !env.MINIO_BUCKET) {
      return Response.json(
        { error: 'Nenhum storage configurado. Configure o bucket R2 (MEDIA_BUCKET) ou MinIO nas variáveis de ambiente.' },
        { status: 503 }
      );
    }

    const client = getMinioClient(env as MinioEnv);
    await client.send(new PutObjectCommand({
      Bucket: env.MINIO_BUCKET,
      Key: key,
      Body: new Uint8Array(buffer),
      ContentType: file.type,
    }));

    const publicBase = env.MINIO_PUBLIC_URL
      ? env.MINIO_PUBLIC_URL.replace(/\/$/, '')
      : `${env.MINIO_ENDPOINT.replace(/\/$/, '')}/${env.MINIO_BUCKET}`;

    return Response.json({ ok: true, url: `${publicBase}/${key}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return Response.json({ error: `Erro ao enviar arquivo: ${msg}` }, { status: 500 });
  }
};
