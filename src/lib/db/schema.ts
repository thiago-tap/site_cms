import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const pages = sqliteTable('pages', {
  slug: text('slug').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull().default(''),
  message: text('message').notNull(),
  createdAt: integer('created_at').notNull(),
  read: integer('read').notNull().default(0),
});

export const subscribers = sqliteTable('subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull().default(''),
  createdAt: integer('created_at').notNull(),
  active: integer('active').notNull().default(1),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  githubId: integer('github_id').notNull().unique(),
  username: text('username').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
});

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),       // Markdown
  excerpt: text('excerpt'),                  // Short description
  coverImage: text('cover_image'),
  tags: text('tags').notNull().default('[]'), // JSON array
  status: text('status').notNull().default('draft'), // draft | published
  aiSummary: text('ai_summary'),             // AI-generated summary
  metaDescription: text('meta_description'), // SEO meta description
  readingTime: integer('reading_time').notNull().default(1), // minutes
  views: integer('views').notNull().default(0),
  publishedAt: integer('published_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
