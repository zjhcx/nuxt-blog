import { readBlogData, requireAdmin, writeBlogData } from '../../utils/blogStore'
import type { BlogSettings } from '../../../app/types/blog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Partial<BlogSettings>>(event)
  const data = await readBlogData()
  data.settings = {
    ...data.settings,
    title: String(body.title ?? data.settings.title),
    subtitle: String(body.subtitle ?? data.settings.subtitle),
    backgroundImage: String(body.backgroundImage ?? data.settings.backgroundImage),
    heroBackgroundImage: String(body.heroBackgroundImage ?? data.settings.heroBackgroundImage ?? ''),
    backgroundOverlay: Number(body.backgroundOverlay ?? data.settings.backgroundOverlay),
    glassOpacity: Number(body.glassOpacity ?? data.settings.glassOpacity)
  }
  await writeBlogData(data)
  return data.settings
})
