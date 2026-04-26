import { readBlogData } from '../utils/blogStore'

export default defineEventHandler(async () => {
  const data = await readBlogData()
  return data.navItems
    .filter((item) => item.visible)
    .sort((a, b) => a.sort - b.sort)
})
