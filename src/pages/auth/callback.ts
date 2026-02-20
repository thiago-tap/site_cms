import type { APIRoute } from 'astro';
import { getGitHubOAuth, upsertUser, createSession } from '../../lib/auth';

export const GET: APIRoute = async ({ url, cookies, locals, redirect }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('github_oauth_state')?.value;

  if (!code || !state || state !== storedState) {
    return new Response('OAuth state inválido. Tente novamente.', { status: 400 });
  }

  const github = getGitHubOAuth(locals.runtime.env);
  const tokens = await github.validateAuthorizationCode(code);
  const accessToken = tokens.accessToken();

  const githubRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'CatitéoCMS' },
  });

  if (!githubRes.ok) return new Response('Falha ao buscar dados do GitHub', { status: 500 });

  const githubUser = (await githubRes.json()) as {
    id: number;
    login: string;
    avatar_url: string;
  };

  const user = await upsertUser(locals.runtime.env.DB, githubUser);
  const sessionId = await createSession(locals.runtime.env.DB, user.id);

  cookies.delete('github_oauth_state', { path: '/' });
  cookies.set('session', sessionId, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });

  return redirect('/admin', 302);
};
