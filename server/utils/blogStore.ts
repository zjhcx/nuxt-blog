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

const rightRotate = (value: number, amount: number) => (value >>> amount) | (value << (32 - amount))

export const hashPassword = (value: string) => {
  const bytes = Array.from(new TextEncoder().encode(value))
  const bitLength = bytes.length * 8
  bytes.push(0x80)
  while (bytes.length % 64 !== 56) bytes.push(0)
  for (let i = 7; i >= 0; i--) bytes.push(Math.floor(bitLength / 2 ** (i * 8)) & 0xff)

  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ]
  const constants = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = new Array<number>(64).fill(0)
    for (let i = 0; i < 16; i++) {
      words[i] =
        (bytes[offset + i * 4] << 24) |
        (bytes[offset + i * 4 + 1] << 16) |
        (bytes[offset + i * 4 + 2] << 8) |
        bytes[offset + i * 4 + 3]
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(words[i - 15], 7) ^ rightRotate(words[i - 15], 18) ^ (words[i - 15] >>> 3)
      const s1 = rightRotate(words[i - 2], 17) ^ rightRotate(words[i - 2], 19) ^ (words[i - 2] >>> 10)
      words[i] = (words[i - 16] + s0 + words[i - 7] + s1) >>> 0
    }

    let [a, b, c, d, e, f, g, h] = hash
    for (let i = 0; i < 64; i++) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (h + s1 + ch + constants[i] + words[i]) >>> 0
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (s0 + maj) >>> 0
      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    hash[0] = (hash[0] + a) >>> 0
    hash[1] = (hash[1] + b) >>> 0
    hash[2] = (hash[2] + c) >>> 0
    hash[3] = (hash[3] + d) >>> 0
    hash[4] = (hash[4] + e) >>> 0
    hash[5] = (hash[5] + f) >>> 0
    hash[6] = (hash[6] + g) >>> 0
    hash[7] = (hash[7] + h) >>> 0
  }

  return hash.map((part) => part.toString(16).padStart(8, '0')).join('')
}

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
