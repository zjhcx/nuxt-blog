import { readBlogData, slugify, uid, upsertById, writeBlogData } from '../../utils/blogStore'
import type { BlogTag } from '../../../app/types/blog'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<BlogTag>>(event)
  const data = await readBlogData()
  const existing = body.id ? data.tags.find((item) => item.id === body.id) : null
  const name = String(body.name || existing?.name || '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  const tag: BlogTag = {
    id: existing?.id || uid(),
    name,
    path: String(body.path || existing?.path || slugify(name)),
    description: String(body.description ?? existing?.description ?? '')
  }
  data.tags = upsertById(data.tags, tag)
  await writeBlogData(data)
  return tag
})
