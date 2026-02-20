import { GitHub, generateState } from 'arctic';
import { eq } from 'drizzle-orm';
import { getDb, users, sessions } from './db';
import type { D1Database } from '@cloudflare/workers-types';

export { generateState };

export function getGitHubOAuth(env: Env) {
  return new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, null);
}

function generateId(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
}

export async function createSession(d1: D1Database, userId: string): Promise<string> {
  const db = getDb(d1);
  const sessionId = generateId(40);
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  await db.insert(sessions).values({ id: sessionId, userId, expiresAt });
  return sessionId;
}

export async function validateSession(d1: D1Database, sessionId: string) {
  const db = getDb(d1);
  const result = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .get();

  if (!result) return null;

  const now = Math.floor(Date.now() / 1000);
  if (result.session.expiresAt < now) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  return result.user;
}

export async function deleteSession(d1: D1Database, sessionId: string) {
  const db = getDb(d1);
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function upsertUser(
  d1: D1Database,
  githubUser: { id: number; login: string; avatar_url: string }
) {
  const db = getDb(d1);
  const existing = await db.select().from(users).where(eq(users.githubId, githubUser.id)).get();

  const data = { username: githubUser.login, avatarUrl: githubUser.avatar_url };

  if (existing) {
    await db.update(users).set(data).where(eq(users.githubId, githubUser.id));
    return { ...existing, ...data };
  }

  const newUser = {
    id: generateId(16),
    githubId: githubUser.id,
    ...data,
    createdAt: Math.floor(Date.now() / 1000),
  };
  await db.insert(users).values(newUser);
  return newUser;
}
