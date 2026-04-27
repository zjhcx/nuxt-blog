import { readBlogData, writeBlogData } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const path = decodeURIComponent(getRouterParam(event, 'path') || '')
  const data = await readBlogData()
  const page = data.pages.find((item) => item.path === path && !item.deletedAt)
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }
  page.views = Number(page.views || 0) + 1
  await writeBlogData(data)
  return page
})
