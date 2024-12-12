<template>
  <div class="custom-detail-page">
    <div class="page-container">
      <h1 class="text-h5 q-mb-lg">{{ t('custom.detail.title') }}</h1>

      <div class="row q-col-gutter-md">
        <!-- 订单信息 -->
        <div class="col-12 col-lg-8">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ t('custom.detail.orderInfo') }}</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <div class="info-item">
                    <span class="label">{{ t('custom.detail.orderNumber') }}:</span>
                    <span class="value">{{ orderInfo.orderNumber }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">{{ t('custom.detail.createTime') }}:</span>
                    <span class="value">{{ formatDate(orderInfo.createTime) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">{{ t('custom.detail.status') }}:</span>
                    <span class="value">{{ getStatusText(orderInfo.status) }}</span>
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="info-item">
                    <span class="label">{{ t('custom.detail.category') }}:</span>
                    <span class="value">{{ orderInfo.category }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">{{ t('custom.detail.requirements') }}:</span>
                    <span class="value">{{ orderInfo.requirements }}</span>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- 进度追踪 -->
          <q-card flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ t('custom.detail.progress') }}</div>
              <q-timeline color="primary">
                <q-timeline-entry
                  v-for="(progress, index) in progressList"
                  :key="index"
                  :title="progress.title"
                  :subtitle="formatDate(progress.time)"
                >
                  <div>{{ progress.description }}</div>
                </q-timeline-entry>
              </q-timeline>
            </q-card-section>
          </q-card>

          <!-- 设计图/样品图 -->
          <q-card flat bordered class="q-mt-md" v-if="orderInfo.designs?.length">
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ t('custom.detail.designs') }}</div>
              <div class="row q-col-gutter-md">
                <div
                  v-for="(design, index) in orderInfo.designs"
                  :key="index"
                  class="col-6 col-sm-4"
                >
                  <q-img
                    :src="design.url"
                    @click="previewImage(design.url)"
                    class="design-image cursor-pointer"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 价格预估 -->
        <div class="col-12 col-lg-4">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ t('custom.detail.estimate') }}</div>

              <template v-if="estimate">
                <div class="estimate-info">
                  <div class="info-item">
                    <span class="label">{{ t('custom.detail.materialCost') }}:</span>
                    <span class="value">¥{{ estimate.materialCost }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">{{ t('custom.detail.laborCost') }}:</span>
                    <span class="value">¥{{ estimate.laborCost }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">{{ t('custom.detail.otherCost') }}:</span>
                    <span class="value">¥{{ estimate.otherCost }}</span>
                  </div>
                  <div class="info-item total">
                    <span class="label">{{ t('custom.detail.totalCost') }}:</span>
                    <span class="value text-primary">¥{{ estimate.totalCost }}</span>
                  </div>

                  <div class="estimate-actions q-mt-lg">
                    <q-btn
                      v-if="orderInfo.status === 1"
                      color="primary"
                      :label="t('custom.detail.confirmEstimate')"
                      @click="confirmEstimate"
                      :loading="confirming"
                    />
                  </div>
                </div>
              </template>

              <div v-else class="text-grey">
                {{ t('custom.detail.noEstimate') }}
              </div>
            </q-card-section>
          </q-card>

          <!-- 联系客服 -->
          <q-card flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ t('custom.detail.contact') }}</div>
              <div class="contact-info">
                <div class="info-item">
                  <q-icon name="phone" size="sm" class="q-mr-sm" />
                  <span>400-123-4567</span>
                </div>
                <div class="info-item">
                  <q-icon name="email" size="sm" class="q-mr-sm" />
                  <span>super@aivrw.com</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- 图片预览 -->
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
definePageMeta({
  layout: 'users',
  middleware: 'auth'
});
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/axios'
import { useQuasar } from 'quasar'
import { date } from 'quasar'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()

const orderInfo = ref({
  orderNumber: '',
  createTime: '',
  status: 0,
  category: '',
  requirements: '',
  designs: []
})

const progressList = ref([])
const estimate = ref(null)
const confirming = ref(false)
const showPreview = ref(false)
const previewUrl = ref('')

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return t('custom.status.pending')
    case 1: return t('custom.status.approved')
    case 2: return t('custom.status.rejected')
    case 3: return t('custom.status.deposit')
    case 4: return t('custom.status.production')
    case 5: return t('custom.status.final')
    case 6: return t('custom.status.shipping')
    case 7: return t('custom.status.shipped')
    case 8: return t('custom.status.completed')
    case 9: return t('custom.status.cancelled')
    default: return t('custom.status.unknown')
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 加载订单信息
const loadOrderInfo = async () => {
  try {
    const orderId = route.params.id
    const response = await api.get(`/custom/order/${orderId}`)
    if (response.data.code === 200) {
      orderInfo.value = response.data.data
    }
  } catch (error) {
    console.error('获取订单信息失败:', error)
    $q.notify({
      type: 'negative',
      message: t('custom.detail.error.loadFailed')
    })
  }
}

// 加载进度信息
const loadProgress = async () => {
  try {
    const orderId = route.params.id
    const response = await api.get(`/custom/progress/${orderId}`)
    if (response.data.code === 200) {
      progressList.value = response.data.data
    }
  } catch (error) {
    console.error('获取进度信息失败:', error)
  }
}

// 加载预估信息
const loadEstimate = async () => {
  try {
    const orderId = route.params.id
    const response = await api.get(`/custom/estimate/${orderId}`)
    if (response.data.code === 200) {
      estimate.value = response.data.data
    }
  } catch (error) {
    console.error('获取预估信息失败:', error)
  }
}

// 确认预估价格
const confirmEstimate = async () => {
  try {
    confirming.value = true
    const orderId = route.params.id
    const response = await api.post(`/custom/estimate/confirm/${orderId}`)

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('custom.detail.estimateConfirmed')
      })
      // 刷新订单信息
      await loadOrderInfo()
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.msg || t('custom.detail.error.confirmFailed')
      })
    }
  } catch (error) {
    console.error('确认预估失败:', error)
    $q.notify({
      type: 'negative',
      message: t('custom.detail.error.confirmFailed')
    })
  } finally {
    confirming.value = false
  }
}

// 预览图片
const previewImage = (url: string) => {
  previewUrl.value = url
  showPreview.value = true
}

onMounted(() => {
  loadOrderInfo()
  loadProgress()
  loadEstimate()
})
</script>

<style lang="scss" scoped>
.custom-detail-page {
  padding: 20px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .info-item {
    margin-bottom: 12px;

    .label {
      color: #666;
      margin-right: 8px;
    }

    .value {
      font-weight: 500;
    }

    &.total {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
      font-size: 1.1em;
    }
  }

  .design-image {
    border-radius: 8px;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .contact-info {
    .info-item {
      display: flex;
      align-items: center;
    }
  }
}
</style>
