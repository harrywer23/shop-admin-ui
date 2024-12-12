<template>
  <div class="order-details-page">
    <h1 class="text-h4 q-mb-lg">{{ t('order.detail.title') }}</h1>

    <!-- 订单基本信息 -->
    <div class="order-info q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-subtitle1">{{ t('order.detail.orderNumber') }}：{{ order.orderNumber }}</div>
              <div class="text-caption text-grey-7">{{ t('order.detail.orderTime') }}：{{ formatDateTime(order.createTime) }}</div>
            </div>
            <div class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusLabel(order.status) }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 收货地址信息 -->
    <div class="shipping-info q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('order.detail.shippingInfo') }}</div>
          <div class="shipping-details" v-if="order.addrOrderVo">
            <div class="row q-col-gutter-md">
              <!-- 收件人信息 -->
              <div class="col-12 col-md-6">
                <div class="contact-info">
                  <div class="text-subtitle2 q-mb-sm">{{ t('order.detail.contactInfo') }}</div>
                  <div class="q-mb-xs">
                    <span class="text-grey">{{ t('checkout.contactInfo.name') }}：</span>
                    {{ order.addrOrderVo.receiver }}
                  </div>
                  <div class="q-mb-xs">
                    <span class="text-grey">{{ t('checkout.contactInfo.phone') }}：</span>
                    {{ order.addrOrderVo.mobile }}
                  </div>
                  <div class="q-mb-xs">
                    <span class="text-grey">{{ t('checkout.contactInfo.email') }}：</span>
                    {{ order.addrOrderVo.email }}
                  </div>
                </div>
              </div>

              <!-- 地址信息 -->
              <div class="col-12 col-md-6">
                <div class="address-info">
                  <div class="text-subtitle2 q-mb-sm">{{ t('order.detail.addressInfo') }}</div>
                  <div class="q-mb-xs">
                    <span class="text-grey">{{ t('checkout.addressInfo.country') }}：</span>
                    {{ order.addrOrderVo.country }}
                  </div>
                  <div class="q-mb-xs">
                    <span class="text-grey">{{ t('checkout.addressInfo.province') }}：</span>
                    {{ order.addrOrderVo.province }}
                  </div>
                  <div class="q-mb-xs">
                    <span class="text-grey">{{ t('checkout.addressInfo.city') }}：</span>
                    {{ order.addrOrderVo.city }}
                  </div>
                  <div class="q-mb-xs">
                    <span class="text-grey">{{ t('checkout.addressInfo.zipCode') }}：</span>
                    {{ order.addrOrderVo.postCode }}
                  </div>
                  <div class="q-mb-xs">
                    <span class="text-grey">{{ t('checkout.addressInfo.address1') }}：</span>
                    {{ order.addrOrderVo.addr }}
                  </div>
                  <div v-if="order.addrOrderVo.addr2" class="q-mb-xs">
                    <span class="text-grey">{{ t('checkout.addressInfo.address2') }}：</span>
                    {{ order.addrOrderVo.addr2 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 商品列表 -->
    <div class="order-items q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('order.detail.productList') }}</div>
          <div v-for="item in order.orderItems" :key="item.orderItemId" class="order-item">
            <div class="item-main cursor-pointer" @click="goToProduct(item.prodId)">
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
                :label="t('order.detail.review')"
                @click="openReview(item)"
              />
              <q-btn
                v-else-if="item.commSts"
                flat
                color="grey"
                :label="t('order.detail.reviewed')"
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
            <span>{{ t('order.detail.totalAmount') }}</span>
            <span>¥{{ order.total }}</span>
          </div>
          <div class="row justify-between q-mb-sm">
            <span>{{ t('order.detail.shipping') }}</span>
            <span>¥{{ order.freightAmount }}</span>
          </div>
          <div class="row justify-between q-mb-sm">
            <span>{{ t('order.detail.discount') }}</span>
            <span class="text-negative">-¥{{ order.reduceAmount || 0 }}</span>
          </div>
          <div class="row justify-between text-weight-bold">
            <span>{{ t('order.detail.actualAmount') }}</span>
            <span class="text-primary">¥{{ order.actualTotal }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 订单状态时间线 -->
    <div class="order-timeline q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('order.detail.orderStatus') }}</div>
          <q-timeline color="primary">
            <q-timeline-entry
              v-if="order.createTime"
              :title="t('order.detail.orderCreated')"
              :subtitle="formatDateTime(order.createTime)"
            />
            <q-timeline-entry
              v-if="order.payTime"
              :title="t('order.detail.paymentCompleted')"
              :subtitle="formatDateTime(order.payTime)"
            />
            <q-timeline-entry
              v-if="order.dvyTime"
              :title="t('order.detail.productShipped')"
              :subtitle="formatDateTime(order.dvyTime)"
            />
            <q-timeline-entry
              v-if="order.finallyTime"
              :title="t('order.detail.orderCompleted')"
              :subtitle="formatDateTime(order.finallyTime)"
            />
            <q-timeline-entry
              v-if="order.cancelTime"
              color="negative"
              :title="t('order.detail.orderCancelled')"
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
        :label="t('order.detail.backToList')"
        @click="goBack"
        class="q-mr-sm"
      />

      <!-- 待付款状态显示付款按钮 -->
      <q-btn
        v-if="order.status === OrderStatus.UNPAID"
        color="primary"
        :label="t('order.detail.pay')"
        @click="goToPay"
      />

      <!-- 待收货状态显示确认收货按钮 -->
      <q-btn
        v-if="order.status === OrderStatus.SHIPPED"
        outline
        color="primary"
        :label="t('order.detail.confirmReceipt')"
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
import { useI18n } from 'vue-i18n'
import { OrderStatus } from '~/utils/constants'
import { api } from '~/utils/axios'

const { t } = useI18n()

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
  orderItems: [] as any[],
  addrOrderVo: null as any
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
    case OrderStatus.UNPAID: return t('order.status.unpaid')
    case OrderStatus.PAID: return t('order.status.paid')
    case OrderStatus.SHIPPED: return t('order.status.shipped')
    case OrderStatus.COMPLETED: return t('order.status.completed')
    case OrderStatus.CANCELLED: return t('order.status.cancelled')
    default: return t('order.status.unknown')
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
  loading.value = true
  try {
    const response = await api.get(`/admin/order/info?orderNumber=${route.params.id}`)
    const { code, data } = response.data
    if (code === 200) {
      order.value = data
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    $q.notify({
      type: 'negative',
      message: t('order.detail.loadFailed')
    })
  } finally {
    loading.value = false
  }
}

// 普通订单跳转到支付页面
const goToPay = (order: any) => {
  router.push(`/order/payment?orderNumber=${order.orderNumber}&kind=1`)
}

// 确认收货
const confirmReceipt = async () => {
  try {
    const response = await api.post(`/admin/order/confirm/${order.value.orderId}`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('order.detail.confirmReceiptSuccess')
      })
      loadOrderDetails()
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('order.detail.confirmReceiptFailed')
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

// 跳转到商品详情
const goToProduct = (prodId: number) => {
  router.push(`/product/detail?prodId=${prodId}`)
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
        transition: all 0.3s ease;

        &:hover {
          opacity: 0.8;
        }

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

  .shipping-info {
    .shipping-details {
      .contact-info, .address-info {
        padding: 12px;
        background-color: #f8f8f8;
        border-radius: 4px;
      }
    }
  }
}
</style>
