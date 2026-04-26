const allowedProtocols = new Set(['http:', 'https:'])

export default defineEventHandler((event) => {
  const raw = String(getQuery(event).to || '')
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid link' })
  }

  if (!allowedProtocols.has(url.protocol)) {
    throw createError({ statusCode: 400, statusMessage: 'Unsafe protocol' })
  }

  return {
    href: url.toString(),
    host: url.host
  }
})
