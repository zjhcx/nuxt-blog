import { nowIso, readBlogData, uid, writeBlogData } from '../../utils/blogStore'
import type { BlogComment } from '../../../app/types/blog'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<BlogComment>>(event)
  const targetType = body.targetType === 'page' ? 'page' : 'article'
  const targetId = String(body.targetId || '').trim()
  const authorName = String(body.authorName || '访客').trim().slice(0, 32)
  const content = String(body.content || '').trim()
  if (!targetId || !content) throw createError({ statusCode: 400, statusMessage: 'Comment target and content are required' })

  const data = await readBlogData()
  const exists = targetType === 'article'
    ? data.articles.some((item) => item.id === targetId)
    : data.pages.some((item) => item.id === targetId)
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'Comment target not found' })

  const comment: BlogComment = {
    id: uid(),
    targetType,
    targetId,
    authorName,
    content: content.slice(0, 4000),
    status: 'approved',
    createdAt: nowIso()
  }
  data.comments.unshift(comment)
  await writeBlogData(data)
  return comment
})
