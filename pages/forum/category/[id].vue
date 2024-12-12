<template>
  <div class="category-page">
    <!-- 分类信息头部 -->
    <div class="category-header q-mb-lg">
      <div class="row items-center justify-between">
        <div class="row items-center">
          <q-btn
            flat
            round
            dense
            icon="arrow_back"
            color="primary"
            @click="router.back()"
            class="q-mr-sm"
          />
          <div>
            <h1 class="text-h5 q-mb-sm">{{ getCurrentLanguageName(category) }}</h1>
            <div class="text-grey">{{ category.description }}</div>
          </div>
        </div>
        <q-btn
          v-if="isLoggedIn"
          color="primary"
          icon="edit"
          :label="$t('forum.createTopic')"
          @click="createTopic"
        />
      </div>
    </div>

    <!-- 子分类列表 -->
    <div v-if="category.children?.length" class="subcategories q-mb-lg">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">{{ $t('forum.subcategories') }}</div>
          <div class="row q-col-gutter-md">
            <div
              v-for="subcat in category.children"
              :key="subcat.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-item
                clickable
                v-ripple
                @click="router.push(`/forum/category/${subcat.id}`)"
                class="subcategory-item"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <q-img
                      v-if="subcat.icon"
                      :src="getImageUrl(subcat.icon)"
                      spinner-color="primary"
                    />
                    <q-icon
                      v-else
                      name="folder"
                      color="primary"
                      size="28px"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ getCurrentLanguageName(subcat) }}</q-item-label>
                  <q-item-label caption>
                    {{ subcat.topicCount || 0 }} {{ $t('forum.topics') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" />
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 主题列表 -->
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1">{{ $t('forum.topics') }}</div>
          <!-- 排序选项 -->
          <q-btn-dropdown
            flat
            :label="$t('forum.sort.' + currentSort)"
            icon="sort"
          >
            <q-list>
              <q-item
                v-for="sort in sortOptions"
                :key="sort.value"
                clickable
                v-close-popup
                @click="currentSort = sort.value"
              >
                <q-item-section>
                  {{ $t('forum.sort.' + sort.value) }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <!-- 主题列表 -->
        <q-list separator>
          <q-item
            v-for="topic in topics"
            :key="topic.id"
            clickable
            v-ripple
            @click="router.push(`/forum/topic/${topic.id}`)"
          >
            <!-- 用户头像 -->
            <q-item-section avatar>
              <q-avatar>
                <img :src="topic.userAvatar">
              </q-avatar>
            </q-item-section>

            <!-- 主题内容 -->
            <q-item-section>
              <q-item-label class="topic-title">
                <q-chip
                  v-if="topic.isTop"
                  color="primary"
                  text-color="white"
                  dense
                  class="q-mr-sm"
                >
                  {{ $t('forum.topic.top') }}
                </q-chip>
                <q-chip
                  v-if="topic.isEssence"
                  color="purple"
                  text-color="white"
                  dense
                  class="q-mr-sm"
                >
                  {{ $t('forum.topic.essence') }}
                </q-chip>
                {{ topic.title }}
              </q-item-label>
              <q-item-label caption lines="2">
                {{ topic.content }}
              </q-item-label>
              <q-item-label caption>
                <div class="row items-center text-grey">
                  <span>{{ topic.userName }}</span>
                  <q-space />
                  <q-icon name="visibility" size="16px" />
                  <span class="q-ml-xs">{{ topic.views }}</span>
                  <q-icon name="thumb_up" size="16px" class="q-ml-md" />
                  <span class="q-ml-xs">{{ topic.likes }}</span>
                  <q-icon name="comment" size="16px" class="q-ml-md" />
                  <span class="q-ml-xs">{{ topic.comments }}</span>
                  <span class="q-ml-md">{{ formatDateTime(topic.createdAt) }}</span>
                </div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- 分页器 -->
        <div class="pagination-section q-pa-md flex justify-center">
          <q-pagination
            v-model="currentPage"
            :max="totalPages"
            :max-pages="6"
            boundary-numbers
            direction-links
            @update:model-value="loadTopics"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { api } from '~/utils/axios'
import { useI18n } from 'vue-i18n'
import { getImageUrl } from '~/utils/tools'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t, locale } = useI18n()

// 状态变量
const isLoggedIn = ref(false)
const category = ref({})
const topics = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const currentSort = ref('latest')

// 排序选项
const sortOptions = [
  { value: 'latest', label: '最新' },
  { value: 'hot', label: '热门' },
  { value: 'views', label: '浏览最多' },
  { value: 'replies', label: '回复最多' }
]

// 加载分类信息
const loadCategory = async () => {
  try {
    const response = await api.get(`/forum/category/${route.params.id}`)
    if (response.data.succ) {
      category.value = {
        ...response.data.data,
        translations: response.data.data.translations ? 
          JSON.parse(response.data.data.translations) : {
            zh: response.data.data.name,
            en: '',
            zhTw: '',
            ja: '',
            ko: ''
          }
      }
    }
  } catch (error) {
    console.error('加载分类信息失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.error.loadCategoryFailed')
    })
  }
}

// 加载主题列表
const loadTopics = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: 10,
      categoryId: route.params.id,
      sort: currentSort.value
    }

    const response = await api.get('/forum/topics', { params })
    const { code, data, total } = response.data
    if (code === 200) {
      topics.value = data
      totalPages.value = Math.ceil(total / 10)
    }
  } catch (error) {
    console.error('加载主题列表失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.error.loadTopicsFailed')
    })
  } finally {
    loading.value = false
  }
}

// 获取当前语言的分类名称
const getCurrentLanguageName = (cat) => {
  if (!cat?.translations) return cat?.name || ''

  const lang = locale.value
  switch (lang) {
    case 'en':
      return cat.translations.en || cat.translations.zh
    case 'zh-TW':
      return cat.translations.zhTw || cat.translations.zh
    case 'ja':
      return cat.translations.ja || cat.translations.zh
    case 'ko':
      return cat.translations.ko || cat.translations.zh
    default:
      return cat.translations.zh
  }
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 创建主题
const createTopic = () => {
  router.push({
    path: '/forum/topic/create',
    query: { categoryId: route.params.id }
  })
}

// 检查登录状态
const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  isLoggedIn.value = !!token
}

// 监听排序变化
watch(currentSort, () => {
  currentPage.value = 1
  loadTopics()
})

// 监听路由参数变化
watch(() => route.params.id, () => {
  loadCategory()
  currentPage.value = 1
  loadTopics()
})

// 初始化
onMounted(() => {
  checkLoginStatus()
  loadCategory()
  loadTopics()
})
</script>

<style lang="scss" scoped>
.category-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.category-header {
  .text-h5 {
    margin: 0;
  }
}

.subcategory-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #f5f5f5;
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.topic-title {
  font-size: 1.1em;
  font-weight: 500;
}
</style> 