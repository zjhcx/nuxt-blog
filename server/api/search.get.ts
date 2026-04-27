import { publicArticle, readBlogData, sortArticles } from '../utils/blogStore'

export default defineEventHandler(async (event) => {
  const keyword = String(getQuery(event).q || '').trim().toLowerCase()
  const data = await readBlogData()
  if (!keyword) return { articles: [], pages: [] }

  const includesKeyword = (fields: string[]) => fields.some((field) => field.toLowerCase().includes(keyword))
  return {
    articles: sortArticles(data.articles.filter((article) =>
      publicArticle(article) && includesKeyword([article.title, article.excerpt, article.content])
    )).slice(0, 12),
    pages: data.pages.filter((page) => !page.deletedAt && includesKeyword([page.title, page.content])).slice(0, 8)
  }
})
