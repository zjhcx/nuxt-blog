import { readBlogData, requireAdmin, writeBlogData } from '../../../utils/blogStore'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const data = await readBlogData()
  const removed = data.tags.find((item) => item.id === id)
  data.tags = data.tags.filter((item) => item.id !== id)
  if (removed) {
    data.articles = data.articles.map((article) => ({
      ...article,
      tagPaths: article.tagPaths.filter((path) => path !== removed.path)
    }))
  }
  await writeBlogData(data)
  return { ok: true }
})
