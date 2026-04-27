import { getAdminUser, publicUser } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const user = await getAdminUser(event)
  return { user: user ? publicUser(user) : null }
})
