type MarkdownOptions = {
  allowHtml?: boolean
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const renderInline = (value: string, allowHtml = false) => {
  let text = allowHtml ? value : escapeHtml(value)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>')
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>')
  text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  return text
}

const isHtmlBlock = (line: string) => /^<\/?[a-z][\w:-]*(\s[^>]*)?>/i.test(line.trim())

const flushList = (html: string[], list: string[], ordered: boolean, allowHtml: boolean) => {
  if (!list.length) return
  html.push(`<${ordered ? 'ol' : 'ul'}>${list.map((item) => `<li>${renderInline(item, allowHtml)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`)
  list.length = 0
}

export function renderMarkdown(source = '', options: MarkdownOptions = {}) {
  const allowHtml = Boolean(options.allowHtml)
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const html: string[] = []
  const list: string[] = []
  let orderedList = false
  let paragraph: string[] = []
  let codeBlock: string[] | null = null

  const flushParagraph = () => {
    if (!paragraph.length) return
    html.push(`<p>${renderInline(paragraph.join(' '), allowHtml)}</p>`)
    paragraph = []
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      if (codeBlock) {
        html.push(`<pre><code>${escapeHtml(codeBlock.join('\n'))}</code></pre>`)
        codeBlock = null
      } else {
        flushParagraph()
        flushList(html, list, orderedList, allowHtml)
        codeBlock = []
      }
      continue
    }

    if (codeBlock) {
      codeBlock.push(line)
      continue
    }

    if (!trimmed) {
      flushParagraph()
      flushList(html, list, orderedList, allowHtml)
      continue
    }

    if (allowHtml && isHtmlBlock(trimmed)) {
      flushParagraph()
      flushList(html, list, orderedList, allowHtml)
      html.push(trimmed)
      continue
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed)
    if (heading) {
      flushParagraph()
      flushList(html, list, orderedList, allowHtml)
      const level = heading[1].length
      html.push(`<h${level}>${renderInline(heading[2], allowHtml)}</h${level}>`)
      continue
    }

    if (/^---+$/.test(trimmed)) {
      flushParagraph()
      flushList(html, list, orderedList, allowHtml)
      html.push('<hr>')
      continue
    }

    if (trimmed.startsWith('> ')) {
      flushParagraph()
      flushList(html, list, orderedList, allowHtml)
      html.push(`<blockquote>${renderInline(trimmed.slice(2), allowHtml)}</blockquote>`)
      continue
    }

    const unordered = /^[-*+]\s+(.+)$/.exec(trimmed)
    const ordered = /^\d+\.\s+(.+)$/.exec(trimmed)
    if (unordered || ordered) {
      flushParagraph()
      const isOrdered = Boolean(ordered)
      if (list.length && orderedList !== isOrdered) flushList(html, list, orderedList, allowHtml)
      orderedList = isOrdered
      list.push((unordered || ordered)![1])
      continue
    }

    paragraph.push(trimmed)
  }

  if (codeBlock) html.push(`<pre><code>${escapeHtml(codeBlock.join('\n'))}</code></pre>`)
  flushParagraph()
  flushList(html, list, orderedList, allowHtml)
  return html.join('\n')
}

export function stripMarkdown(source = '') {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~\-[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
