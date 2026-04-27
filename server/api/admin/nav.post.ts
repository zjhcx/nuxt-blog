import { readBlogData, requireAdmin, uid, upsertById, writeBlogData } from '../../utils/blogStore'
import type { BlogNavItem } from '../../../app/types/blog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Partial<BlogNavItem>>(event)
  const data = await readBlogData()
  const existing = body.id ? data.navItems.find((item) => item.id === body.id) : null
  const label = String(body.label || existing?.label || '').trim()
  const href = String(body.href || existing?.href || '').trim()
  if (!label || !href) throw createError({ statusCode: 400, statusMessage: 'Label and href are required' })
  const item: BlogNavItem = {
    id: existing?.id || uid(),
    label,
    href,
    sort: Number(body.sort ?? existing?.sort ?? data.navItems.length + 1),
    visible: Boolean(body.visible ?? existing?.visible ?? true)
  }
  data.navItems = upsertById(data.navItems, item)
  await writeBlogData(data)
  return item
})
