import { readBlogData } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const path = decodeURIComponent(getRouterParam(event, 'path') || '')
  const data = await readBlogData()
  const page = data.pages.find((item) => item.path === path)
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }
  return page
})
