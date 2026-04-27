import { publicArticle, readBlogData, sortArticles } from '../utils/blogStore'

export default defineEventHandler(async () => {
  const data = await readBlogData()
  const articles = sortArticles(data.articles.filter(publicArticle))

  return {
    articles: articles.slice(0, 8).map((article) => ({
      ...article,
      commentCount: data.comments.filter((comment) => comment.targetType === 'article' && comment.targetId === article.id).length
    })),
    totalArticles: articles.length,
    totalComments: data.comments.length,
    totalUsers: data.users.length,
    totalViews: [...articles, ...data.pages.filter((page) => !page.deletedAt)].reduce((sum, item) => sum + Number(item.views || 0), 0),
    categories: data.categories.map((category) => ({
      ...category,
      count: articles.filter((article) => article.categoryPath === category.path).length
    })),
    tags: data.tags.map((tag) => ({
      ...tag,
      count: articles.filter((article) => article.tagPaths.includes(tag.path)).length
    }))
  }
})
