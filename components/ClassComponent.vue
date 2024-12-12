<template>
  <div class="category-section">
    <!-- 主分类列表 -->
    <div class="main-categories">
      <div
        v-for="category in categories"
        :key="category.categoryId"
        class="main-category-item"
        @click="handleCategoryClick(category)"
        :class="{ 'active': selectedCategory?.categoryId === category.categoryId }"
      >
        <!-- 主分类图标和名称 -->
        <div class="main-category-content">
          <q-img
            v-if="category.pic"
            :src="getImageUrl(category.pic)"
            class="category-icon"
            spinner-color="primary"
            spinner-size="24px"
          />
          <q-icon
            v-else
            name="folder"
            color="primary"
            class="category-icon q-mr-sm"
          />
          <div class="category-name">{{ getCurrentLanguageName(category.translations, category.categoryName) }}</div>
        </div>
      </div>
    </div>

    <!-- 子分类浮动面板 -->
    <div
      v-if="selectedCategory && selectedCategory.children?.length"
      class="sub-categories-panel"
    >
      <div class="sub-categories-content">
        <div
          v-for="subCategory in selectedCategory.children"
          :key="subCategory.categoryId"
          class="sub-category-item"
          @click="handleSubCategoryClick(selectedCategory.categoryId,subCategory)"
        >
          <q-img
            v-if="subCategory.pic"
            :src="getImageUrl(subCategory.pic)"
            class="sub-category-icon"
            spinner-color="primary"
            spinner-size="16px"
          />
          <q-icon
            v-else
            name="subdirectory_arrow_right"
            size="16px"
            class="sub-category-icon"
          />
          <span class="sub-category-name">{{ getCurrentLanguageName(subCategory.translations, subCategory.categoryName) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/axios'
import {getCurrentLanguageName, getImageUrl} from '~/utils/tools'
import type { Translations } from '~/utils/constants'

interface Category {
  categoryId: string
  translations: Translations
  parentId: string
  pic?: string
  children?: Category[]
  categoryName?: string
}

const router = useRouter()
const { locale } = useI18n()
const lang=ref(locale.value);

const categories = ref<Category[]>([])
const selectedCategory = ref<Category | null>(null)

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await api.get('/category/list')
    if (res.data.succ) {
      // 处理返回的数据，解析国际化名称
      const processedData = res.data.data.map((item: any) => ({
        ...item,
        translations: item.translations ? JSON.parse(item.translations) : {
          zh: item.categoryName,
          en: '',
          zhTw: '',
          ja: '',
          ko: ''
        }
      }))

      // 构建树形结构
      categories.value = buildTree(processedData)
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 构建树形结构
const buildTree = (flatData: Category[]): Category[] => {
  const tree: Category[] = []
  const map: { [key: string]: Category } = {}

  flatData.forEach(item => {
    map[item.categoryId] = { ...item, children: [] }
  })

  flatData.forEach(item => {
    if (item.parentId === '0') {
      tree.push(map[item.categoryId])
    } else {
      const parent = map[item.parentId]
      if (parent) {
        parent.children?.push(map[item.categoryId])
      }
    }
  })

  return tree
}

// 处理主分类点击
const handleCategoryClick = (category: Category) => {
  selectedCategory.value = category
}

// 处理子分类点击
const handleSubCategoryClick = (categoryId:number,category: Category) => {
  router.push({
    path: 'product/list',
    query: {"parentId":categoryId, "categoryId": category.categoryId }
  })
}


// 添加子类面板位置计算
const subCategoriesStyle = computed(() => {
  return {
    left: '220px', // 主分类宽度 + padding
    top: '0'
  }
})

onMounted(() => {
  fetchCategories()
})
</script>

<style lang="scss" scoped>
.category-section {
  position: relative;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  min-height: 400px;
}

.main-categories {
  width: 200px;
  background: #fff;
  border-radius: 8px;
  padding: 8px;
}

.main-category-item {
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin-bottom: 8px;

  &:hover {
    background: #f5f5f5;
  }

  &.active {
    background: #e3f2fd;
    color: var(--primary-color);
  }
}

.main-category-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
}

// 子分类浮动面板样式
.sub-categories-panel {
  position: absolute;
  left: 220px;
  top: 0;
  width: calc(100% - 240px);
  min-height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 20px;
}

.sub-categories-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.sub-category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: calc(20% - 10px);
  min-width: 180px;
  height: 40px;

  &:hover {
    background: #e3f2fd;
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .sub-category-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .sub-category-name {
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }
}

// 响应式设计优化
@media (max-width: 1600px) {
  .sub-category-item {
    width: calc(25% - 9px);
  }
}

@media (max-width: 1400px) {
  .sub-category-item {
    width: calc(33.33% - 8px);
  }
}

@media (max-width: 1200px) {
  .sub-category-item {
    width: calc(50% - 6px);
  }
}

@media (max-width: 768px) {
  .sub-categories-panel {
    position: fixed;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: calc(100% - 40px);
    margin: 0 20px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .sub-category-item {
    width: 100%;
    min-width: unset;
  }
}
</style>
