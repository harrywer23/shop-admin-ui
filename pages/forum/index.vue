<template>
  <div class="forum-page">
    <div class="forum-header">
      <h1 class="text-h4">{{ $t('forum.title') }}</h1>
      <q-btn
        v-if="isLoggedIn"
        color="primary"
        icon="edit"
        :label="$t('forum.createTopic')"
        @click="router.push('/forum/topic/create')"
      />
    </div>

    <!-- 分类和主题列表布局 -->
    <div class="row q-col-gutter-md">
      <!-- 分类列表 -->
      <div class="col-12 q-mb-md">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('forum.categories') }}</div>
            
            <!-- 所有主题 -->
            <div 
              class="all-topics-card cursor-pointer q-mb-md"
              :class="{ 'category-active': currentCategory === 'all' }"
              @click="currentCategory = 'all'"
            >
              <div class="row items-center">
                <q-icon name="forum" size="28px" color="primary" class="q-mr-md" />
                <div>
                  <div class="text-h6">{{ $t('forum.allTopics') }}</div>
                  <div class="text-grey">{{ totalTopics }} {{ $t('forum.topics') }}</div>
                </div>
              </div>
            </div>

            <!-- 分类嵌套显示 -->
            <div class="categories-container">
              <div v-for="category in topCategories" :key="category.id" class="category-group q-mb-lg">
                <!-- 一级分类 -->
                <div 
                  class="parent-category cursor-pointer q-pa-md"
                  :class="{ 'category-active': currentCategory === category.id }"
                  @click="currentCategory = category.id"
                >
                  <div class="row items-center">
                    <q-avatar size="40px" class="q-mr-md">
                      <q-img
                        v-if="category.icon"
                        :src="getImageUrl(category.icon)"
                        spinner-color="primary"
                      />
                      <q-icon
                        v-else
                        name="folder"
                        color="primary"
                        size="40px"
                      />
                    </q-avatar>
                    <div>
                      <div class="text-h6">{{ getCurrentLanguageName(category) }}</div>
                      <div class="text-grey">{{ category.topicCount || 0 }} {{ $t('forum.topics') }}</div>
                      <div v-if="category.description" class="category-desc text-grey-7">
                        {{ category.description }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 子分类 -->
                <div v-if="category.children?.length" class="sub-categories q-pl-lg">
                  <div class="row q-col-gutter-md">
                    <div 
                      v-for="subCategory in category.children" 
                      :key="subCategory.id"
                      class="col-12 col-sm-4 col-md-2"
                    >
                      <q-card 
                        class="sub-category-card cursor-pointer"
                        :class="{ 'category-active': currentCategory === subCategory.id }"
                        @click="goToCategoryTopics(subCategory)"
                      >
                        <q-card-section>
                          <div class="row items-center">
                            <q-avatar size="32px" class="q-mr-md">
                              <q-img
                                v-if="subCategory.icon"
                                :src="getImageUrl(subCategory.icon)"
                                spinner-color="primary"
                              />
                              <q-icon
                                v-else
                                name="subdirectory_arrow_right"
                                color="primary"
                                size="32px"
                              />
                            </q-avatar>
                            <div class="sub-category-content">
                              <div class="text-subtitle1 ellipsis">{{ getCurrentLanguageName(subCategory) }}</div>
                              <div class="text-grey text-caption">{{ subCategory.topicCount || 0 }} {{ $t('forum.topics') }}</div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { api } from '~/utils/axios'
import { useI18n } from 'vue-i18n'
import { getImageUrl } from '~/utils/tools'

const router = useRouter()
const $q = useQuasar()
const { t, locale } = useI18n()

// 状态变量
const isLoggedIn = ref(false)
const currentCategory = ref('all')
const currentPage = ref(1)
const totalPages = ref(1)
const categoryTree = ref([])
const topics = ref([])
const loading = ref(false)
const currentSort = ref('latest')

// 排序选项
const sortOptions = [
  { value: 'latest', label: '最新' },
  { value: 'hot', label: '热门' },
  { value: 'views', label: '浏览最多' },
  { value: 'replies', label: '回复最多' }
]

// 计算当前是否为叶子分类
const isLeafCategory = computed(() => {
  if (currentCategory.value === 'all') return false
  const category = findCategoryById(currentCategory.value)
  return category && !categoryTree.value.some(cat => cat.parentId === category.id)
})

// 获取当前分类名称
const getCurrentCategoryName = () => {
  const category = findCategoryById(currentCategory.value)
  return category ? getCurrentLanguageName(category) : ''
}

// 根据ID查找分类
const findCategoryById = (id) => {
  const findInTree = (categories) => {
    for (const cat of categories) {
      if (cat.id === id) return cat
      if (cat.children) {
        const found = findInTree(cat.children)
        if (found) return found
      }
    }
    return null
  }
  return findInTree(categoryTree.value)
}

// 创建主题
const createTopic = () => {
  if (!isLoggedIn.value) {
    $q.notify({
      type: 'warning',
      message: t('forum.pleaseLogin')
    })
    return
  }

  router.push({
    path: '/forum/topic/create',
    query: { categoryId: currentCategory.value }
  })
}

// 构建树形结构
const buildTree = (flatData) => {
  const tree = []
  const map = {}

  // 先把所有节点存入map
  flatData.forEach(item => {
    map[item.id] = {
      ...item,
      children: [],
      label: item.name
    }
  })

  // 构建树形结构
  flatData.forEach(item => {
    const node = map[item.id]
    if (Number(item.parentId) === 0) {
      // 顶级分类
      tree.push(node)
    } else {
      // 子分类,添加到父节点的children中
      const parent = map[item.parentId]
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  return tree
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await api.get('/forum/category/list')
    if (response.data.succ) {
      // 处理返回的数据，解析国际化名称
      const processedData = response.data.data.map(item => ({
        ...item,
        translations: item.translations ? JSON.parse(item.translations) : {
          zh: item.name,
          en: '',
          zhTw: '',
          ja: '',
          ko: ''
        }
      }))

      // 将扁平数据转换成树形结构
      categoryTree.value = buildTree(processedData)
    }
  } catch (error) {
    console.error('加载分��失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.error.loadCategoriesFailed')
    })
  }
}


// 获取当前语言的分类名称
const getCurrentLanguageName = (category) => {
  if (!category?.translations) return category?.name || ''

  const lang = locale.value
  switch (lang) {
    case 'en':
      return category.translations.en || category.translations.zh
    case 'zh-TW':
      return category.translations.zhTw || category.translations.zh
    case 'ja':
      return category.translations.ja || category.translations.zh
    case 'ko':
      return category.translations.ko || category.translations.zh
    default:
      return category.translations.zh
  }
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 监听分类变化
watch(currentCategory, () => {
  currentPage.value = 1
})

// 监听排序变化
watch(currentSort, () => {
  currentPage.value = 1
})

// 检查登录状态
const checkLoginStatus = () => {
  const token = useCookie('token')
  isLoggedIn.value = !!token
}

// 新增计算属性：扁平化的分类列表
const flatCategories = computed(() => {
  const result = []
  const flatten = (categories, level = 0) => {
    categories.forEach(category => {
      result.push({
        ...category,
        level
      })
      if (category.children?.length) {
        flatten(category.children, level + 1)
      }
    })
  }
  flatten(categoryTree.value)
  return result
})

// 新增计算属性：总主题数
const totalTopics = computed(() => {
  return flatCategories.value.reduce((sum, category) => sum + (category.topicCount || 0), 0)
})

// 获取顶级分类
const topCategories = computed(() => {
  return categoryTree.value.filter((category: Category) => Number(category.parentId) === 0)
})

// 跳转到分类主题列表页面
const goToCategoryTopics = (category) => {
  router.push({
    path: '/forum/category/topics',
    query: { 
      categoryId: category.id,
      categoryName: getCurrentLanguageName(category)
    }
  })
}

// 初始化
onMounted(() => {
  checkLoginStatus()
  loadCategories()
})
</script>

<style lang="scss" scoped>
.forum-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.all-topics-card {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  &.category-active {
    border-color: var(--q-primary);
    background: rgba(var(--q-primary), 0.05);
  }
}

.parent-category {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  margin-bottom: 12px;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  &.category-active {
    border-color: var(--q-primary);
    background: rgba(var(--q-primary), 0.05);
  }
}

.sub-category-card {
  transition: all 0.3s ease;
  height: 100%;
  border: 1px solid #e0e0e0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  &.category-active {
    border-color: var(--q-primary);
    background: rgba(var(--q-primary), 0.05);
  }
}

.sub-category-content {
  flex: 1;
  min-width: 0; // 确保文本可以正确省略
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-desc {
  font-size: 0.9em;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.topic-title {
  font-size: 1.1em;
  font-weight: 500;
}
</style>
