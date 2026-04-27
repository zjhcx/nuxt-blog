<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  height?: number
  allowHtml?: boolean
}>(), {
  modelValue: '',
  placeholder: '输入 Markdown',
  height: 360,
  allowHtml: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const id = `editor-md-${Math.random().toString(36).slice(2)}`
const ready = ref(false)
let editor: any = null
let syncing = false

const loadStyle = (href: string) => {
  if (document.querySelector(`link[href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
  if (existing) {
    existing.addEventListener('load', () => resolve(), { once: true })
    if ((existing as any).dataset.loaded) resolve()
    return
  }
  const script = document.createElement('script')
  script.src = src
  script.async = true
  script.onload = () => {
    script.dataset.loaded = 'true'
    resolve()
  }
  script.onerror = () => reject(new Error(`Failed to load ${src}`))
  document.body.appendChild(script)
})

onMounted(async () => {
  const base = '/vendor/editormd'
  loadStyle(`${base}/css/editormd.min.css`)
  if (!(window as any).jQuery) {
    await loadScript('/vendor/jquery/jquery.min.js')
  }
  if (!(window as any).editormd) {
    await loadScript(`${base}/editormd.min.js`)
  }

  const editormd = (window as any).editormd
  editor = editormd(id, {
    width: '100%',
    height: props.height,
    path: `${base}/lib/`,
    markdown: props.modelValue || '',
    placeholder: props.placeholder,
    watch: false,
    saveHTMLToTextarea: false,
    htmlDecode: props.allowHtml,
    toolbarIcons: () => [
      'undo', 'redo', '|',
      'bold', 'italic', 'quote', 'uppercase', 'lowercase', '|',
      'h1', 'h2', 'h3', 'list-ul', 'list-ol', 'hr', '|',
      'link', 'reference-link', 'image', 'code', 'preformatted-text', 'code-block', 'table', '|',
      'watch', 'preview', 'fullscreen'
    ],
    onchange() {
      syncing = true
      emit('update:modelValue', editor?.getMarkdown?.() || '')
      nextTick(() => { syncing = false })
    }
  })
  ready.value = true
})

watch(() => props.modelValue, (value) => {
  if (!editor || syncing) return
  if (editor.getMarkdown?.() !== (value || '')) editor.setMarkdown(value || '')
})

onBeforeUnmount(() => {
  editor = null
})
</script>

<template>
  <div class="editor-md-wrap">
    <div :id="id" class="editor-md-host">
      <textarea :value="modelValue" />
    </div>
    <div v-if="!ready" class="editor-md-loading">{{ placeholder }}</div>
  </div>
</template>
