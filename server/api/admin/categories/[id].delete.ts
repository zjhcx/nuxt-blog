import { readBlogData, writeBlogData } from '../../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') || ''
  const data = await readBlogData()
  const removed = data.categories.find((item) => item.id === id)
  data.categories = data.categories.filter((item) => item.id !== id)
  if (removed) {
    data.articles = data.articles.map((article) =>
      article.categoryPath === removed.path ? { ...article, categoryPath: '' } : article
    )
  }
  await writeBlogData(data)
  return { ok: true }
})
