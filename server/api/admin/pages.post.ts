import { nowIso, readBlogData, requireAdmin, slugify, uid, upsertById, writeBlogData } from '../../utils/blogStore'
import type { BlogPage } from '../../../app/types/blog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Partial<BlogPage>>(event)
  const data = await readBlogData()
  const existing = body.id ? data.pages.find((item) => item.id === body.id) : null
  const title = String(body.title || existing?.title || '').trim()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  const page: BlogPage = {
    id: existing?.id || uid(),
    title,
    path: String(body.path || existing?.path || slugify(title)),
    content: String(body.content ?? existing?.content ?? ''),
    views: Number(body.views ?? existing?.views ?? 0),
    deletedAt: body.deletedAt || existing?.deletedAt || undefined,
    updatedAt: nowIso()
  }
  data.pages = upsertById(data.pages, page)
  await writeBlogData(data)
  return page
})
