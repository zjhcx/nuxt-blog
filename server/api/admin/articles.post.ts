import { nowIso, readBlogData, slugify, uid, upsertById, writeBlogData } from '../../utils/blogStore'
import type { BlogArticle } from '../../../app/types/blog'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<BlogArticle>>(event)
  const data = await readBlogData()
  const existing = body.id ? data.articles.find((item) => item.id === body.id) : null
  const title = String(body.title || existing?.title || '').trim()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  const date = nowIso()
  const article: BlogArticle = {
    id: existing?.id || uid(),
    title,
    path: String(body.path || existing?.path || slugify(title)),
    excerpt: String(body.excerpt ?? existing?.excerpt ?? ''),
    content: String(body.content ?? existing?.content ?? ''),
    cover: String(body.cover ?? existing?.cover ?? ''),
    categoryPath: String(body.categoryPath ?? existing?.categoryPath ?? ''),
    tagPaths: Array.isArray(body.tagPaths) ? body.tagPaths.map(String) : existing?.tagPaths || [],
    status: body.status === 'draft' ? 'draft' : 'published',
    publishedAt: String(body.publishedAt || existing?.publishedAt || date),
    updatedAt: date
  }
  data.articles = upsertById(data.articles, article)
  await writeBlogData(data)
  return article
})
