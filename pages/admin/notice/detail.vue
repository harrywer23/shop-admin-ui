<template>
  <div class="notice-detail">
    <div class="page-header">
      <h1 class="text-h5">公告详情</h1>
      <q-btn
        flat
        icon="arrow_back"
        label="返回"
        color="primary"
        @click="$router.back()"
      />
    </div>

    <q-card class="detail-card">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ notice.title }}</div>
          <q-space />
          <q-chip
            :color="notice.status ? 'positive' : 'negative'"
            text-color="white"
            dense
          >
            {{ notice.status ? '已发布' : '已撤回' }}
          </q-chip>
          <q-chip
            :color="notice.isTop ? 'primary' : 'grey'"
            text-color="white"
            dense
          >
            {{ notice.isTop ? '已置顶' : '未置顶' }}
          </q-chip>
        </div>

        <div class="text-caption q-mb-lg">
          <span class="q-mr-md">发布时间：{{ formatDate(notice.publishTime) }}</span>
          <span>更新时间：{{ formatDate(notice.updateTime) }}</span>
        </div>

        <!-- 多语言标题 -->
        <div class="translations-section q-mb-lg">
          <div class="text-subtitle2 q-mb-sm">多语言标题</div>
          <div class="row q-col-gutter-md">
            <div v-for="(value, key) in notice.translationsI18n" :key="key" class="col-12 col-md-6">
              <div class="text-caption">{{ getLangLabel(key) }}</div>
              <div class="text-body2">{{ value || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- 多语言内容 -->
        <div class="translations-section">
          <div class="text-subtitle2 q-mb-sm">多语言内容</div>
          <div class="row q-col-gutter-md">
            <div v-for="(value, key) in notice.translationsContentI18n" :key="key" class="col-12">
              <div class="text-caption">{{ getLangLabel(key) }}</div>
              <div class="content-html" v-html="value || '-'"></div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { api } from '~/utils/axios'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

interface Translations {
  zh: string
  en: string
  zhTw: string
  ja: string
  ko: string
}

interface Notice {
  id: number | null
  title: string
  content: string
  status: boolean
  isTop: boolean
  publishTime: string
  updateTime: string
  translations: string
  translationsContent: string
  translationsI18n: Translations
  translationsContentI18n: Translations
}

const notice = ref<Notice>({
  id: null,
  title: '',
  content: '',
  status: false,
  isTop: false,
  publishTime: '',
  updateTime: '',
  translations: '{}',
  translationsContent: '{}',
  translationsI18n: {
    zh: '',
    en: '',
    zhTw: '',
    ja: '',
    ko: ''
  },
  translationsContentI18n: {
    zh: '',
    en: '',
    zhTw: '',
    ja: '',
    ko: ''
  }
})

const formatDate = (val: string) => {
  return val ? date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') : '-'
}

const getLangLabel = (key: string) => {
  const langMap: Record<string, string> = {
    zh: '中文',
    en: 'English',
    zhTw: '繁體中文',
    ja: '日本語',
    ko: '한국어'
  }
  return langMap[key] || key
}

const getNoticeDetail = async (id: string) => {
  try {
    const response = await api.get(`/admin/notice/detail/${id}`)
    const { code, data } = response.data
    if (code === 200) {
      notice.value = {
        ...data,
        translationsI18n: data.translations ? JSON.parse(data.translations) : {
          zh: data.title,
          en: '',
          zhTw: '',
          ja: '',
          ko: ''
        },
        translationsContentI18n: data.translationsContent ? JSON.parse(data.translationsContent) : {
          zh: data.content,
          en: '',
          zhTw: '',
          ja: '',
          ko: ''
        }
      }
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取公告详情失败'
    })
  }
}

onMounted(() => {
  if (route.query.id) {
    getNoticeDetail(route.query.id as string)
  }
})
</script>

<style lang="scss" scoped>
.notice-detail {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;

    h1 {
      margin: 0;
      color: #1976d2;
      display: flex;
      align-items: center;

      &:before {
        content: '';
        width: 4px;
        height: 20px;
        background: #1976d2;
        margin-right: 8px;
        border-radius: 2px;
      }
    }
  }

  .detail-card {
    background: white;
    border-radius: 8px;
  }

  .translations-section {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 16px;
    background: #fafafa;

    .text-subtitle2 {
      color: #666;
      font-weight: 500;
    }
  }

  .content-html {
    padding: 12px;
    background: white;
    border-radius: 4px;
    min-height: 100px;

    :deep(img) {
      max-width: 100%;
      height: auto;
    }

    :deep(p) {
      margin: 0.5em 0;
    }
  }
}
</style> 