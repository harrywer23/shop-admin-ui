import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CheckoutItem, Address, Coupon, OrderAmount } from '~/types/checkout'
import { ProductType } from '~/utils/constants'
import { handleDirectCheckout, handleCartCheckout } from '~/utils/checkoutHandler'

export const useCheckoutStore = defineStore('checkout', () => {
  // 状态
  const checkoutItems = ref<CheckoutItem[]>([])
  const selectedAddress = ref<Address | null>(null)
  const selectedCoupon = ref<Coupon | null>(null)
  const orderAmount = ref<OrderAmount>({
    subtotal: 0,
    shippingFee: 0,
    discount: 0,
    couponDiscount: 0
  })

  // 计算属性
  const isVirtualOrder = computed(() =>
    checkoutItems.value.every(item => item.isVirtual === 1)
  )

  const hasPresellItems = computed(() =>
    checkoutItems.value.some(item => item.prodType === ProductType.PRESELL)
  )

  const subtotal = computed(() =>
    checkoutItems.value.reduce((total, item) =>
      total + item.price * item.quantity, 0
    ).toFixed(2)
  )

  const totalAmount = computed(() => {
    const total = Number(subtotal.value) +
      orderAmount.value.shippingFee -
      orderAmount.value.discount -
      orderAmount.value.couponDiscount
    return total.toFixed(2)
  })

  // 方法
  async function initCheckoutData(params: {
    from: string
    prodId?: string | number
    skuId?: string | number
    quantity?: number
  }) {
    try {
      if (params.from === 'direct') {
        checkoutItems.value = await handleDirectCheckout(
          params.prodId!,
          params.skuId,
          params.quantity
        )
      } else {
        const cartItemsStr = localStorage.getItem('cartStore');
        const cartItems=ref([]);
        if(cartItemsStr !=null){
          JSON.parse(cartItems);
        }
        //console.log('UseCheckoutItems  JS out:',cartItems)
        checkoutItems.value = await handleCartCheckout(cartItems)
      }
    } catch (error) {
      console.error('初始化结算数据失败:', error)
      throw error
    }
  }

  function setSelectedAddress(address: Address) {
    selectedAddress.value = address
  }

  function setSelectedCoupon(coupon: Coupon) {
    selectedCoupon.value = coupon
    if (coupon) {
      orderAmount.value.couponDiscount = calculateCouponDiscount(coupon)
    } else {
      orderAmount.value.couponDiscount = 0
    }
  }

  function calculateCouponDiscount(coupon: Coupon): number {
    if (coupon.couponType === 1) {
      return coupon.discount
    } else {
      const discount = Number(subtotal.value) * (1 - coupon.discount)
      return Math.min(discount, coupon.maxDiscount || discount)
    }
  }

  function reset() {
    checkoutItems.value = []
    selectedAddress.value = null
    selectedCoupon.value = null
    orderAmount.value = {
      subtotal: 0,
      shippingFee: 0,
      discount: 0,
      couponDiscount: 0
    }
  }

  return {
    checkoutItems,
    selectedAddress,
    selectedCoupon,
    orderAmount,
    isVirtualOrder,
    hasPresellItems,
    subtotal,
    totalAmount,
    initCheckoutData,
    setSelectedAddress,
    setSelectedCoupon,
    reset
  }
})
