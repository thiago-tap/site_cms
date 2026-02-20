import type { APIRoute } from 'astro';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

type MinioEnv = {
  MINIO_ENDPOINT: string;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  MINIO_BUCKET: string;
  MINIO_PUBLIC_URL?: string;
  MINIO_REGION?: string;
};

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return Response.json({ error: 'Não autorizado.' }, { status: 401 });

  const env = locals.runtime.env as Partial<MinioEnv>;

  if (!env.MINIO_ENDPOINT || !env.MINIO_ACCESS_KEY || !env.MINIO_SECRET_KEY || !env.MINIO_BUCKET) {
    return Response.json({ objects: [], minioEnabled: false });
  }

  try {
    const client = new S3Client({
      endpoint: env.MINIO_ENDPOINT,
      region: env.MINIO_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: env.MINIO_ACCESS_KEY,
        secretAccessKey: env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true,
    });

    const result = await client.send(new ListObjectsV2Command({
      Bucket: env.MINIO_BUCKET,
      Prefix: 'uploads/',
      MaxKeys: 200,
    }));

    const publicBase = env.MINIO_PUBLIC_URL
      ? env.MINIO_PUBLIC_URL.replace(/\/$/, '')
      : `${env.MINIO_ENDPOINT.replace(/\/$/, '')}/${env.MINIO_BUCKET}`;

    const objects = (result.Contents ?? [])
      .filter((obj) => obj.Key)
      .map((obj) => ({
        key: obj.Key!,
        size: obj.Size ?? 0,
        uploaded: obj.LastModified?.toISOString() ?? new Date().toISOString(),
        url: `${publicBase}/${obj.Key}`,
      }))
      .sort((a, b) => b.uploaded.localeCompare(a.uploaded));

    return Response.json({ objects, minioEnabled: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    return Response.json({ error: msg }, { status: 500 });
  }
};
