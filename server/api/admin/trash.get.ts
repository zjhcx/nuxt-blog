import { readBlogData, requireAdmin } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await readBlogData()
  return {
    articles: data.articles.filter((item) => item.deletedAt),
    pages: data.pages.filter((item) => item.deletedAt)
  }
})
