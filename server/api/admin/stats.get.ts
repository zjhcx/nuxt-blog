import { notDeleted, readBlogData, requireAdmin } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await readBlogData()
  const articles = data.articles.filter(notDeleted)
  const pages = data.pages.filter(notDeleted)
  return {
    articles: articles.length,
    pages: pages.length,
    comments: data.comments.length,
    users: data.users.length,
    views: [...articles, ...pages].reduce((sum, item) => sum + Number(item.views || 0), 0)
  }
})
