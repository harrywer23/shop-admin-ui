<template>
  <div class="checkout-page">
    <h1 class="text-h4 q-mb-lg">{{ t('checkout.title') }}</h1>

    <!-- 商品列表 -->
    <div class="order-items anime-card q-mb-lg">
      <div class="text-h6 q-mb-md">{{ t('checkout.itemList') }}</div>

      <!-- 加载状态 -->
      <div v-if="itemsLoading" class="text-center q-pa-md">
        <q-spinner color="primary" size="2em" />
        <div class="text-grey q-mt-sm">
          {{ t('common.loading') }}
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="itemsError" class="text-center text-negative q-pa-md">
        {{ itemsError }}
        <q-btn
          flat
          color="primary"
          :label="t('common.retry')"
          class="q-mt-sm"
          @click="loadCheckoutItems"
        />
      </div>

      <!-- 商品列表组件 -->
      <template v-else>
        <CartCheckoutItems
          :items="checkoutItems"
        />
      </template>
    </div>

    <!-- 订单备注 -->
    <div class="order-remark anime-card q-mb-lg">
      <div class="text-h6 q-mb-md">{{ t('checkout.orderRemark') }}</div>
      <q-input
        v-model="orderRemark"
        type="textarea"
        outlined
        :placeholder="t('checkout.remarkPlaceholder')"
        :rows="3"
      />
    </div>

    <!-- 收货地址部分，仅非虚拟商品显示 -->
    <template v-if="!isVirtualOrder">
      <div class="address-section anime-card q-mb-lg">
        <div class="text-h6 q-mb-md">{{ t('checkout.addressInfo.title') }}</div>
        <AddressManager
          v-model="selectedAddressId"
          @select="handleAddressSelect"
        />

        <!-- 添加当前选择的地址显示 -->
        <div v-if="selectedAddress" class="selected-address q-mt-md">
          <div class="text-subtitle2">{{ t('checkout.addressInfo.selected') }}:</div>
          <div class="address-detail q-pa-sm">
            <div>{{ selectedAddress.receiver }} - {{ selectedAddress.mobile }}</div>
            <div>{{ formatAddress(selectedAddress) }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- 支付方式 -->
    <div class="payment-method anime-card q-mb-lg">
      <div class="text-h6 q-mb-md">{{ t('checkout.payment.title') }}</div>
      <div class="payment-options">
        <!-- 余额支付选项 -->
        <div class="balance-payment">
          <q-radio
            v-model="paymentMethod"
            val="balance"
            :label="t('checkout.payment.balance')"
          >
            <template v-slot:default>
              <div class="balance-info">
                <span class="balance-label">{{ t('checkout.payment.currentBalance') }}:</span>
                <span class="balance-amount" :class="{ 'text-negative': Number(userBalance) < Number(totalAmount) }">
                  ¥{{ userBalance }}
                </span>
                <q-btn
                  v-if="Number(userBalance) < Number(totalAmount)"
                  flat
                  dense
                  color="primary"
                  :label="t('checkout.payment.recharge')"
                  class="q-ml-sm"
                  @click="goToRecharge"
                />
              </div>
            </template>
          </q-radio>
        </div>

        <!-- 其他支付式 -->
        <q-radio
          v-model="paymentMethod"
          val="alipay"
          :label="t('checkout.payment.alipay')"
        />
        <q-radio
          v-model="paymentMethod"
          val="wechat"
          :label="t('checkout.payment.wechat')"
        />
        <q-radio
          v-model="paymentMethod"
          val="paypal"
          :label="t('checkout.payment.paypal')"
        />
      </div>
    </div>

    <!-- 价格明细 -->
    <div class="price-detail anime-card q-mb-lg">
      <div class="text-h6 q-mb-md">{{ t('checkout.priceDetail.title') }}</div>

      <!-- 预售商品定金说明 -->
      <template v-if="hasPresellItems">
        <div class="presell-notice q-mb-md">
          <q-banner class="bg-warning text-dark">
            <template v-slot:avatar>
              <q-icon name="warning" color="warning" />
            </template>
            <div class="text-subtitle2 text-weight-medium">预售定金说明</div>
            <div class="text-caption q-mt-sm">
              1. 预售商品需支付定金：¥{{ presellDeposit }}
              <template v-if="checkoutItems.every(item => item.prodType === ProductType.PRESELL)">
                （当前仅需支付定金）
              </template>
            </div>
            <div class="text-caption">
              2. 定金支付后，订单生成24小时后取消订单将不予退还定金
            </div>
            <div class="text-caption">
              3. 尾款支付时间请留意商品详情页说明
            </div>
          </q-banner>
        </div>
      </template>

      <div class="price-list">
        <div class="price-item">
          <span>{{ t('checkout.priceDetail.subtotal') }}</span>
          <span>¥{{ subtotal }}</span>
        </div>
        <div class="price-item">
          <span>{{ t('checkout.priceDetail.shipping') }}</span>
          <span>¥{{ orderAmount.shippingFee }}</span>
        </div>

        <!-- 使用优惠券选择器组件 -->
        <CouponSelector
          :subtotal="Number(subtotal)"
          :category-ids="categoryIds"
          @update:discount="handleCouponDiscount"
        />

        <div class="divider"></div>

        <div class="price-item total">
          <span>{{ t('checkout.priceDetail.total') }}</span>
          <span class="text-primary text-h5">¥{{ calculateFinalAmount() }}</span>
          <template v-if="hasPresellItems && checkoutItems.every(item => item.prodType === ProductType.PRESELL)">
            <div class="text-caption text-grey-8">
              （当前为定金支付阶段）
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 订单提交 -->
    <div class="order-submit anime-card">
      <div class="row justify-between items-center">
        <div class="text-subtitle1">
          {{ t('checkout.totalItems', { count: totalItems }) }}
        </div>
        <q-btn
          color="primary"
          :label="hasPresellItems ? t('checkout.submit.presell') : t('checkout.submit.normal')"
          :loading="submitting"
          @click="submitOrder"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ProductType } from '~/utils/constants'
import type { CheckoutItem, Coupon, OrderAmount, OrderSubmitData } from '~/types/checkout'

import AddressManager from '~/components/address/AddressManager.vue'
import CartCheckoutItems from '~/components/checkout/CartCheckoutItems.vue'
import { useCheckoutItems } from '~/composables/useCheckoutItems'
import CouponSelector from '~/components/checkout/CouponSelector.vue'
import { useAddress } from '~/composables/useAddress'
import type { Address } from '~/types/address'
import {deleteCache, setCache} from "~/utils/storage";

// Composables
const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const { t } = useI18n()

// 状态定义
const orderRemark = ref('')
const paymentMethod = ref('balance')
const submitting = ref(false)
const userBalance = ref('0.00')

// 地址相关状态
const {
  selectedAddress,
  selectedAddressId
} = useAddress()

// 优惠券相关状态
const showCouponDialog = ref(false)
const selectedCoupon = ref<Coupon | null>(null)
// 根据来源获取结算商品
const checkoutItems = computed(() => {
  if (route.query.from === 'cart') {
    // 从 localStorage 获取购物车商品
    const cartItems = getCache('cartStore')
    return Array.isArray(cartItems) ? cartItems : []
  } else {
    // 直接购买商品
    const cartItems = getCache('cartStore')
    // console.log("cartItems:",cartItems)
    return Array.isArray(cartItems) ? cartItems : []
  }
})

// 订单金额
const orderAmount = ref<OrderAmount>({
  subtotal: 0,
  shippingFee: 0,
  discount: 0,
  couponDiscount: 0
})

// 计算属性
const isVirtualOrder = computed(() =>
  Array.isArray(checkoutItems.value) && checkoutItems.value.length > 0
    ? checkoutItems.value.every((item: CheckoutItem) => item.isVirtual === 1)
    : false
)

const hasPresellItems = computed(() =>
  Array.isArray(checkoutItems.value) && checkoutItems.value.length > 0
    ? checkoutItems.value.some((item: CheckoutItem) => item.prodType === ProductType.PRESELL)
    : false
)

const totalItems = computed(() =>
  Array.isArray(checkoutItems.value)
    ? checkoutItems.value.reduce((total: number, item: CheckoutItem) =>
        total + (item.quantity || 1), 0)
    : 0
)

// 计算商品小计
const subtotal = computed(() => {
  if (!Array.isArray(checkoutItems.value)) return '0.00'

  const total = checkoutItems.value.reduce((sum: number, item: CheckoutItem) => {
    const quantity = item.quantity || item.basketCount || 1
    let price = item.price

    switch (item.prodType) {
      case ProductType.PRESELL:
        price = item.presellDeposit || price
        break
      case ProductType.GROUP:
        price = item.groupPrice || price
        break
      case ProductType.SECKILL:
        price = item.seckillPrice || price
        break
    }

    return sum + (price * quantity)
  }, 0)

  return total.toFixed(2)
})
const totalAmount = computed(() => calculateFinalAmount())

// 计算预售定金总额
const presellDeposit = computed(() => {
  if (!Array.isArray(checkoutItems.value)) return '0.00'

  const total = checkoutItems.value.reduce((sum: number, item: CheckoutItem) => {
    if (item.prodType !== ProductType.PRESELL) return sum
    const quantity = item.quantity || item.basketCount || 1
    return sum + ((item.presellDeposit || 0) * quantity)
  }, 0)

  return total.toFixed(2)
})

// 计算最终支付金额
const calculateFinalAmount = () => {
  let baseAmount = Number(subtotal.value)

  // 如果全部是预售商品且是首次支付，只需支付定金
  if (hasPresellItems.value && checkoutItems.value.every(item => item.prodType === ProductType.PRESELL)) {
    baseAmount = Number(presellDeposit.value)
  }
  const total = baseAmount +
    orderAmount.value.shippingFee -
    orderAmount.value.discount -
    orderAmount.value.couponDiscount

  return total.toFixed(2)
}

// 获取用户余额
async function getUserBalance() {
  try {
    const response = await api.get('/admin/user/detail')
    const data = await response.data
    if (data.code === 200) {
      userBalance.value = formatAmount(data.data.balance)
    }
  } catch (error) {
    console.error('获取用户余额失败:', error)
  }
}

// 跳转到充值页面
function goToRecharge() {
  router.push('/recharge')
}

// 处理地址选择
function handleAddressSelect(address: Address) {
  selectedAddress.value = address
  selectedAddressId.value = address.id
  calculateFreight()
}


function selectCoupon(coupon: Coupon) {
  selectedCoupon.value = coupon
}

function confirmCoupon() {
  if (selectedCoupon.value) {
    orderAmount.value.couponDiscount = calculateCouponDiscount(selectedCoupon.value)
  }
  showCouponDialog.value = false
}

// 计算优惠券折扣金额
const calculateCouponDiscount = (coupon: Coupon): number => {
  if (coupon.couponType === 1) {
    // 减券
    return coupon.discount
  } else {
    // 折扣券
    const discount = Number(subtotal.value) * (1 - coupon.discount)
    return Math.min(discount, coupon.maxDiscount || discount)
  }
}
async function calculateFreight() {
  try {
    const OrderSubmitData = {
      items: checkoutItems.value.map(item => {
        const quantity = item.quantity || item.basketCount || 1
        let price = item.price

        switch (item.prodType) {
          case ProductType.PRESELL:
            return {
              ...item,
              price: item.presellPrice || price,
              deposit: item.presellDeposit || 0,
              quantity
            }
          case ProductType.GROUP:
            return {
              ...item,
              price: item.groupPrice || price,
              quantity
            }
          case ProductType.SECKILL:
            return {
              ...item,
              price: item.seckillPrice || price,
              quantity
            }
          default:
            return {
              ...item,
              price,
              quantity
            }
        }
      }),
      address: isVirtualOrder.value ? null : selectedAddress.value
    }
    const response = await api.post('/admin/transport/calculateFreight', JSON.stringify(OrderSubmitData))
    const data = await response.data
    if (data.code === 200) {
      orderAmount.value.shippingFee = data.data.freight;
    }else {
      orderAmount.value.shippingFee = 0;
    }
  } catch (error) {
    console.error('获取用户余额失败:', error);
  }
}
// 提交订单
async function submitOrder() {
  if (!isVirtualOrder.value && !selectedAddress.value) {
    $q.notify({
      type: 'warning',
      message: t('checkout.validation.addressRequired')
    })
    return
  }

  submitting.value = true
  try {
    const orderData: OrderSubmitData = {
      items: checkoutItems.value.map(item => {
        const quantity = item.quantity || item.basketCount || 1
        let price = item.price

        switch (item.prodType) {
          case ProductType.PRESELL:
            return {
              ...item,
              price: item.presellPrice || price,
              deposit: item.presellDeposit || 0,
              quantity
            }
          case ProductType.GROUP:
            return {
              ...item,
              price: item.groupPrice || price,
              quantity
            }
          case ProductType.SECKILL:
            return {
              ...item,
              price: item.seckillPrice || price,
              quantity
            }
          default:
            return {
              ...item,
              price,
              quantity
            }
        }
      }),
      address: isVirtualOrder.value ? null : selectedAddress.value,
      paymentMethod: paymentMethod.value,
      isPresell: hasPresellItems.value,
      totalAmount: calculateFinalAmount(),
      remark: orderRemark.value,
      isVirtual: isVirtualOrder.value,
      from: route.query.from as string || 'direct'
    }
    const response = await api.post('/admin/cart/checkout', JSON.stringify(orderData))
    const data = await response.data
    if (data.code === 200) {
      // 如果是从购物车来的,清空已购买的商品
      deleteCache("cartStore")
      setCache("checkout", data.data)
      $q.notify({
        type: 'positive',
        message: t('checkout.submit.success')
      })
      if(data.data.isPayed == 1){
        router.push({
          path: '/order/success',
          query: {
            orderNumber: data.data.orderNumbers,
            amount: data.data.amount

          }
        })
      }else {
        // 跳转到支付页面
        router.push({
          path: '/order/paymentCheckout',
          query: {
            orderNumber: data.data.orderNumber,
            amount: calculateFinalAmount(),
            method: paymentMethod.value,
            type: hasPresellItems.value ? 'presell' : 'normal'
          }
        })
      }
    } else {
      throw new Error(data.msg)
    }
  } catch (error) {
    console.error('提交订单失败:', error)
    $q.notify({
      type: 'negative',
      message: t('checkout.submit.error')
    })
  } finally {
    submitting.value = false
  }
}

// 使用商品加载composable
const {
  loading: itemsLoading,
  error: itemsError,
  loadCheckoutItems
} = useCheckoutItems()

// 初始化数据时加载商品信息
onMounted(async () => {
  try {
    await Promise.all([
      loadCheckoutItems(),
      getUserBalance()
    ])
  } catch (error) {
    console.error('初始化结算数据失败:', error)
    $q.notify({
      type: 'negative',
      message: t('checkout.error.initFailed')
    })
  }
})

// 结算来源
const checkoutSource = computed(() =>
  route.query.from as string || 'direct'
)

// 获取商品分类ID列表
const categoryIds = computed(() =>
  checkoutItems.value
    ?.map(item => item.categoryId?.toString()) // 转换为字符串
    .filter(Boolean) || []
)

// 处理优惠券折扣更新
function handleCouponDiscount(discount: number) {
  orderAmount.value.couponDiscount = discount
}

// 格式化地址显示
function formatAddress(address: Address): string {
  const parts = [
    address.country,
    address.province,
    address.city,
    address.addr
  ]
  if (address.addr2) {
    parts.push(address.addr2)
  }
  return parts.filter(Boolean).join(', ')
}

// 监听地址变化
watch(selectedAddress, (newAddress) => {
  //console.log('Checkout - selectedAddress 发生变化:', newAddress)
})

// 监听商品数据变化
watch(checkoutItems, (items) => {
  //console.log('结算商品数据更新:', items)
}, { immediate: true })
</script>

<style scoped lang="scss">
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.anime-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.balance-payment {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.3s ease;

  &:hover {
    background: #f0f1f2;
  }
}

.balance-info {
  display: inline-flex;
  align-items: center;
  margin-left: 16px;

  .balance-label {
    color: #666;
    margin-right: 8px;
  }

  .balance-amount {
    font-weight: 500;
    color: var(--q-primary);

    &.text-negative {
      color: #f56c6c;
    }
  }
}

.price-list {
  .price-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    &.total {
      margin-top: 20px;
      font-weight: 500;
      border-top: 1px solid #eee;
      padding-top: 12px;
    }
  }
}

.coupon-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coupon-list {
  max-height: 400px;
  overflow-y: auto;
}

.coupon-item {
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--q-primary);
    transform: translateY(-2px);
  }

  &.active {
    border-color: var(--q-primary);
    background-color: #f6f7ff;
  }
}

.coupon-info {
  .coupon-amount {
    font-size: 24px;
    color: var(--q-primary);
    font-weight: bold;
  }

  .coupon-title {
    margin: 8px 0;
    font-weight: 500;
  }

  .coupon-condition {
    font-size: 12px;
    color: #666;
  }

  .coupon-time {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
}

.no-coupon {
  text-align: center;
  padding: 20px;
  color: #999;
}

.order-submit {
  position: sticky;
  bottom: 20px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.selected-address {
  border: 1px solid #eee;
  border-radius: 4px;
  background: #f8f9fa;
}

.address-detail {
  color: #666;
  line-height: 1.5;
}

.presell-notice {
  .q-banner {
    border-radius: 8px;

    .text-subtitle2 {
      color: #7d5700;
    }

    .text-caption {
      color: #8b6200;
      line-height: 1.5;
    }
  }
}

// 响应式布局
@media (max-width: 768px) {
  .checkout-page {
    padding: 10px;
  }

  .anime-card {
    padding: 15px;
  }

  .coupon-item {
    padding: 12px;
  }

  .balance-info {
    flex-direction: column;
    align-items: flex-start;
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>
