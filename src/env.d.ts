/// <reference path="../.astro/types.d.ts" />
/// <reference types="@cloudflare/workers-types" />

type Env = {
  DB: D1Database;
  AI: Ai;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SITE_URL: string;
  ADMIN_GITHUB_USERNAME: string;
  // MinIO (S3-compatible) — optional, enables image upload
  MINIO_ENDPOINT?: string;      // e.g. https://minio.meuservidor.com
  MINIO_ACCESS_KEY?: string;
  MINIO_SECRET_KEY?: string;
  MINIO_BUCKET?: string;        // bucket name
  MINIO_PUBLIC_URL?: string;    // public base URL (optional, defaults to ENDPOINT/BUCKET)
  MINIO_REGION?: string;        // optional, default 'us-east-1'
  OPENAI_API_KEY?: string;   // GPT-4o-mini for grammar, titles, translation
  RESEND_API_KEY?: string;   // Resend.com for newsletter email sending
  RESEND_FROM?: string;      // e.g. "Blog do Thiago <noreply@thiago.catiteo.com>"
};

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    user: {
      id: string;
      username: string;
      avatarUrl: string | null;
    } | null;
  }
}
