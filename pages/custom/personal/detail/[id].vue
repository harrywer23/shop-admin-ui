<template>
  <div class="personal-detail-page">
    <div class="page-container">
      <h1 class="text-h5 q-mb-lg">{{ t('custom.personal.detail.title') }}</h1>

      <q-card flat bordered class="q-mb-lg">
        <!-- 基本信息 -->
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('custom.personal.detail.basicInfo') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="info-item">
                <div class="label">{{ t('custom.personal.detail.applicant') }}</div>
                <div class="value">{{ detail.name }}</div>
              </div>
              <div class="info-item">
                <div class="label">{{ t('custom.personal.detail.contact') }}</div>
                <div class="value">{{ detail.contact }}</div>
              </div>
              <div class="info-item">
                <div class="label">{{ t('custom.personal.detail.type') }}</div>
                <div class="value">{{ t(`custom.type.${detail.type}`) }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="info-item">
                <div class="label">{{ t('custom.personal.detail.budget') }}</div>
                <div class="value">¥{{ detail.budgetMin }} - ¥{{ detail.budgetMax }}</div>
              </div>
              <div class="info-item">
                <div class="label">{{ t('custom.personal.detail.expectedDelivery') }}</div>
                <div class="value">{{ formatDate(detail.expectedDeliveryDate) }}</div>
              </div>
              <div class="info-item">
                <div class="label">{{ t('custom.personal.detail.status') }}</div>
                <q-chip
                  :color="getStatusColor(detail.status)"
                  text-color="white"
                  size="sm"
                >
                  {{ t(`custom.status.${detail.status}`) }}
                </q-chip>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- 需求描述 -->
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('custom.personal.detail.requirements') }}</div>
          <div class="requirements-content">{{ detail.requirements }}</div>
        </q-card-section>

        <!-- 参考图片 -->
        <q-card-section v-if="detail.referenceImages?.length">
          <div class="text-h6 q-mb-md">{{ t('custom.personal.detail.referenceImages') }}</div>
          <div class="row q-col-gutter-md">
            <div
              v-for="(image, index) in detail.referenceImages"
              :key="index"
              class="col-6 col-sm-4 col-md-3"
            >
              <q-img
                :src="image"
                :ratio="1"
                class="rounded-borders cursor-pointer"
                @click="openImagePreview(index)"
              />
            </div>
          </div>
        </q-card-section>

        <!-- 附件列表 -->
        <q-card-section v-if="detail.attachments?.length">
          <div class="text-h6 q-mb-md">{{ t('custom.personal.detail.attachments') }}</div>
          <q-list bordered separator>
            <q-item
              v-for="(file, index) in detail.attachments"
              :key="index"
              clickable
              @click="downloadAttachment(file)"
            >
              <q-item-section avatar>
                <q-icon name="attach_file" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ file.name }}</q-item-label>
                <q-item-label caption>{{ formatFileSize(file.size) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="download"
                >
                  <q-tooltip>{{ t('common.download') }}</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- 进度追踪 -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('custom.personal.detail.progress') }}</div>
          <q-timeline color="primary">
            <q-timeline-entry
              v-for="(progress, index) in detail.progressList"
              :key="index"
              :title="progress.title"
              :subtitle="formatDateTime(progress.time)"
              :color="progress.color"
            >
              <div>{{ progress.description }}</div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>
      </q-card>
    </div>

    <!-- 图片预览 -->
    <q-dialog v-model="imagePreview.show">
      <q-card style="width: 90vw; max-width: 800px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t('custom.personal.detail.imagePreview') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-carousel
            v-model="imagePreview.currentSlide"
            animated
            arrows
            navigation
            infinite
            height="70vh"
          >
            <q-carousel-slide
              v-for="(image, index) in detail.referenceImages"
              :key="index"
              :name="index"
              class="column no-wrap flex-center"
            >
              <q-img :src="image" style="max-height: 100%; max-width: 100%" />
            </q-carousel-slide>
          </q-carousel>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import { api } from '~/utils/axios'

const route = useRoute()
const { t } = useI18n()

// 详情数据
const detail = ref({
  name: '',
  contact: '',
  type: '',
  requirements: '',
  budgetMin: 0,
  budgetMax: 0,
  expectedDeliveryDate: '',
  referenceImages: [],
  attachments: [],
  status: '',
  progressList: []
})

// 图片预览状态
const imagePreview = ref({
  show: false,
  currentSlide: 0
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    approved: 'positive',
    rejected: 'negative',
    processing: 'info',
    completed: 'positive'
  }
  return colorMap[status] || 'grey'
}

// 打开图片预览
const openImagePreview = (index: number) => {
  imagePreview.value.currentSlide = index
  imagePreview.value.show = true
}

// 下载附件
const downloadAttachment = (file: any) => {
  window.open(file.url, '_blank')
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD')
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 加载详情数据
const loadDetail = async () => {
  try {
    const response = await api.get(`/custom/personal/detail/${route.params.id}`)
    if (response.data.code === 200) {
      detail.value = response.data.data
    }
  } catch (error) {
    console.error('加载详情失败:', error)
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style lang="scss" scoped>
.personal-detail-page {
  padding: 20px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .info-item {
    margin-bottom: 16px;

    .label {
      color: #666;
      margin-bottom: 4px;
    }

    .value {
      font-size: 1.1em;
    }
  }

  .requirements-content {
    white-space: pre-wrap;
    line-height: 1.6;
  }
}
</style> 