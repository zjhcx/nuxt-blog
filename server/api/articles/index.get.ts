import { publicArticle, readBlogData, sortArticles } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(Number(query.page || 1), 1)
  const pageSize = Math.min(Math.max(Number(query.pageSize || 8), 1), 24)
  const category = String(query.category || '')
  const tag = String(query.tag || '')
  const keyword = String(query.q || '').trim().toLowerCase()
  const data = await readBlogData()

  let articles = data.articles.filter(publicArticle)
  if (category) articles = articles.filter((article) => article.categoryPath === category)
  if (tag) articles = articles.filter((article) => article.tagPaths.includes(tag))
  if (keyword) {
    articles = articles.filter((article) =>
      [article.title, article.excerpt, article.content].some((field) => field.toLowerCase().includes(keyword))
    )
  }

  const sorted = sortArticles(articles)
  const start = (page - 1) * pageSize
  return {
    page,
    pageSize,
    total: sorted.length,
    items: sorted.slice(start, start + pageSize)
  }
})
