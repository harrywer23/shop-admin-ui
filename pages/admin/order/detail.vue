<template>
  <div class="order-details-page">
    <h1 class="text-h4 q-mb-lg">订单详情</h1>

    <!-- 订单基本信息 -->
    <div class="order-info q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-subtitle1">订单号：{{ order.orderNumber }}</div>
              <div class="text-caption text-grey-7">下单时间：{{ formatDateTime(order.createTime) }}</div>
            </div>
            <div class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusLabel(order.status) }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 商品列表 -->
    <div class="order-items q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">商品列表</div>
          <div v-for="item in order.orderItems" :key="item.orderItemId" class="order-item">
            <div class="item-main">
              <q-img :src="getImageUrl(item.pic)" style="width: 80px; height: 80px" />
              <div class="item-info">
                <div class="item-name">{{ item.prodName }}</div>
                <div v-if="item.skuName" class="item-sku text-grey">{{ item.skuName }}</div>
                <div class="item-price">
                  <span class="price">¥{{ item.price }}</span>
                  <span class="quantity">x{{ item.prodCount }}</span>
                </div>
              </div>
            </div>
            <!-- 评价按钮 -->
            <div class="item-actions">
              <q-btn
                v-if="order.status === OrderStatus.COMPLETED && !item.commSts"
                flat
                color="primary"
                label="评价"
                @click="openReview(item)"
              />
              <q-btn
                v-else-if="item.commSts"
                flat
                color="grey"
                label="已评价"
                disable
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 订单金额信息 -->
    <div class="order-amount q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row justify-between q-mb-sm">
            <span>商品总额</span>
            <span>¥{{ order.total }}</span>
          </div>
          <div class="row justify-between q-mb-sm">
            <span>运费</span>
            <span>¥{{ order.freightAmount }}</span>
          </div>
          <div class="row justify-between q-mb-sm">
            <span>优惠金额</span>
            <span class="text-negative">-¥{{ order.reduceAmount || 0 }}</span>
          </div>
          <div class="row justify-between text-weight-bold">
            <span>实付金额</span>
            <span class="text-primary">¥{{ order.actualTotal }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 订单状态时间线 -->
    <div class="order-timeline q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">订单状态</div>
          <q-timeline color="primary">
            <q-timeline-entry
              v-if="order.createTime"
              :title="'订单创建'"
              :subtitle="formatDateTime(order.createTime)"
            />
            <q-timeline-entry
              v-if="order.payTime"
              :title="'支付完成'"
              :subtitle="formatDateTime(order.payTime)"
            />
            <q-timeline-entry
              v-if="order.dvyTime"
              :title="'商品发货'"
              :subtitle="formatDateTime(order.dvyTime)"
            />
            <q-timeline-entry
              v-if="order.finallyTime"
              :title="'订单完成'"
              :subtitle="formatDateTime(order.finallyTime)"
            />
            <q-timeline-entry
              v-if="order.cancelTime"
              color="negative"
              :title="'订单取消'"
              :subtitle="formatDateTime(order.cancelTime)"
            />
          </q-timeline>
        </q-card-section>
      </q-card>
    </div>

    <!-- 订单操作 -->
    <div class="order-actions q-mt-lg">
      <q-btn
        flat
        color="primary"
        label="返回订单列表"
        @click="goBack"
        class="q-mr-sm"
      />

      <!-- 待付款状态显示付款按钮 -->
      <q-btn
        v-if="order.status === OrderStatus.UNPAID"
        color="primary"
        label="立即付款"
        @click="goToPay"
      />

      <!-- 待收货状态显示确认收货按钮 -->
      <q-btn
        v-if="order.status === OrderStatus.SHIPPED"
        outline
        color="primary"
        label="确认收货"
        @click="confirmReceipt"
      />
    </div>

    <!-- 加载状态 -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { OrderStatus } from '~/utils/constants'
import { api } from '~/utils/axios'

definePageMeta({
  layout: 'users',
  middleware: 'auth'
})

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// 订单数据
const order = ref({
  orderId: 0,
  orderNumber: '',
  total: 0,
  actualTotal: 0,
  freightAmount: 0,
  reduceAmount: 0,
  status: 0,
  createTime: '',
  payTime: '',
  dvyTime: '',
  finallyTime: '',
  cancelTime: '',
  orderItems: [] as any[]
})

// 加载状态
const loading = ref(false)

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 获取订单状态标签
const getStatusLabel = (status: number) => {
  switch (status) {
    case OrderStatus.UNPAID: return '待付款'
    case OrderStatus.PAID: return '已付款'
    case OrderStatus.SHIPPED: return '待收货'
    case OrderStatus.COMPLETED: return '已完成'
    case OrderStatus.CANCELLED: return '已取消'
    default: return '未知状态'
  }
}

// 获取状态样式类
const getStatusClass = (status: number) => {
  switch (status) {
    case OrderStatus.UNPAID: return 'text-warning'
    case OrderStatus.PAID: return 'text-info'
    case OrderStatus.SHIPPED: return 'text-primary'
    case OrderStatus.COMPLETED: return 'text-positive'
    case OrderStatus.CANCELLED: return 'text-negative'
    default: return 'text-grey'
  }
}

// 获取订单详情
const loadOrderDetails = async () => {
  //console.log("orderNumber:",route.query.orderNumber)
  loading.value = true
  try {
    const response = await api.get(`/admin/order/info?orderNumber=${route.query.orderNumber}`)
    const { code, data } = response.data
    if (code === 200) {
      order.value = data
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取订单详情失败'
    })
  } finally {
    loading.value = false
  }
}

// 跳转到支付页面
const goToPay = () => {
  router.push(`/order/payment?orderNumber=${order.value.orderNumber}`, { replace: true })
}

// 确认收货
const confirmReceipt = async () => {
  try {
    const response = await api.post(`/order/confirm/${order.value.orderId}`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '确认收货成功'
      })
      loadOrderDetails()
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '确认收货失败'
    })
  }
}

// 打开评价对话框
const openReview = (item: any) => {
  router.push(`/user/review?orderItemId=${item.orderItemId}`)
}

// 返回订单列表
const goBack = () => {
  router.push('/user/orders')
}

// 初始化
onMounted(() => {
  loadOrderDetails()
})
</script>

<style lang="scss" scoped>
.order-details-page {
  position: relative;
  min-height: 200px;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;

  .order-info {
    .order-status {
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 4px;
    }
  }

  .order-items {
    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .item-main {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;

        .item-info {
          flex: 1;

          .item-name {
            font-weight: 500;
            margin-bottom: 4px;
          }

          .item-sku {
            font-size: 0.9em;
            margin-bottom: 4px;
          }

          .item-price {
            .price {
              color: var(--q-primary);
              font-weight: 500;
              margin-right: 8px;
            }
            .quantity {
              color: #999;
            }
          }
        }
      }

      .item-actions {
        margin-left: 16px;
      }
    }
  }

  .order-amount {
    .text-negative {
      color: #ff4d4f;
    }
  }

  .order-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
