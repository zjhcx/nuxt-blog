export type BlogStatus = 'draft' | 'published'

export interface BlogSettings {
  title: string
  subtitle: string
  backgroundImage: string
  backgroundOverlay: number
  glassOpacity: number
}

export interface BlogCategory {
  id: string
  name: string
  path: string
  description: string
}

export interface BlogTag {
  id: string
  name: string
  path: string
  description: string
}

export interface BlogNavItem {
  id: string
  label: string
  href: string
  sort: number
  visible: boolean
}

export interface BlogArticle {
  id: string
  title: string
  path: string
  excerpt: string
  content: string
  cover: string
  categoryPath: string
  tagPaths: string[]
  status: BlogStatus
  publishedAt: string
  updatedAt: string
}

export interface BlogPage {
  id: string
  title: string
  path: string
  content: string
  updatedAt: string
}

export interface BlogData {
  settings: BlogSettings
  categories: BlogCategory[]
  tags: BlogTag[]
  navItems: BlogNavItem[]
  articles: BlogArticle[]
  pages: BlogPage[]
}
