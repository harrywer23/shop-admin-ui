<template>
  <div class="custom-orders-page">
    <div class="page-container">
      <h1 class="text-h5 q-mb-lg">{{ t('custom.title') }}</h1>

      <!-- 订单状态标签页 -->
      <q-tabs
        v-model="currentTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="all" :label="t('common.all')" />
        <q-tab name="pending" :label="t('custom.status.pending')" />
        <q-tab name="approved" :label="t('custom.status.approved')" />
        <q-tab name="production" :label="t('custom.status.production')" />
        <q-tab name="shipping" :label="t('custom.status.shipping')" />
        <q-tab name="completed" :label="t('custom.status.completed')" />
        <q-tab name="cancelled" :label="t('custom.status.cancelled')" />
      </q-tabs>

      <!-- 订单列表 -->
      <div class="order-list q-mt-md">
        <q-card v-for="order in filteredOrders(currentTab)" :key="order.custom_order_id" flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle1">{{ t('custom.detail.orderNumber') }}: {{ order.orderNumber }}</div>
              <div class="text-caption">{{ formatDate(order.createTime) }}</div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="text-h6">{{ order.category }}</div>
                <div class="text-body2 q-mt-sm">{{ order.requirements }}</div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="row justify-between items-center">
              <div class="text-subtitle2">{{ getStatusText(order.status) }}</div>
              <div class="row q-gutter-sm">
                <!-- 查看进度按钮 -->
                <q-btn
                  v-if="order.status >= 4"
                  color="primary"
                  :label="t('custom.detail.progress')"
                  @click="viewProgress(order)"
                  flat
                />

                <!-- 确认预估按钮 -->
                <q-btn
                  v-if="order.status === 1"
                  color="primary"
                  :label="t('custom.detail.confirmEstimate')"
                  @click="confirmEstimate(order)"
                  flat
                />

                <!-- 查看详情按钮 -->
                <q-btn
                  color="primary"
                  :label="t('common.viewDetail')"
                  :to="`/user/custom/${order.custom_order_id}`"
                  flat
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 进度弹窗 -->
      <q-dialog v-model="showProgress">
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <div class="text-h6">{{ t('custom.detail.progress') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '~/utils/axios'
import { useQuasar } from 'quasar'
import { date } from 'quasar'

const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()

interface Progress {
  title: string
  time: string
  description: string
}

interface CustomOrder {
  custom_order_id: string
  orderNumber: string
  category: string
  requirements: string
  status: number
  createTime: string
}

const currentTab = ref('all')
const orders = ref<CustomOrder[]>([])
const showProgress = ref(false)
const progressList = ref<Progress[]>([])

// 根据状态筛选订单
const filteredOrders = (status: string) => {
  return orders.value.filter(order => {
    switch (status) {
      case 'pending':
        return order.status === 0
      case 'approved':
        return order.status === 1
      case 'production':
        return order.status === 4
      case 'shipping':
        return order.status === 6
      case 'completed':
        return order.status === 8
      case 'cancelled':
        return order.status === 9
      default:
        return true
    }
  })
}

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return t('custom.status.pending')
    case 1:
      return t('custom.status.approved')
    case 2:
      return t('custom.status.rejected')
    case 3:
      return t('custom.status.deposit')
    case 4:
      return t('custom.status.production')
    case 5:
      return t('custom.status.final')
    case 6:
      return t('custom.status.shipping')
    case 7:
      return t('custom.status.shipped')
    case 8:
      return t('custom.status.completed')
    case 9:
      return t('custom.status.cancelled')
    default:
      return t('custom.status.unknown')
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 查看进度
const viewProgress = async (order: CustomOrder) => {
  try {
    const response = await api.get(`/custom/progress/${order.custom_order_id}`)
    if (response.data.code === 200) {
      progressList.value = response.data.data
      showProgress.value = true
    }
  } catch (error) {
    console.error('获取进度信息失败:', error)
    $q.notify({
      type: 'negative',
      message: t('custom.detail.error.loadFailed')
    })
  }
}

// 确认预估价格
const confirmEstimate = async (order: CustomOrder) => {
  try {
    const response = await api.post(`/custom/estimate/confirm/${order.custom_order_id}`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('custom.detail.estimateConfirmed')
      })
      loadOrders()
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
  }
}

// 加载订单列表
const loadOrders = async () => {
  try {
    const queryParams = new URLSearchParams({
      pageNum: 1,
      pageSize: 12
    })

    const response = await api.get('/admin/custom/order/list?'+queryParams.toString())
    if (response.data.code === 200) {
      orders.value = response.data.data
    }
  } catch (error) {
    console.error('获取定制订单列表失败:', error)
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style lang="scss" scoped>
.custom-orders-page {
  padding: 20px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
</style>
