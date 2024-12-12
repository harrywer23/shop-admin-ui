<template>
  <div class="custom-applications-page">
    <div class="page-container">
      <h1 class="text-h5 q-mb-lg">{{ t('custom.applications.title') }}</h1>

      <!-- 筛选器 -->
      <div class="filter-section q-mb-lg">
        <div class="row q-col-gutter-md">
          <!-- 状态筛选 -->
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filter.status"
              :options="statusOptions"
              :label="t('custom.applications.status')"
              filled
              clearable
              emit-value
              map-options
            />
          </div>

          <!-- 类型筛选 -->
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filter.type"
              :options="customTypes"
              :label="t('custom.applications.type')"
              filled
              clearable
              emit-value
              map-options
            />
          </div>

          <!-- 时间范围 -->
          <div class="col-12 col-sm-6">
            <q-input
              v-model="filter.dateRange"
              :label="t('custom.applications.dateRange')"
              filled
              readonly
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="filter.dateRange"
                      range
                      mask="YYYY-MM-DD"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- 申请列表 -->
      <div class="application-list">
        <q-card
          v-for="application in filteredApplications"
          :key="application.id"
          flat
          bordered
          class="application-card q-mb-md"
        >
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">{{ application.name }}</div>
              <q-chip
                :color="getStatusColor(application.status)"
                text-color="white"
              >
                {{ getStatusText(application.status) }}
              </q-chip>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <!-- 基本信息 -->
                <div class="info-grid">
                  <div class="info-item">
                    <div class="label">{{ t('custom.applications.type') }}</div>
                    <div class="value">{{ getTypeText(application.type) }}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">{{ t('custom.applications.submitTime') }}</div>
                    <div class="value">{{ formatDate(application.createTime) }}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">{{ t('custom.applications.budget') }}</div>
                    <div class="value">¥{{ application.budgetMin }} - ¥{{ application.budgetMax }}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">{{ t('custom.applications.expectedDelivery') }}</div>
                    <div class="value">{{ formatDate(application.expectedDeliveryDate) }}</div>
                  </div>
                </div>

                <!-- 需求描述 -->
                <div class="requirements q-mt-md">
                  <div class="text-subtitle2">{{ t('custom.applications.requirements') }}</div>
                  <div class="text-body2">{{ application.requirements }}</div>
                </div>
              </div>

              <!-- 参考图片 -->
              <div class="col-12 col-md-4">
                <div class="text-subtitle2 q-mb-sm">{{ t('custom.applications.referenceImages') }}</div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="(image, index) in application.referenceImages"
                    :key="index"
                    class="col-4"
                  >
                    <q-img
                      :src="image"
                      @click="previewImage(image)"
                      class="rounded-borders cursor-pointer"
                      style="height: 80px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <!-- 查看详情按钮 -->
            <q-btn
              flat
              color="primary"
              :label="t('custom.applications.viewDetails')"
              @click="viewDetails(application.id)"
            />
            
            <!-- 取消申请按钮 -->
            <q-btn
              v-if="application.status === 'pending'"
              flat
              color="negative"
              :label="t('custom.applications.cancel')"
              @click="cancelApplication(application.id)"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- 分页器 -->
      <div class="row justify-center q-mt-lg">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="6"
          boundary-numbers
          direction-links
        />
      </div>

      <!-- 图片预览对话框 -->
      <q-dialog v-model="showPreview">
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-img :src="previewUrl" />
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/axios'
import { useQuasar } from 'quasar'
import { date } from 'quasar'

const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()

interface Application {
  id: string
  name: string
  type: string
  status: string
  createTime: string
  budgetMin: number
  budgetMax: number
  expectedDeliveryDate: string
  requirements: string
  referenceImages: string[]
}

// 筛选条件
const filter = ref({
  status: '',
  type: '',
  dateRange: { from: '', to: '' }
})

// 分页
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

// 预览图片
const showPreview = ref(false)
const previewUrl = ref('')

// 申请列表
const applications = ref<Application[]>([])

// 状态选项
const statusOptions = [
  { label: t('custom.status.pending'), value: 'pending' },
  { label: t('custom.status.reviewing'), value: 'reviewing' },
  { label: t('custom.status.inProgress'), value: 'inProgress' },
  { label: t('custom.status.completed'), value: 'completed' },
  { label: t('custom.status.cancelled'), value: 'cancelled' },
  { label: t('custom.status.rejected'), value: 'rejected' }
]

// 定制类型选项
const customTypes = [
  { label: t('custom.type.clothing'), value: 'clothing' },
  { label: t('custom.type.jewelry'), value: 'jewelry' },
  { label: t('custom.type.furniture'), value: 'furniture' },
  { label: t('custom.type.artwork'), value: 'artwork' },
  { label: t('custom.type.other'), value: 'other' }
]

// 过滤后的申请列表
const filteredApplications = computed(() => {
  let result = [...applications.value]

  // 状态筛选
  if (filter.value.status) {
    result = result.filter(app => app.status === filter.value.status)
  }

  // 类型筛选
  if (filter.value.type) {
    result = result.filter(app => app.type === filter.value.type)
  }

  // 时间范围筛选
  if (filter.value.dateRange.from && filter.value.dateRange.to) {
    const from = new Date(filter.value.dateRange.from).getTime()
    const to = new Date(filter.value.dateRange.to).getTime()
    result = result.filter(app => {
      const time = new Date(app.createTime).getTime()
      return time >= from && time <= to
    })
  }

  return result
})

// 获取状态文本
const getStatusText = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option ? option.label : status
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    reviewing: 'blue',
    inProgress: 'teal',
    completed: 'positive',
    cancelled: 'grey',
    rejected: 'negative'
  }
  return colorMap[status] || 'grey'
}

// 获取类型文本
const getTypeText = (type: string) => {
  const option = customTypes.find(opt => opt.value === type)
  return option ? option.label : type
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 预览图片
const previewImage = (url: string) => {
  previewUrl.value = url
  showPreview.value = true
}

// 查看详情
const viewDetails = (id: string) => {
  router.push(`/custom/application/${id}`)
}

// 取消申请
const cancelApplication = async (id: string) => {
  try {
    await $q.dialog({
      title: t('custom.applications.cancelConfirm.title'),
      message: t('custom.applications.cancelConfirm.message'),
      cancel: true,
      persistent: true
    })

    const response = await api.post(`/custom/cancel/${id}`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('custom.applications.cancelSuccess')
      })
      loadApplications()
    }
  } catch (error) {
    console.error('取消申请失败:', error)
  }
}

// 加载申请列表
const loadApplications = async () => {
  try {
    const response = await api.get('/custom/applications', {
      params: {
        page: currentPage.value,
        pageSize
      }
    })
    if (response.data.code === 200) {
      applications.value = response.data.data.list
      totalPages.value = Math.ceil(response.data.data.total / pageSize)
    }
  } catch (error) {
    console.error('获取申请列表失败:', error)
    $q.notify({
      type: 'negative',
      message: t('custom.applications.error.loadFailed')
    })
  }
}

// 监听页码变化
watch(currentPage, () => {
  loadApplications()
})

onMounted(() => {
  loadApplications()
})
</script>

<style lang="scss" scoped>
.custom-applications-page {
  padding: 20px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .application-card {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;

    .info-item {
      .label {
        color: #666;
        font-size: 0.9em;
      }

      .value {
        font-weight: 500;
        margin-top: 4px;
      }
    }
  }

  .requirements {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
  }
}
</style> 