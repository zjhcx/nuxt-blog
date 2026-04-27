import { readBlogData, requireAdmin, slugify, uid, upsertById, writeBlogData } from '../../utils/blogStore'
import type { BlogCategory } from '../../../app/types/blog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Partial<BlogCategory>>(event)
  const data = await readBlogData()
  const existing = body.id ? data.categories.find((item) => item.id === body.id) : null
  const name = String(body.name || existing?.name || '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  const category: BlogCategory = {
    id: existing?.id || uid(),
    name,
    path: String(body.path || existing?.path || slugify(name)),
    description: String(body.description ?? existing?.description ?? '')
  }
  data.categories = upsertById(data.categories, category)
  await writeBlogData(data)
  return category
})
