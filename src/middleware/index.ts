import { defineMiddleware } from 'astro:middleware';
import { validateSession } from '../lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const sessionId = context.cookies.get('session')?.value;
  const db = context.locals.runtime?.env?.DB;

  if (sessionId && db) {
    const user = await validateSession(db, sessionId).catch(() => null);
    context.locals.user = user
      ? { id: user.id, username: user.username, avatarUrl: user.avatarUrl }
      : null;
  } else {
    context.locals.user = null;
  }

  // Protect all /admin routes
  if (context.url.pathname.startsWith('/admin') && !context.locals.user) {
    return context.redirect('/auth/github');
  }

  return next();
});
