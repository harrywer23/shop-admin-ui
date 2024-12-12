<template>
  <div class="category-topics-page">
    <div class="page-header q-pa-md">
      <div class="row items-center justify-between">
        <div class="text-h5">{{ categoryName }}</div>
        <div class="row q-gutter-sm">
          <!-- 搜索框 -->
          <q-input
            v-model="searchQuery"
            :placeholder="$t('forum.search')"
            dense
            outlined
            class="search-input"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- 排序下拉框 -->
          <q-select
            v-model="currentSort"
            :options="sortOptions"
            dense
            outlined
            emit-value
            map-options
            :label="$t('forum.sort')"
          />

          <!-- 发布主题按钮 -->
          <q-btn
            v-if="isLoggedIn"
            color="primary"
            icon="edit"
            :label="$t('forum.topic.create.pageTitle')"
            @click="createTopic"
          />
        </div>
      </div>
    </div>

    <!-- 主题列表 -->
    <q-card flat bordered class="q-ma-md">
      <q-card-section>
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
import { useRouter, useRoute } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { api } from '~/utils/axios'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const { t } = useI18n()

// 状态变量
const categoryId = ref(route.query.categoryId)
const categoryName = ref(route.query.categoryName)
const searchQuery = ref('')
const currentSort = ref('latest')
const currentPage = ref(1)
const totalPages = ref(1)
const topics = ref([])
const isLoggedIn = ref(false)

// 排序选项
const sortOptions = [
  { label: t('forum.sort.latest'), value: 'latest' },
  { label: t('forum.sort.hot'), value: 'hot' },
  { label: t('forum.sort.views'), value: 'views' },
  { label: t('forum.sort.replies'), value: 'replies' }
]

// 加载主题列表
const loadTopics = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: 10,
      categoryId: categoryId.value,
      sort: currentSort.value,
      keyword: searchQuery.value
    }

    const response = await api.get('/forum/topic/list', { params })
    const { code, data, total } = response.data
    if (code === 200) {
      topics.value = data
      totalPages.value = Math.ceil(total / 10)
    }
  } catch (error) {
    console.error('加载主题列��失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.error.loadTopicsFailed')
    })
  }
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
    query: { categoryId: categoryId.value }
  })
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 监听搜索和排序变化
watch([searchQuery, currentSort], () => {
  currentPage.value = 1
  loadTopics()
})

// 检查登录状态
const checkLoginStatus = () => {
  const token = useCookie('token')
  isLoggedIn.value = !!token
}

// 初始化
onMounted(() => {
  checkLoginStatus()
  loadTopics()
})
</script>

<style lang="scss" scoped>
.category-topics-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.topic-title {
  font-size: 1.1em;
  font-weight: 500;
}
</style> 