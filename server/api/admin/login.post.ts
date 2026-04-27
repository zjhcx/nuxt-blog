import { hashPassword, publicUser, readBlogData, setAdminSession } from '../../utils/blogStore'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = String(body.username || '').trim()
  const passwordHash = hashPassword(String(body.password || ''))
  const data = await readBlogData()
  const user = data.users.find((item) => item.username === username && item.passwordHash === passwordHash)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误' })
  }
  setAdminSession(event, user)
  return { user: publicUser(user) }
})
