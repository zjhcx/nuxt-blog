export type BlogStatus = 'draft' | 'published'
export type CommentStatus = 'pending' | 'approved'

export interface BlogSettings {
  title: string
  subtitle: string
  backgroundImage: string
  heroBackgroundImage: string
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
  views: number
  deletedAt?: string
  publishedAt: string
  updatedAt: string
}

export interface BlogPage {
  id: string
  title: string
  path: string
  content: string
  views: number
  deletedAt?: string
  updatedAt: string
}

export interface BlogComment {
  id: string
  targetType: 'article' | 'page'
  targetId: string
  authorName: string
  content: string
  status: CommentStatus
  createdAt: string
}

export interface BlogUser {
  id: string
  username: string
  displayName: string
  passwordHash: string
  role: 'admin'
  createdAt: string
}

export interface BlogData {
  settings: BlogSettings
  categories: BlogCategory[]
  tags: BlogTag[]
  navItems: BlogNavItem[]
  articles: BlogArticle[]
  pages: BlogPage[]
  comments: BlogComment[]
  users: BlogUser[]
}
