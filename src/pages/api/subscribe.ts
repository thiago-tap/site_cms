import type { APIRoute } from 'astro';
import { getDb, subscribers } from '../../lib/db';
import { eq } from 'drizzle-orm';
import { generateId } from '../../lib/utils';
import { getSettings } from '../../lib/settings';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, name } = await request.json() as { email: string; name?: string };

    if (!email?.trim()) {
      return Response.json({ error: 'Email é obrigatório.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Email inválido.' }, { status: 400 });
    }

    const env = locals.runtime.env as Env;
    const db = getDb(env.DB);
    const config = await getSettings(env.DB);
    const doubleOptin = config.double_optin_enabled === '1' && !!env.RESEND_API_KEY;

    const existing = await db.select().from(subscribers).where(eq(subscribers.email, email.toLowerCase())).get();

    if (existing) {
      if (existing.active && existing.confirmed) {
        return Response.json({ error: 'Este email já está inscrito.' }, { status: 409 });
      }
      if (existing.active && !existing.confirmed) {
        // Resend confirmation
        if (doubleOptin && existing.confirmationToken) {
          await sendConfirmationEmail(env, config, email, existing.confirmationToken);
        }
        return Response.json({ ok: true, pending: true });
      }
      // Reactivate
      await db.update(subscribers)
        .set({ active: 1, confirmed: doubleOptin ? 0 : 1, name: name?.trim() ?? existing.name })
        .where(eq(subscribers.id, existing.id));
      return Response.json({ ok: true, pending: doubleOptin });
    }

    const token = doubleOptin ? generateId(32) : null;

    await db.insert(subscribers).values({
      id: generateId(),
      email: email.toLowerCase().trim(),
      name: name?.trim() ?? '',
      createdAt: Math.floor(Date.now() / 1000),
      active: 1,
      confirmed: doubleOptin ? 0 : 1,
      confirmationToken: token,
    });

    if (doubleOptin && token) {
      await sendConfirmationEmail(env, config, email, token);
    }

    return Response.json({ ok: true, pending: doubleOptin });
  } catch {
    return Response.json({ error: 'Erro interno.' }, { status: 500 });
  }
};

async function sendConfirmationEmail(env: Env, config: { site_name: string; [k: string]: string }, email: string, token: string) {
  const siteUrl = env.SITE_URL ?? 'https://thiago.catiteo.com';
  const confirmUrl = `${siteUrl}/confirm/${token}`;
  const from = env.RESEND_FROM ?? `${config.site_name} <noreply@thiago.catiteo.com>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from,
      to: email,
      subject: `Confirme sua inscrição — ${config.site_name}`,
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:2rem 1rem;">
  <div style="margin-bottom:2rem;">
    <a href="${siteUrl}" style="text-decoration:none;color:#6366f1;font-weight:700;font-size:1.1rem;">${config.site_name}</a>
  </div>
  <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:2rem;color:#d4d4d8;line-height:1.7;">
    <h2 style="margin:0 0 1rem;color:#f4f4f5;font-size:1.25rem;">Confirme sua inscrição</h2>
    <p>Olá! Você solicitou inscrição na newsletter de <strong>${config.site_name}</strong>.</p>
    <p>Clique no botão abaixo para confirmar seu e-mail e começar a receber os posts:</p>
    <div style="text-align:center;margin:2rem 0;">
      <a href="${confirmUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:0.75rem 2rem;border-radius:8px;font-weight:600;">
        Confirmar inscrição
      </a>
    </div>
    <p style="font-size:0.875rem;color:#71717a;">Se você não solicitou esta inscrição, pode ignorar este e-mail.</p>
  </div>
</div>
</body></html>`,
    }),
  });
}
