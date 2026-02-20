import type { APIRoute } from 'astro';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

type MinioEnv = {
  MINIO_ENDPOINT: string;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  MINIO_BUCKET: string;
  MINIO_REGION?: string;
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return Response.json({ error: 'Não autorizado.' }, { status: 401 });

  const env = locals.runtime.env as Partial<MinioEnv>;

  if (!env.MINIO_ENDPOINT || !env.MINIO_ACCESS_KEY || !env.MINIO_SECRET_KEY || !env.MINIO_BUCKET) {
    return Response.json({ error: 'MinIO não configurado.' }, { status: 503 });
  }

  try {
    const { key } = await request.json() as { key: string };
    if (!key) return Response.json({ error: 'key é obrigatório.' }, { status: 400 });

    const client = new S3Client({
      endpoint: env.MINIO_ENDPOINT,
      region: env.MINIO_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: env.MINIO_ACCESS_KEY,
        secretAccessKey: env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true,
    });

    await client.send(new DeleteObjectCommand({
      Bucket: env.MINIO_BUCKET,
      Key: key,
    }));

    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    return Response.json({ error: msg }, { status: 500 });
  }
};
