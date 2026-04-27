import { readBlogData, requireAdmin, writeBlogData } from '../../../../utils/blogStore'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const type = getRouterParam(event, 'type')
  const id = getRouterParam(event, 'id') || ''
  const data = await readBlogData()

  if (type === 'article') {
    data.articles = data.articles.map((item) => item.id === id ? { ...item, deletedAt: undefined } : item)
  } else if (type === 'page') {
    data.pages = data.pages.map((item) => item.id === id ? { ...item, deletedAt: undefined } : item)
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported trash type' })
  }

  await writeBlogData(data)
  return { ok: true }
})
