import { readBlogData, writeBlogData } from '../../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') || ''
  const data = await readBlogData()
  data.pages = data.pages.filter((item) => item.id !== id)
  await writeBlogData(data)
  return { ok: true }
})
