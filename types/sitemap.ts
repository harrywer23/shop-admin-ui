export interface Product {
  prodId: number
  prodName: string
  updateTime: string
  pic?: string
  brief?: string
}

export interface Category {
  categoryId: number
  categoryName: string
  parentId: number
  level: number
  status: number
} 