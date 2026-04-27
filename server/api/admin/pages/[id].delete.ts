import { nowIso, readBlogData, requireAdmin, writeBlogData } from '../../../utils/blogStore'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const data = await readBlogData()
  data.pages = data.pages.map((item) => item.id === id ? { ...item, deletedAt: nowIso() } : item)
  await writeBlogData(data)
  return { ok: true }
})
