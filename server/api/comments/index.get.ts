import { readBlogData } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetType = String(query.targetType || '')
  const targetId = String(query.targetId || '')
  if (!targetId || !['article', 'page'].includes(targetType)) return []

  const data = await readBlogData()
  return data.comments
    .filter((item) => item.targetType === targetType && item.targetId === targetId && item.status === 'approved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})
