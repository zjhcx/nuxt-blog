import type { BlogSettings } from '~/types/blog'

export const useBlogSettings = () =>
  useState<BlogSettings>('blog-settings', () => ({
    title: 'Nuxt Blog',
    subtitle: '',
    backgroundImage: '',
    backgroundOverlay: 0.54,
    glassOpacity: 0.68
  }))
