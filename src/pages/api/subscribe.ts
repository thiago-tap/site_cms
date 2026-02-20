import type { APIRoute } from 'astro';
import { getDb, subscribers } from '../../lib/db';
import { eq } from 'drizzle-orm';
import { generateId } from '../../lib/utils';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, name } = await request.json() as { email: string; name?: string };

    if (!email?.trim()) {
      return Response.json({ error: 'Email é obrigatório.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Email inválido.' }, { status: 400 });
    }

    const db = getDb(locals.runtime.env.DB);
    const existing = await db.select().from(subscribers).where(eq(subscribers.email, email.toLowerCase())).get();

    if (existing) {
      if (existing.active) {
        return Response.json({ error: 'Este email já está inscrito.' }, { status: 409 });
      }
      // Reactivate
      await db.update(subscribers).set({ active: 1, name: name?.trim() ?? existing.name }).where(eq(subscribers.id, existing.id));
      return Response.json({ ok: true });
    }

    await db.insert(subscribers).values({
      id: generateId(),
      email: email.toLowerCase().trim(),
      name: name?.trim() ?? '',
      createdAt: Math.floor(Date.now() / 1000),
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Erro interno.' }, { status: 500 });
  }
};
