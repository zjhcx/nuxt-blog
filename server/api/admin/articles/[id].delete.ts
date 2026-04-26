import { readBlogData, writeBlogData } from '../../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') || ''
  const data = await readBlogData()
  data.articles = data.articles.filter((item) => item.id !== id)
  await writeBlogData(data)
  return { ok: true }
})
