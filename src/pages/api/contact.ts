import type { APIRoute } from 'astro';
import { getDb, contacts } from '../../lib/db';
import { generateId } from '../../lib/utils';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { name, email, subject, message } = await request.json() as {
      name: string; email: string; subject?: string; message: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json({ error: 'Nome, email e mensagem são obrigatórios.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Email inválido.' }, { status: 400 });
    }

    if (message.length > 5000) {
      return Response.json({ error: 'Mensagem muito longa.' }, { status: 400 });
    }

    const db = getDb(locals.runtime.env.DB);
    await db.insert(contacts).values({
      id: generateId(),
      name: name.trim().slice(0, 100),
      email: email.trim().slice(0, 200),
      subject: (subject?.trim() ?? '').slice(0, 200),
      message: message.trim().slice(0, 5000),
      createdAt: Math.floor(Date.now() / 1000),
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Erro interno.' }, { status: 500 });
  }
};
