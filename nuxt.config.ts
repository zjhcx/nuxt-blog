export default defineNuxtConfig({
  ssr: true,
  srcDir: 'app',
  compatibilityDate: '2024-11-01',
  modules: ['@nuxtjs/color-mode'],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light'
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Nuxt Blog',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A modern SSR blog built with Nuxt.' }
      ]
    }
  },
  nitro: {
    storage: {
      blog: {
        driver: 'fs',
        base: './data'
      }
    }
  },
  typescript: {
    strict: true
  }
})
