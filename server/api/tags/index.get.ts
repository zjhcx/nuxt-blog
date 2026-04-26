import { readBlogData } from '../../utils/blogStore'

export default defineEventHandler(async () => {
  const data = await readBlogData()
  return data.tags
})
