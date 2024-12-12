<template>
  <div class="my-topics-page">
    <div class="page-header">
      <h1 class="text-h5">{{ $t('user.forum.myTopics') }}</h1>
    </div>

    <!-- 筛选工具栏 -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- 分类筛选 -->
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filters.categoryId"
              :options="categories"
              :label="$t('forum.category')"
              option-label="name"
              option-value="id"
              dense
              outlined
              clearable
              emit-value
              map-options
            >
              <template v-slot:option="{ itemProps, opt }">
                <q-item v-bind="itemProps">
                  <q-item-section avatar>
                    <q-avatar size="28px">
                      <q-img
                        v-if="opt.icon"
                        :src="getImageUrl(opt.icon)"
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
                    <q-item-label>{{ getCurrentLanguageName(opt) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- 状态筛选 -->
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filters.status"
              :options="statusOptions"
              :label="$t('forum.status')"
              dense
              outlined
              clearable
              emit-value
              map-options
            />
          </div>

          <!-- 关键词搜索 -->
          <div class="col-12 col-sm-4">
            <q-input
              v-model="filters.keyword"
              :label="$t('forum.search')"
              dense
              outlined
              clearable
              @keyup.enter="loadTopics"
            >
              <template v-slot:append>
                <q-icon
                  name="search"
                  class="cursor-pointer"
                  @click="loadTopics"
                />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 主题列表 -->
    <q-card flat bordered>
      <q-card-section>
        <q-list separator>
          <q-item
            v-for="topic in topics"
            :key="topic.id"
            clickable
            v-ripple
            @click="router.push(`/forum/topic/${topic.id}`)"
          >
            <!-- 分类标签 -->
            <q-item-section side>
              <q-chip
                :label="topic.categoryName"
                color="primary"
                text-color="white"
                dense
              />
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
                  <span>{{ formatDateTime(topic.createdAt) }}</span>
                  <q-space />
                  <q-icon name="visibility" size="16px" />
                  <span class="q-ml-xs">{{ topic.views }}</span>
                  <q-icon name="thumb_up" size="16px" class="q-ml-md" />
                  <span class="q-ml-xs">{{ topic.likes }}</span>
                  <q-icon name="comment" size="16px" class="q-ml-md" />
                  <span class="q-ml-xs">{{ topic.comments }}</span>
                </div>
              </q-item-label>
            </q-item-section>

            <!-- 操作按钮 -->
            <q-item-section side>
              <div class="row items-center">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  @click.stop="editTopic(topic)"
                >
                  <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click.stop="confirmDelete(topic)"
                >
                  <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                </q-btn>
              </div>
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

    <!-- 删除确认对话框 -->
    <q-dialog v-model="deleteDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="text-h6">{{ $t('forum.topic.confirmDelete') }}</span>
        </q-card-section>

        <q-card-section>
          {{ $t('forum.topic.deleteWarning') }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('common.cancel')"
            color="primary"
            v-close-popup
          />
          <q-btn
            flat
            :label="$t('common.confirm')"
            color="negative"
            @click="deleteTopic"
            :loading="deleteDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'users',
  middleware: 'auth'
})

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { api } from '~/utils/axios'
import { useI18n } from 'vue-i18n'
import { getImageUrl } from '~/utils/tools'

const router = useRouter()
const $q = useQuasar()
const { t, locale } = useI18n()

// 状态变量
const currentPage = ref(1)
const totalPages = ref(1)
const topics = ref([])
const categories = ref([])
const loading = ref(false)

// 筛选条件
const filters = ref({
  categoryId: null,
  status: null,
  keyword: ''
})

// 删除对话框
const deleteDialog = ref({
  show: false,
  loading: false,
  topic: null
})

// 状态选项
const statusOptions = [
  { label: t('forum.status.all'), value: null },
  { label: t('forum.status.draft'), value: 0 },
  { label: t('forum.status.published'), value: 1 },
  { label: t('forum.status.closed'), value: 2 }
]

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await api.get('/forum/category/list')
    if (response.data.succ) {
      // 处理返回的数据，解析国际化名称
      categories.value = response.data.data.map(item => ({
        ...item,
        translations: item.translations ? JSON.parse(item.translations) : {
          zh: item.name,
          en: '',
          zhTw: '',
          ja: '',
          ko: ''
        }
      }))
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.error.loadCategoriesFailed')
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
      ...filters.value
    }

    const response = await api.get('/admin/forum/topic/list', { params })
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

// 编辑主题
const editTopic = (topic) => {
  router.push(`/forum/topic/edit/${topic.id}`)
}

// 确认删除
const confirmDelete = (topic) => {
  deleteDialog.value = {
    show: true,
    loading: false,
    topic
  }
}

// 删除主题
const deleteTopic = async () => {
  if (!deleteDialog.value.topic) return

  deleteDialog.value.loading = true
  try {
    const response = await api.delete(`/forum/topic/${deleteDialog.value.topic.id}`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('forum.topic.deleteSuccess')
      })
      loadTopics()
    } else {
      throw new Error(response.data.msg)
    }
  } catch (error) {
    console.error('删除主题失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.topic.deleteFailed')
    })
  } finally {
    deleteDialog.value.loading = false
    deleteDialog.value.show = false
  }
}

// 初始化
onMounted(() => {
  loadCategories()
  loadTopics()
})
</script>

<style lang="scss" scoped>
.my-topics-page {
  padding: 20px;
}

.topic-title {
  font-size: 1.1em;
  font-weight: 500;
}
</style>
