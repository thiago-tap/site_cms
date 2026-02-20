import type { APIRoute } from 'astro';
import { getGitHubOAuth, generateState } from '../../lib/auth';

export const GET: APIRoute = async ({ locals, cookies, redirect }) => {
  const github = getGitHubOAuth(locals.runtime.env);
  const state = generateState();
  const url = github.createAuthorizationURL(state, []);

  cookies.set('github_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10,
  });

  return redirect(url.toString(), 302);
};
