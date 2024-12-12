export interface ForumCategory {
  id: string
  name: string
  description: string
  parentId: string
  status: number
  createdAt: string
  updatedAt: string
  level: number
  translations: string | {
    en: string
    ja: string
    ko: string
    zh: string
    zhTw: string
  }
} 