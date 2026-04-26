import type { BlogArticle, BlogCategory, BlogData, BlogNavItem, BlogPage, BlogSettings, BlogTag } from '../../app/types/blog'

const KEY = 'blog:blog.json'

const defaultData = (): BlogData => ({
  settings: {
    title: 'Nuxt Blog',
    subtitle: 'SSR, glass navigation, real content management.',
    backgroundImage: '',
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
  pages: []
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

export async function readBlogData(): Promise<BlogData> {
  const storage = useStorage('blog')
  const existing = await storage.getItem<BlogData>(KEY)
  if (existing) {
    return {
      ...defaultData(),
      ...existing,
      settings: { ...defaultData().settings, ...existing.settings },
      categories: existing.categories || [],
      tags: existing.tags || [],
      navItems: existing.navItems || [],
      articles: existing.articles || [],
      pages: existing.pages || []
    }
  }

  const initial = defaultData()
  await storage.setItem(KEY, initial)
  return initial
}

export async function writeBlogData(data: BlogData) {
  await useStorage('blog').setItem(KEY, data)
  return data
}

export const publicArticle = (article: BlogArticle) => article.status === 'published'

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
