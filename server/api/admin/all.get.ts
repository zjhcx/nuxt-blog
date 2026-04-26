import { readBlogData } from '../../utils/blogStore'

export default defineEventHandler(async () => {
  return readBlogData()
})
