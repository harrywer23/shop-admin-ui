<template>
  <div class="presell-detail-page">
    <div class="page-container">
      <h1 class="text-h5 q-mb-lg">{{ t('presell.detail.title') }}</h1>

      <!-- 预售活动信息 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('presell.detail.activityInfo') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="info-item">
                <span class="label">{{ t('presell.detail.activityName') }}:</span>
                <span class="value">{{ product.prodName }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('presell.detail.depositStartTime') }}:</span>
                <span class="value">{{ formatDate(product.presellStartTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('presell.detail.depositEndTime') }}:</span>
                <span class="value">{{ formatDate(product.presellEndTime) }}</span>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="info-item">
                <span class="label">{{ t('presell.detail.finalStartTime') }}:</span>
                <span class="value">{{ formatDate(product.presellFinalStartTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('presell.detail.finalEndTime') }}:</span>
                <span class="value">{{ formatDate(product.presellFinalEndTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('presell.detail.deliveryTime') }}:</span>
                <span class="value">{{ formatDate(product.presellDeliveryTime) }}</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 商品信息 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('presell.detail.productInfo') }}</div>
          <div class="row q-col-gutter-md items-center">
            <div class="col-auto">
              <q-img
                :src="getImageUrl(product.pic)"
                style="width: 120px; height: 120px"
                class="rounded-borders"
              />
            </div>
            <div class="col">
              <div class="text-h6">{{ product.prodName }}</div>
              <div class="text-subtitle2 q-mt-sm">{{ product.skuName }}</div>
              <div class="row q-mt-md">
                <div class="col">
                  <div class="text-subtitle2">{{ t('presell.detail.depositAmount') }}</div>
                  <div class="text-h6 text-primary">¥{{ order.depositAmount }}</div>
                </div>
                <div class="col">
                  <div class="text-subtitle2">{{ t('presell.detail.finalAmount') }}</div>
                  <div class="text-h6 text-primary">¥{{ order.finalAmount }}</div>
                </div>
                <div class="col">
                  <div class="text-subtitle2">{{ t('presell.detail.totalAmount') }}</div>
                  <div class="text-h6 text-primary">¥{{ order.depositAmount+order.finalAmount }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 订单信息 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('presell.detail.orderInfo') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="info-item">
                <span class="label">{{ t('presell.detail.orderNumber') }}:</span>
                <span class="value">{{ order.orderNumber }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('presell.detail.createTime') }}:</span>
                <span class="value">{{ formatDate(order.createTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('presell.detail.status') }}:</span>
                <span class="value">{{ getStatusText(order.status) }}</span>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="info-item">
                <span class="label">{{ t('presell.detail.depositPayTime') }}:</span>
                <span class="value">{{ formatDate(order.depositPayTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('presell.detail.finalPayTime') }}:</span>
                <span class="value">{{ formatDate(order.finalPayTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('presell.detail.receiveTime') }}:</span>
                <span class="value">{{ formatDate(order.receiveTime) }}</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 收货信息 -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('presell.detail.deliveryInfo') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="info-item">
                <span class="label">{{ t('presell.detail.receiver') }}:</span>
                <span class="value">{{ order.receiver }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('presell.detail.mobile') }}:</span>
                <span class="value">{{ order.mobile }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('presell.detail.address') }}:</span>
                <span class="value">{{ order.address }}</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 操作按钮 -->
      <div class="row justify-end q-mt-lg q-gutter-sm">
        <!-- 支付定金按钮 -->
        <q-btn
          v-if="order.status === 0"
          color="primary"
          :label="t('presell.payment.payDeposit')"
          @click="navigateToPayment(3)"
        />

        <!-- 支付尾款按钮 -->
        <q-btn
          v-if="order.status === 1"
          color="primary"
          :label="t('presell.payment.payFinal')"
          @click="navigateToPayment(4)"
        />

        <!-- 确认收货按钮 -->
<!--        <q-btn-->
<!--          v-if="order.status === 3"-->
<!--          color="primary"-->
<!--          :label="t('order.confirmReceive')"-->
<!--          @click="confirmReceive"-->
<!--        />-->

        <!-- 取消订单按钮 -->
<!--        <q-btn-->
<!--          v-if="order.status === 0"-->
<!--          color="grey"-->
<!--          :label="t('order.cancel')"-->
<!--          @click="cancelOrder"-->
<!--        />-->
      </div>
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
import { shanghaiToLocal } from '~/utils/format'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()

interface PresellActivity {
  activityId: number
  activityName: string
  depositStartTime: string
  depositEndTime: string
  finalStartTime: string
  finalEndTime: string
  deliveryTime: string
}

interface PresellProduct {
  prodId: number
  prodName: string
  skuId: number
  skuName: string
  pic: string
  depositAmount: number
  finalAmount: number
}

interface PresellOrder {
  presellOrderId: number
  orderId: number
  orderNumber: string
  prodId: number
  skuId: number
  userId: number
  depositAmount: number
  finalAmount: number
  depositTime: string
  finalTime: string
  depositStatus: number
  finalStatus: number
  deliveryTime: string
  status: number
  createTime: string
  updateTime: string
}

interface Product {
  prodId: number
  prodName: string
  pic: string
  presellStatus: boolean
  presellStartTime: string
  presellEndTime: string
  presellDeliveryTime: string
  presellFinalStartTime: string
  presellFinalEndTime: string
  prodType: number
  translations: string
  quality: string
}

interface OrderItem {
  orderItemId: number
  shopId: number
  orderNumber: string
  prodId: number
  skuId: number
  prodCount: number
  prodName: string
  skuName: string
  pic: string
  price: number
  userId: number
  productTotalAmount: number
  recTime: string
  commSts: number
  distributionCardNo: string
  basketDate: string
  prodType: number
  isSkuItem: boolean
}

interface OrderInfo {
  orderInfo: {
    orderId: number
    orderNumber: string
    total: number
    actualTotal: number
    status: number
    createTime: string
    payTime: string
    dvyTime: string
    finallyTime: string
    cancelTime: string
    orderItems: OrderItem[]
  }
  addrInfo: {
    receiver: string
    mobile: string
    province: string
    city: string
    area: string
    addr: string
    addr2: string
  }
}

const activity = ref<PresellActivity>({} as PresellActivity)
const presellOrder = ref<PresellOrder>({} as PresellOrder)
const product = ref<Product>({} as Product)
const orderInfo = ref<OrderInfo>({} as OrderInfo)

// 初始化 order 对象
const order = ref({
  orderNumber: '',
  depositAmount: 0,
  finalAmount: 0,
  totalAmount: 0,
  createTime: '',
  depositPayTime: '',
  finalPayTime: '',
  receiveTime: '',
  status: 0,
  receiver: '',
  mobile: '',
  address: ''
})

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return t('presell.status.unpaidDeposit')
    case 1:
      return t('presell.status.unpaidFinal')
    case 2:
      return t('presell.status.paid')
    case 3:
      return t('presell.status.shipped')
    case 4:
      return t('presell.status.completed')
    case 5:
      return t('presell.status.cancelled')
    default:
      return t('presell.status.unknown')
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return shanghaiToLocal(dateStr)
}

// 普通订单跳转到支付页面
const navigateToPayment = (type) => {
  router.push(`/presell/payment?orderNumber=${order.value.orderNumber}&kind=${type}`)
}

// 跳转到支付页面
// const navigateToPayment = (type: 'deposit' | 'final') => {
//   router.push({
//     path: '/user/presell/payment',
//     query: {
//       orderId: route.params.id,
//       type
//     }
//   })
// }

// 确认收货
const confirmReceive = async () => {
  try {
    await $q.dialog({
      title: t('order.confirmReceive'),
      message: t('order.confirmReceiveMessage'),
      cancel: true,
      persistent: true
    })

    const response = await api.get(`/admin/presell/order/eceive/${route.params.id}`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('order.receiveSuccess')
      })
      loadOrderInfo()
    }
  } catch (error) {
    console.error('确认收货失败:', error)
  }
}

// 取消订单
// const cancelOrder = async () => {
//   try {
//     await $q.dialog({
//       title: t('order.cancel'),
//       message: t('order.cancelConfirm'),
//       cancel: true,
//       persistent: true
//     })
//
//     const response = await api.get(`/admin/presell/order/cancel/${route.params.id}`)
//     if (response.data.code === 200) {
//       $q.notify({
//         type: 'positive',
//         message: t('order.cancelSuccess')
//       })
//       loadOrderInfo()
//     }
//   } catch (error) {
//     console.error('取消订��失败:', error)
//   }
// }
// 获取订单详情
const loadOrderDetails = async () => {
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
  }
}
// 加载订单信息
const loadOrderInfo = async () => {
  try {
    const orderId = route.query.id
    const response = await api.get(`/admin/presell/order/detail/${orderId}`)
    if (response.data.code === 200) {
      const { data } = response.data
      presellOrder.value = data.presellOrder
      product.value = data.product
      orderInfo.value = data.order

      // 更新模板中使用的数据
      order.value = {
        orderNumber: data.order.orderInfo.orderNumber,
        depositAmount: data.presellOrder.depositAmount,
        finalAmount: data.presellOrder.finalAmount,
        totalAmount: data.order.orderInfo.total,
        createTime: data.order.orderInfo.createTime,
        depositPayTime: data.presellOrder.depositTime,
        finalPayTime: data.presellOrder.finalTime,
        receiveTime: data.presellOrder.deliveryTime,
        status: data.presellOrder.status,
        receiver: data.order.addrInfo.receiver,
        mobile: data.order.addrInfo.mobile,
        address: formatAddress(data.order.addrInfo)
      }
    }
  } catch (error) {
    console.error('获取订单信息失败:', error)
    $q.notify({
      type: 'negative',
      message: t('presell.detail.error.loadFailed')
    })
  }
}

// 添加地址格式化函数
const formatAddress = (addrInfo: any) => {
  const parts = [
    addrInfo.province,
    addrInfo.city,
    addrInfo.area,
    addrInfo.addr,
    addrInfo.addr2
  ]
  return parts.filter(Boolean).join(' ')
}

onMounted(() => {
  loadOrderInfo()
})
</script>

<style lang="scss" scoped>
.presell-detail-page {
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
  }
}
</style>
