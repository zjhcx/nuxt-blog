import { readBlogData, requireAdmin, writeBlogData } from '../../../utils/blogStore'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const data = await readBlogData()
  data.comments = data.comments.filter((item) => item.id !== id)
  await writeBlogData(data)
  return { ok: true }
})
