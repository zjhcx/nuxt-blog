import { publicArticle, readBlogData, sortArticles } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const path = decodeURIComponent(getRouterParam(event, 'path') || '')
  const data = await readBlogData()
  const tag = data.tags.find((item) => item.path === path)
  if (!tag) {
    throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
  }
  return {
    tag,
    articles: sortArticles(data.articles.filter((article) => publicArticle(article) && article.tagPaths.includes(path)))
  }
})
