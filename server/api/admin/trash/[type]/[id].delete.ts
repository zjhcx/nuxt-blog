import { readBlogData, requireAdmin, writeBlogData } from '../../../../utils/blogStore'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const type = getRouterParam(event, 'type')
  const id = getRouterParam(event, 'id') || ''
  const data = await readBlogData()

  if (type === 'article') {
    data.articles = data.articles.filter((item) => item.id !== id)
    data.comments = data.comments.filter((item) => !(item.targetType === 'article' && item.targetId === id))
  } else if (type === 'page') {
    data.pages = data.pages.filter((item) => item.id !== id)
    data.comments = data.comments.filter((item) => !(item.targetType === 'page' && item.targetId === id))
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported trash type' })
  }

  await writeBlogData(data)
  return { ok: true }
})
