<template>
  <div class="presell-payment q-pa-md">
    <div class="text-h5 q-mb-lg">{{ t('presell.payment.title') }}</div>

    <!-- 订单信息 -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">{{ t('presell.payment.orderInfo') }}</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <div class="text-grey">{{ t('presell.payment.orderNumber') }}：{{ order.presellOrder.orderNumber }}</div>
            <div class="text-grey">{{ t('presell.payment.orderTime') }}：{{ formatDate(order.presellOrder.createTime) }}</div>
            <div class="text-grey">{{ t('presell.payment.depositTime') }}：{{ formatDate(order.presellOrder.depositTime) }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="text-grey">{{ t('presell.payment.status') }}：{{ getPresellStatus(order.product.presellStatus) }}</div>
            <div class="text-grey">{{ t('presell.payment.finalStartTime') }}：{{ formatDate(order.product.presellFinalStartTime) }}</div>
            <div class="text-grey">{{ t('presell.payment.finalEndTime') }}：{{ formatDate(order.product.presellFinalEndTime) }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 商品信息 -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">{{ t('presell.payment.productInfo') }}</div>
        <div v-for="item in order.orderItems" :key="item.orderItemId" class="row items-center q-py-sm">
          <div class="col-8">
            <div class="row items-center">
              <q-img :src="getImageUrl(item.pic)" style="width: 80px; height: 80px" class="q-mr-md" />
              <div>
                <div>{{ item.prodName }}</div>
                <div class="text-grey">{{ item.skuName }}</div>
              </div>
            </div>
          </div>
          <div class="col-2 text-center">
            x{{ item.prodCount }}
          </div>
          <div class="col-2 text-right">
            ¥{{ (item.price || 0).toFixed(2) }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 收货地址 -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">{{ t('presell.payment.addressInfo') }}</div>
        <div v-if="order.addrInfo">
          <div>{{ order.addrInfo.receiver }} {{ order.addrInfo.mobile }}</div>
          <div class="text-grey">
            {{ formatAddress(order.addrInfo) }}
          </div>
        </div>
        <div v-else class="text-negative">
          {{ t('presell.payment.noAddress') }}
        </div>
      </q-card-section>
    </q-card>

    <!-- 费用明细 -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">{{ t('presell.payment.priceDetail') }}</div>
        <div class="row justify-between q-py-sm">
          <div>{{ t('presell.payment.totalPrice') }}</div>
          <div>¥{{ ((order.presellOrder?.finalAmount || 0) + (order.presellOrder?.depositAmount || 0)).toFixed(2) }}</div>
        </div>
        <div class="row justify-between q-py-sm">
          <div>{{ t('presell.payment.depositPaid') }}</div>
          <div class="text-grey">¥{{ (order.presellOrder?.depositAmount || 0).toFixed(2) }}</div>
        </div>
        <div class="row justify-between q-py-sm">
          <div>{{ t('presell.payment.finalPayment') }}</div>
          <div>¥{{ (order.presellOrder?.finalAmount || 0).toFixed(2) }}</div>
        </div>
        <div class="row justify-between q-py-sm">
          <div>{{ t('presell.payment.shipping') }}</div>
          <div>¥{{ (order.freightAmount || 0).toFixed(2) }}</div>
        </div>
        <q-separator class="q-my-sm" />
        <div class="row justify-between q-py-sm text-subtitle1">
          <div>{{ t('presell.payment.actualAmount') }}</div>
          <div class="text-negative">¥{{ getFinalPaymentAmount() }}</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 支付方式选择 -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">{{ t('presell.payment.paymentMethod') }}</div>
        <div class="payment-methods">
          <!-- 支付宝支付 -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-radio v-model="selectedPaymentMethod" val="alipay" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t('presell.payment.methods.alipay') }}</q-item-label>
              <q-item-label caption>
                {{ t('presell.payment.methods.alipayDesc') }}
              </q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-img src="/payment/alipay.png" width="40px" />
            </q-item-section>
          </q-item>

          <!-- PayPal支付 -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-radio v-model="selectedPaymentMethod" val="paypal" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t('presell.payment.methods.paypal') }}</q-item-label>
              <q-item-label caption>
                {{ t('presell.payment.methods.paypalDesc') }}
              </q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-img src="/payment/paypal.png" width="40px" />
            </q-item-section>
          </q-item>

          <!-- 微信支付 -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-radio v-model="selectedPaymentMethod" val="wechat" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t('presell.payment.methods.wechat') }}</q-item-label>
              <q-item-label caption>
                {{ t('presell.payment.methods.wechatDesc') }}
              </q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-img src="/payment/wechat.png" width="40px" />
            </q-item-section>
          </q-item>

          <!-- 余额支付 -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-radio v-model="selectedPaymentMethod" val="balance" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t('presell.payment.methods.balance') }}</q-item-label>
              <q-item-label caption>
                {{ t('presell.payment.balance') }}: ¥{{ userBalance.toFixed(2) }}
              </q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-icon name="account_balance_wallet" size="40px" />
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
    </q-card>

    <!-- 支付按钮 -->
    <div class="row justify-end q-mt-lg">
      <q-btn
        color="primary"
        :label="t('presell.payment.payNow')"
        :loading="loading"
        :disable="!selectedPaymentMethod"
        @click="handlePayment"
      />
    </div>
  </div>
  <!-- PayPal支付对话框 -->
  <q-dialog v-model="paypalDialog">
    <q-card style="width: 90vw; max-width: 800px">
      <payapl-card
        :amount="getFinalPaymentAmount()"
        :items="[{
          orderId: order.presellOrder.orderId,
          orderNumber: order.presellOrder.orderNumber,
          prodName: order.orderItems[0]?.prodName || '',
          amount: Number(getFinalPaymentAmount()),
          kind: 4
        }]"
        :intro="order.presellOrder.orderNumber"
        product-name="预售��单尾款支付"
        :url="'/presell/order/success'"
        @payment-success="handlePaypalSuccess"
        @payment-cancel="handlePaypalCancel"
      />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { date } from 'quasar'
import { api } from '~/utils/axios'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import AlipayComponent from '~/components/payment/AlipayComponent.vue'
import PayaplCard from "~/components/payment/PaypalCardComponent.vue";

const { t } = useI18n()
const $q = useQuasar()

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const paypalDialog = ref(false)
const checkOrder = ref({})
// 定义接口类型
interface PresellProduct {
  deliveryTemplateId:number,
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

interface AddressInfo {
  addrOrderId: number
  addrId: number
  userId: number
  receiver: string
  provinceId: number
  province: string
  areaId: number
  area: string
  cityId: number
  city: string
  addr: string
  postCode: string
  mobile: string
  createTime: string
  version: number
  addr2: string
  country: string
  countryId: number
  email: string
}

// 修改订单数据的ref定义
const order = ref({
  product: {
    deliveryTemplateId:0,
    prodId: 0,
    prodName: '',
    pic: '',
    presellStatus: false,
    presellStartTime: '',
    presellEndTime: '',
    presellDeliveryTime: '',
    presellFinalStartTime: '',
    presellFinalEndTime: '',
    prodType: 0,
    translations: '',
    quality: ''
  } as PresellProduct,
  presellOrder: {
    presellOrderId: 0,
    orderId: 0,
    orderNumber: '',
    prodId: 0,
    skuId: 0,
    userId: 0,
    depositAmount: 0,
    finalAmount: 0,
    depositTime: '',
    finalTime: '',
    depositStatus: 0,
    finalStatus: 0,
    deliveryTime: '',
    status: 0,
    createTime: '',
    updateTime: ''
  } as PresellOrder,
  orderItems: [] as OrderItem[],
  addrInfo: null as AddressInfo | null,
  freightAmount: 0
})

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 格式化地址
const formatAddress = (address: any) => {
  if (!address) return ''
  return `${address.province} ${address.city} ${address.area} ${address.addr}`
}

// 获取预售状态文本
const getPresellStatus = (status: boolean) => {
  if (order.value.presellOrder.finalStatus === 1) {
    return '尾款已支付'
  }
  if (order.value.presellOrder.depositStatus === 1) {
    return '待付尾款'
  }
  return status ? '预售中' : '已结束'
}

// 修改加载订单数据函数
const loadOrder = async () => {
  try {
    const orderNumber = route.query.orderNumber
    if (!orderNumber) {
      throw new Error('订单编号不能为空')
    }

    const response = await api.get(`/admin/presell/order/getIntro/${orderNumber}`)
    if (response.data.code === 200) {
      const { product, presellOrder, orderItems, addrInfo } = response.data.data
      order.value = {
        product,
        presellOrder,
        orderItems: orderItems || [],
        addrInfo,
        freightAmount: 0
      }
      // 如果有地址信息，计算运费
      if (addrInfo) {
        await calculateFreight()
      }
    } else {
      throw new Error(response.data.msg || '加载订单失败')
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '加载订单失败'
    })
  }
}

// 修改运费计算函数
const calculateFreight = async () => {
  if (!order.value.addrInfo) return

  try {
    const depositPerItem = order.value.orderItems.length > 0
      ? (order.value.presellOrder?.depositAmount || 0) / order.value.orderItems.length
      : 0

    const orderItems = order.value.orderItems.map(item => ({
      prodId: item.prodId,
      prodName: item.prodName,
      skuId: item.skuId,
      skuName: item.skuName,
      price: item.price,
      pic: item.pic,
      quantity: item.prodCount,
      basketCount: item.prodCount,
      presellStatus: true,
      prodType: 4, // 预售商品类型
      // 预售商品特殊处理
      presellPrice: item.price,
      presellDeposit: depositPerItem,
      // 其他必要字段
      oriPrice: item.price,
      deliveryTemplateId: order.value.product.deliveryTemplateId,
      seckillPrice: 0,
      groupPrice: 0,
      groupMinNum: 0,
      from: 'presell',
      weight: 0,
      volume: 0,
      isVirtual: 0,
      isSkuItem: item.isSkuItem ? 1 : 0
    }))

    const submitData = {
      items: orderItems,
      address: order.value.addrInfo
    }

    const response = await api.post('/admin/transport/pressllCalculateFreight', submitData)
    if (response.data.code === 200) {
      order.value.freightAmount = response.data.data.freight
    } else {
      throw new Error(response.data.msg || '计算运费失败')
    }
  } catch (error) {
    console.error('计算运费失败:', error)
    order.value.freightAmount = 0
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '计算运费失败'
    })
  }
}

// 修改计算最终支付金额函数
const getFinalPaymentAmount = () => {
  const finalAmount = Number(order.value.presellOrder?.finalAmount || 0)
  const freightAmount = Number(order.value.freightAmount || 0)
  return (finalAmount + freightAmount).toFixed(2)
}

// 检查是否可以支付尾款
const canPayFinal = computed(() => {
  const now = new Date().getTime()
  const startTime = new Date(order.value.product.presellFinalStartTime).getTime()
  const endTime = new Date(order.value.product.presellFinalEndTime).getTime()

  return now >= startTime && now <= endTime &&
         order.value.presellOrder.depositStatus === 1 &&
         order.value.presellOrder.finalStatus === 0
})

// 支付方式
const selectedPaymentMethod = ref<'alipay' | 'paypal' | 'wechat' | 'balance' | null>(null)
const userBalance = ref(0)

// 加载用户余额
const loadUserBalance = async () => {
  try {
    const response = await api.get('/user/balance')
    if (response.data.code === 200) {
      userBalance.value = response.data.data
    }
  } catch (error) {
    console.error('获取用户余额失败:', error)
  }
}

// 修改支付处理函数
const handlePayment = async () => {
// 检查是否可以支付尾款

//   if (!canPayFinal.value) {
//     $q.notify({
//       type: 'warning',
//       message: t('presell.payment.outOfPaymentTime')
//     })
//     return
//   }

  if (!order.value.addrInfo) {
    $q.notify({
      type: 'warning',
      message: t('presell.payment.noAddress')
    })
    return
  }

  if (!selectedPaymentMethod.value) {
    $q.notify({
      type: 'warning',
      message: t('presell.payment.selectPaymentMethod')
    })
    return
  }

  // PayPal支付特殊处理
  if (selectedPaymentMethod.value === 'paypal') {
    paypalDialog.value = true
    return
  }

  loading.value = true
  try {
    const paymentData = {
      orderId: order.value.presellOrder.orderId,
      orderNumber: order.value.presellOrder.orderNumber,
      amount: getFinalPaymentAmount(),
      freightAmount: order.value.freightAmount,
      paymentMethod: selectedPaymentMethod.value
    }

    const response = await api.post('/admin/paypal/pay', {
      amount:  getFinalPaymentAmount(),
       items:[{
           orderId: order.value.presellOrder.orderId,
           orderNumber: order.value.presellOrder.orderNumber,
           prodName: order.value.orderItems[0]?.prodName || '',
            amount: Number(getFinalPaymentAmount()),
           kind: 4
       }]
    })

    if (response.data.code === 200) {
      if (selectedPaymentMethod.value === 'balance') {
        // 余��支付直接跳转成功页
        router.push({
          path: '/order/success',
          query: {
            orderNumber: order.value.presellOrder.orderNumber,
            type: 'presell',
            amount: getFinalPaymentAmount()
          }
        })
      } else if (selectedPaymentMethod.value === 'alipay') {
        // 支付宝支付 - 使用表单提交
        const form = document.createElement('form')
        form.setAttribute('method', 'post')
        form.setAttribute('action', response.data.data.payUrl)

        // 添加支付宝所需参数
        Object.entries(response.data.data.formData).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.setAttribute('type', 'hidden')
          input.setAttribute('name', key)
          input.setAttribute('value', value as string)
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
        document.body.removeChild(form)
      } else if (selectedPaymentMethod.value === 'paypal') {
        // PayPal支付 - 跳转到PayPal页面
        window.location.href = response.data.data.payUrl
      } else {
        // 其他支付方式跳转
        window.location.href = response.data.data.payUrl
      }
    } else {
      throw new Error(response.data.msg || t('presell.payment.paymentFailed'))
    }
  } catch (error) {
    console.error('支付失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('presell.payment.paymentFailed')
    })
  } finally {
    loading.value = false
  }
}

// PayPal支付成功回调
const handlePaypalSuccess = () => {
  paypalDialog.value = false
  router.push({
    path: '/order/success',
    query: {
      orderNo: order.value.presellOrder.orderNumber,
      type: 'presell',
      amount: getFinalPaymentAmount()
    }
  })
}

// PayPal支付取消回调
const handlePaypalCancel = () => {
  paypalDialog.value = false
  $q.notify({
    type: 'warning',
    message: t('presell.payment.paypalCancelled')
  })
}

// 初始化
onMounted(() => {
  loadOrder()
  loadUserBalance()
})
</script>

<style lang="scss" scoped>
.presell-payment {
  max-width: 800px;
  margin: 0 auto;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}
</style>
