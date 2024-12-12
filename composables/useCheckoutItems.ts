import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { handleDirectCheckout } from '~/utils/checkout'
import type { CheckoutItem } from '~/types/checkout'
import { getCache } from '~/utils/storage'

export function useCheckoutItems() {
  const route = useRoute()

  const checkoutItems = ref<CheckoutItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 加载结算商品信息
  async function loadCheckoutItems() {
    loading.value = true
    error.value = null

    try {
      const source = route.query.from as string || 'direct'

      if (source === 'direct') {
        const prodId = route.query.prodId as string
        const skuId = route.query.skuId as string
        const quantity = Number(route.query.quantity) || 1

        checkoutItems.value = await handleDirectCheckout(prodId, skuId, quantity)
      } else {
        // 从 localStorage 获取购物车数据
        const cartItems = getCache('cartStore')

        // 验证购物车数据
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
          throw new Error('购物车中没有商品')
        }

        //console.log('UseCheckoutItems - 购物车数据:', cartItems)
        // 直接使用购物车数据
        checkoutItems.value = cartItems.map(item => ({
          prodId: item.prodId,
          skuId: item.skuId || undefined,
          prodName: item.prodName,
          price: item.price,
          quantity: item.basketCount,
          pic: item.pic,
          properties: item.skuName,
          prodType: item.prodType,
          basketCount: item.basketCount,
          isVirtual: 0,
          categoryId: undefined,
        }))
      }
    } catch (err) {
      console.error('加载结算商品失败:', err)
      error.value = err instanceof Error ? err.message : '加载结算商品失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    checkoutItems,
    loading,
    error,
    loadCheckoutItems
  }
}
