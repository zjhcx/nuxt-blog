import { readBlogData, requireAdmin } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return readBlogData()
})
