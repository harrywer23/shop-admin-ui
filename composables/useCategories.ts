import { useLanguage } from './useLanguage'
import type { Translations } from './useLanguage'

interface Category {
  categoryId: string
  categoryName: string
  translations?: Translations | null
  parentId: string
  children?: Category[]
}

export const useCategories = () => {
  const { getLocalizedText } = useLanguage()

  /**
   * 获取当前语言的分类名称
   * @param category 分类对象
   * @returns 当前语言的分类名称
   */
  const getCategoryName = (category: Category): string => {
    return getLocalizedText(category.translations, category.categoryName)
  }

  /**
   * 递归处理分类树，转换所有分类名称为当前语言
   * @param categories 分类树
   * @returns 处理后的分类树
   */
  const translateCategoryTree = (categories: Category[]): Category[] => {
    return categories.map(category => ({
      ...category,
      categoryName: getCategoryName(category),
      children: category.children ? translateCategoryTree(category.children) : undefined
    }))
  }

  return {
    getCategoryName,
    translateCategoryTree
  }
}
