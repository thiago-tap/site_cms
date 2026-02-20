import type { D1Database } from '@cloudflare/workers-types';
import { getDb, postEmbeddings, posts } from './db';
import { eq } from 'drizzle-orm';
import { parseTags } from './utils';

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  tags: string;
  excerpt: string | null;
  series: string | null;
  seriesOrder: number | null;
  views: number;
  publishedAt: number | null;
  coverImage: string | null;
  readingTime: number;
  status: string;
}

export async function getRelatedPosts(
  d1: D1Database,
  currentPostId: string,
  allPublished: Post[],
  limit = 3
): Promise<Post[]> {
  const db = getDb(d1);
  const others = allPublished.filter((p) => p.id !== currentPostId);
  if (others.length === 0) return [];

  try {
    // Fetch embedding for current post
    const currentEmb = await db
      .select({ embedding: postEmbeddings.embedding })
      .from(postEmbeddings)
      .where(eq(postEmbeddings.postId, currentPostId))
      .get();

    if (!currentEmb) {
      // No embedding — fallback to tag similarity
      return tagFallback(currentPostId, allPublished, others, limit);
    }

    const currentVec: number[] = JSON.parse(currentEmb.embedding);

    // Fetch embeddings for all other published posts
    const otherIds = others.map((p) => p.id);
    const embRows = await db
      .select({ postId: postEmbeddings.postId, embedding: postEmbeddings.embedding })
      .from(postEmbeddings)
      .all();

    const embMap = new Map<string, number[]>();
    for (const row of embRows) {
      if (otherIds.includes(row.postId)) {
        embMap.set(row.postId, JSON.parse(row.embedding));
      }
    }

    if (embMap.size === 0) {
      return tagFallback(currentPostId, allPublished, others, limit);
    }

    // Score by cosine similarity
    const scored = others
      .filter((p) => embMap.has(p.id))
      .map((p) => ({ post: p, score: cosineSimilarity(currentVec, embMap.get(p.id)!) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ post }) => post);

    // If not enough from embeddings, fill with tag fallback
    if (scored.length < limit) {
      const used = new Set(scored.map((p) => p.id));
      const fill = tagFallback(currentPostId, allPublished, others.filter((p) => !used.has(p.id)), limit - scored.length);
      return [...scored, ...fill];
    }

    return scored;
  } catch {
    return tagFallback(currentPostId, allPublished, others, limit);
  }
}

function tagFallback(currentId: string, allPosts: Post[], candidates: Post[], limit: number): Post[] {
  const current = allPosts.find((p) => p.id === currentId);
  const currentTags = current ? parseTags(current.tags) : [];

  return candidates
    .map((p) => ({ post: p, score: parseTags(p.tags).filter((t) => currentTags.includes(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
}
