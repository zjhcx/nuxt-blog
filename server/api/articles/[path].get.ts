import { publicArticle, readBlogData, writeBlogData } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const path = decodeURIComponent(getRouterParam(event, 'path') || '')
  const data = await readBlogData()
  const article = data.articles.find((item) => item.path === path && publicArticle(item))
  if (!article) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  }
  article.views = Number(article.views || 0) + 1
  await writeBlogData(data)
  return {
    article,
    category: data.categories.find((item) => item.path === article.categoryPath) || null,
    tags: data.tags.filter((tag) => article.tagPaths.includes(tag.path))
  }
})
