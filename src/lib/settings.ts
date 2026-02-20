import { getDb, settings } from './db';
import type { D1Database } from '@cloudflare/workers-types';

export type SiteSettings = {
  site_name: string;
  site_description: string;
  accent_color: string;
  author_name: string;
  author_bio: string;
  author_avatar: string;
  social_github: string;
  social_twitter: string;
  social_linkedin: string;
  social_instagram: string;
  logo_url: string;
  giscus_repo: string;
  giscus_repo_id: string;
  giscus_category: string;
  giscus_category_id: string;
  newsletter_enabled: string;
  ga_id: string;
  fb_pixel_id: string;
  custom_head_tags: string;
  double_optin_enabled: string;
};

export const defaultSettings: SiteSettings = {
  site_name: 'Blog do Thiago',
  site_description: 'Blog sobre desenvolvimento web, cloud e tecnologia.',
  accent_color: '#6366f1',
  author_name: '',
  author_bio: '',
  author_avatar: '',
  social_github: '',
  social_twitter: '',
  social_linkedin: '',
  social_instagram: '',
  logo_url: '',
  giscus_repo: '',
  giscus_repo_id: '',
  giscus_category: '',
  giscus_category_id: '',
  newsletter_enabled: '1',
  ga_id: '',
  fb_pixel_id: '',
  custom_head_tags: '',
  double_optin_enabled: '0',
};

export async function getSettings(d1: D1Database): Promise<SiteSettings> {
  try {
    const db = getDb(d1);
    const rows = await db.select().from(settings).all();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...defaultSettings, ...map } as SiteSettings;
  } catch {
    return { ...defaultSettings };
  }
}

export async function setSetting(d1: D1Database, key: string, value: string): Promise<void> {
  const db = getDb(d1);
  const now = Math.floor(Date.now() / 1000);
  await db
    .insert(settings)
    .values({ key, value, updatedAt: now })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: now } });
}

export async function saveSettings(d1: D1Database, data: Partial<SiteSettings>): Promise<void> {
  await Promise.all(
    Object.entries(data).map(([key, value]) => setSetting(d1, key, value ?? ''))
  );
}

export function accentToTailwind(hex: string): string {
  // Returns inline style string for CSS custom property
  return `--accent: ${hex};`;
}
