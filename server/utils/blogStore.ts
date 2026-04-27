import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import type { BlogArticle, BlogCategory, BlogData, BlogNavItem, BlogPage, BlogSettings, BlogTag, BlogUser } from '../../app/types/blog'

const KEY = 'blog:blog.json'
const SQLITE_KEY = 'blog'
const SESSION_COOKIE = 'nuxt_blog_admin'
export const BLOG_SQL = {
  createKv: 'CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
  selectKv: 'SELECT value FROM kv WHERE key = ?',
  upsertKv: 'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
}

type D1DatabaseLike = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      first: <T = unknown>() => Promise<T | null>
      run: () => Promise<unknown>
    }
    first: <T = unknown>() => Promise<T | null>
    run: () => Promise<unknown>
  }
  exec?: (query: string) => Promise<unknown>
}

export const hashPassword = (value: string) => createHash('sha256').update(value).digest('hex')

const defaultAdmin = (): BlogUser => ({
  id: 'admin',
  username: 'admin',
  displayName: 'Administrator',
  passwordHash: hashPassword('admin123'),
  role: 'admin',
  createdAt: '2026-04-26T00:00:00.000Z'
})

const defaultData = (): BlogData => ({
  settings: {
    title: 'Nuxt Blog',
    subtitle: 'SSR, glass navigation, real content management.',
    backgroundImage: '',
    heroBackgroundImage: '',
    backgroundOverlay: 0.54,
    glassOpacity: 0.68
  },
  categories: [],
  tags: [],
  navItems: [
    { id: 'home', label: '首页', href: '/', sort: 1, visible: true },
    { id: 'about', label: '关于', href: '/a/about', sort: 2, visible: true },
    { id: 'links', label: '链接', href: '/a/links', sort: 3, visible: true }
  ],
  articles: [],
  pages: [],
  comments: [],
  users: [defaultAdmin()]
})

export const nowIso = () => new Date().toISOString()
export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`

export const slugify = (input: string) =>
  encodeURIComponent(
    input
      .trim()
      .toLowerCase()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
      .replace(/^-+|-+$/g, '') || uid()
  )

const storageMode = () => (process.env.BLOG_STORAGE || process.env.NUXT_BLOG_STORAGE || 'json').toLowerCase()
const d1BindingName = () => process.env.BLOG_D1_BINDING || process.env.NUXT_BLOG_D1_BINDING || 'DB'

const getRequestEvent = () => {
  try {
    return typeof useRequestEvent === 'function' ? useRequestEvent() : undefined
  } catch {
    return undefined
  }
}

const getD1Binding = (event?: H3Event) => {
  const currentEvent = event || getRequestEvent()
  const context = (currentEvent?.context || {}) as any
  const env = context.cloudflare?.env || context.env || (globalThis as any).__env__ || {}
  return env[d1BindingName()] as D1DatabaseLike | undefined
}

async function openSqlite() {
  const [{ dirname, resolve }, { mkdirSync }, { DatabaseSync }] = await Promise.all([
    import('node:path'),
    import('node:fs'),
    import('node:sqlite')
  ])
  const file = resolve(process.env.BLOG_SQLITE_PATH || process.env.NUXT_BLOG_SQLITE_PATH || 'data/blog.sqlite')
  mkdirSync(dirname(file), { recursive: true })
  return new DatabaseSync(file)
}

async function readRawData(event?: H3Event) {
  const mode = storageMode()
  if (mode === 'd1') {
    const db = getD1Binding(event)
    if (!db) throw createError({ statusCode: 500, statusMessage: `D1 binding "${d1BindingName()}" is not available` })
    if (db.exec) await db.exec(BLOG_SQL.createKv)
    else await db.prepare(BLOG_SQL.createKv).run()
    const row = await db.prepare(BLOG_SQL.selectKv).bind(SQLITE_KEY).first<{ value?: string }>()
    return row?.value ? JSON.parse(row.value) as BlogData : null
  }

  if (mode !== 'sqlite') {
    return useStorage('blog').getItem<BlogData>(KEY)
  }

  const db = await openSqlite()
  try {
    db.exec(BLOG_SQL.createKv)
    const row = db.prepare(BLOG_SQL.selectKv).get(SQLITE_KEY) as { value?: string } | undefined
    return row?.value ? JSON.parse(row.value) as BlogData : null
  } finally {
    db.close()
  }
}

async function writeRawData(data: BlogData, event?: H3Event) {
  const mode = storageMode()
  if (mode === 'd1') {
    const db = getD1Binding(event)
    if (!db) throw createError({ statusCode: 500, statusMessage: `D1 binding "${d1BindingName()}" is not available` })
    if (db.exec) await db.exec(BLOG_SQL.createKv)
    else await db.prepare(BLOG_SQL.createKv).run()
    await db.prepare(BLOG_SQL.upsertKv).bind(SQLITE_KEY, JSON.stringify(data)).run()
    return
  }

  if (mode !== 'sqlite') {
    await useStorage('blog').setItem(KEY, data)
    return
  }

  const db = await openSqlite()
  try {
    db.exec(BLOG_SQL.createKv)
    db.prepare(BLOG_SQL.upsertKv).run(SQLITE_KEY, JSON.stringify(data))
  } finally {
    db.close()
  }
}

export async function readBlogData(event?: H3Event): Promise<BlogData> {
  const existing = await readRawData(event)
  if (existing) {
    const base = defaultData()
    const next: BlogData = {
      ...defaultData(),
      ...existing,
      settings: { ...base.settings, ...existing.settings },
      categories: existing.categories || [],
      tags: existing.tags || [],
      navItems: existing.navItems || [],
      articles: (existing.articles || []).map((article) => ({ ...article, views: Number(article.views || 0), deletedAt: article.deletedAt || undefined })),
      pages: (existing.pages || []).map((page) => ({ ...page, views: Number(page.views || 0), deletedAt: page.deletedAt || undefined })),
      comments: existing.comments || [],
      users: existing.users?.length ? existing.users : base.users
    }
    return next
  }

  const initial = defaultData()
  await writeRawData(initial, event)
  return initial
}

export async function writeBlogData(data: BlogData, event?: H3Event) {
  await writeRawData(data, event)
  return data
}

export const publicArticle = (article: BlogArticle) => article.status === 'published' && !article.deletedAt
export const notDeleted = <T extends { deletedAt?: string }>(item: T) => !item.deletedAt

export const sortArticles = (articles: BlogArticle[]) =>
  [...articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

export function upsertById<T extends { id: string }>(items: T[], value: T) {
  const index = items.findIndex((item) => item.id === value.id)
  if (index === -1) return [...items, value]
  const next = [...items]
  next[index] = value
  return next
}

export type AdminPayload = Partial<BlogArticle & BlogCategory & BlogTag & BlogNavItem & BlogPage & BlogSettings>

export const createSessionToken = (user: BlogUser) =>
  `${user.id}.${hashPassword(`${user.id}:${user.passwordHash}:nuxt-blog-session`)}`

export const publicUser = (user: BlogUser) => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  role: user.role,
  createdAt: user.createdAt
})

export async function getAdminUser(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null
  const data = await readBlogData(event)
  const user = data.users.find((item) => createSessionToken(item) === token)
  return user || null
}

export async function requireAdmin(event: H3Event) {
  const user = await getAdminUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Admin login required' })
  }
  return user
}

export function setAdminSession(event: H3Event, user: BlogUser) {
  setCookie(event, SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14
  })
}

export function clearAdminSession(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
