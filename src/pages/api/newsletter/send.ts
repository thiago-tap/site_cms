import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { subscribers } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSettings } from '../../../lib/settings';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime.env as Env;

    if (!locals.user) return Response.json({ error: 'Não autorizado.' }, { status: 401 });
    if (!env.RESEND_API_KEY) return Response.json({ error: 'RESEND_API_KEY não configurada.' }, { status: 503 });

    const { subject, html, previewText } = await request.json() as {
      subject: string;
      html: string;
      previewText?: string;
    };

    if (!subject?.trim() || !html?.trim()) {
      return Response.json({ error: 'Assunto e conteúdo são obrigatórios.' }, { status: 400 });
    }

    const db = getDb(env.DB);
    const config = await getSettings(env.DB);
    const activeSubscribers = await db.select().from(subscribers).where(eq(subscribers.active, 1)).all();

    if (activeSubscribers.length === 0) {
      return Response.json({ error: 'Nenhum assinante ativo encontrado.' }, { status: 400 });
    }

    const from = env.RESEND_FROM ?? `${config.site_name} <noreply@thiago.catiteo.com>`;
    const siteUrl = env.SITE_URL ?? 'https://thiago.catiteo.com';

    const emailHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title></head>
<body style="margin:0;padding:0;background:#09090b;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:2rem 1rem;">
  <div style="margin-bottom:2rem;">
    <a href="${siteUrl}" style="text-decoration:none;color:#6366f1;font-weight:700;font-size:1.1rem;">${config.site_name}</a>
  </div>
  <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:2rem;color:#d4d4d8;line-height:1.7;">
    ${html}
  </div>
  <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid #27272a;text-align:center;color:#52525b;font-size:0.75rem;">
    <p>Você está recebendo este e-mail porque se inscreveu em <a href="${siteUrl}" style="color:#6366f1;">${siteUrl}</a>.</p>
    <p>Para cancelar a inscrição, responda este e-mail com "cancelar".</p>
  </div>
</div>
</body></html>`;

    // Send individually (Resend free plan: 1 recipient per call, or use batch)
    const results = await Promise.allSettled(
      activeSubscribers.map((sub) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
          body: JSON.stringify({ from, to: sub.email, subject, html: emailHtml }),
        })
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - sent;

    return Response.json({ ok: true, sent, failed, total: activeSubscribers.length });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Erro desconhecido' }, { status: 500 });
  }
};
