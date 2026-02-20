import type { APIRoute } from 'astro';
import { deleteSession } from '../../lib/auth';

export const POST: APIRoute = async ({ cookies, locals, redirect }) => {
  const sessionId = cookies.get('session')?.value;
  if (sessionId && locals.runtime.env.DB) {
    await deleteSession(locals.runtime.env.DB, sessionId).catch(() => {});
  }
  cookies.delete('session', { path: '/' });
  return redirect('/', 302);
};
