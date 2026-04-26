import { publicArticle, readBlogData } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const path = decodeURIComponent(getRouterParam(event, 'path') || '')
  const data = await readBlogData()
  const article = data.articles.find((item) => item.path === path && publicArticle(item))
  if (!article) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  }
  return {
    article,
    category: data.categories.find((item) => item.path === article.categoryPath) || null,
    tags: data.tags.filter((tag) => article.tagPaths.includes(tag.path))
  }
})
