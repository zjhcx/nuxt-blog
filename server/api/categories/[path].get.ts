import { publicArticle, readBlogData, sortArticles } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const path = decodeURIComponent(getRouterParam(event, 'path') || '')
  const data = await readBlogData()
  const category = data.categories.find((item) => item.path === path)
  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }
  return {
    category,
    articles: sortArticles(data.articles.filter((article) => publicArticle(article) && article.categoryPath === path))
  }
})
