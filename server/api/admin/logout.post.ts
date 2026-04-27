import { clearAdminSession } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  clearAdminSession(event)
  return { ok: true }
})
