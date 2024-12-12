<template>
  <div class="checkout-items">
    <!-- 加载状态 -->
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="2em" />
      <div class="text-grey q-mt-sm">{{ t('common.loading') }}</div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="text-center text-negative q-pa-md">
      {{ error }}
      <q-btn
        flat
        color="primary"
        :label="t('common.retry')"
        class="q-mt-sm"
        @click="loadDirectCheckoutItems"
      />
    </div>

    <!-- 商品列表 -->
    <template v-else>
      <q-list separator>
        <q-item v-for="item in items" :key="item.skuId || item.prodId">
          <q-item-section avatar>
            <q-img :src="getImageUrl(item.pic)" style="width: 80px; height: 80px" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ item.prodName }}</q-item-label>
            <q-item-label caption v-if="item.properties">
              {{ item.properties }}
            </q-item-label>
            <q-item-label class="text-primary">
              <PriceDisplay :item="item" />
              × {{ item.quantity }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="text-subtitle1 text-primary">
              ¥{{ calculateItemTotal(item) }}
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { CheckoutItem } from '~/types/checkout'
import PriceDisplay from './PriceDisplay.vue'

const route = useRoute()
const { t } = useI18n()

const items = ref<CheckoutItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// 加载直接购买的商品信息
async function loadDirectCheckoutItems() {
  loading.value = true
  error.value = null

  try {
    const prodId = route.query.prodId as string
    const skuId = route.query.skuId as string
    const quantity = Number(route.query.quantity) || 1

    // 获取商品信息
    const prodResponse = await fetch(`/api/prod/detail?id=${prodId}`)
    const prodData = await prodResponse.json()

    if (prodData.code !== 200) {
      throw new Error(prodData.msg || '获取商品信息失败')
    }

    const product = prodData.data

    // 如果商品有SKU且提供了SKU ID
    if (product.skuNum > 0 && skuId) {
      const skuResponse = await fetch(`/api/sku/detail?id=${skuId}`)
      const skuData = await skuResponse.json()

      if (skuData.code !== 200) {
        throw new Error(skuData.msg || '获取SKU信息失败')
      }

      const sku = skuData.data

      items.value = [{
        prodId: product.prodId,
        skuId: sku.skuId,
        prodName: product.prodName,
        price: calculatePrice(sku),
        quantity,
        pic: sku.pic || product.pic,
        properties: sku.properties,
        presellStatus: sku.presellStatus,
        presellPrice: sku.presellPrice,
        presellDeposit: sku.presellDeposit,
        prodType: sku.prodType,
        groupPrice: sku.groupPrice,
        groupMinNum: sku.groupMinNum,
        seckillPrice: sku.seckillPrice,
        isVirtual: sku.isVirtual,
        categoryId: product.categoryId
      }]
    } else {
      // 无SKU商品
      items.value = [{
        prodId: product.prodId,
        prodName: product.prodName,
        price: calculatePrice(product),
        quantity,
        pic: product.pic,
        presellStatus: product.presellStatus,
        presellPrice: product.presellPrice,
        presellDeposit: product.presellDeposit,
        prodType: product.prodType,
        groupPrice: product.groupPrice,
        groupMinNum: product.groupMinNum,
        seckillPrice: product.seckillPrice,
        isVirtual: product.isVirtual,
        categoryId: product.categoryId
      }]
    }

    // 发出商品加载完成事件
    emit('items-loaded', items.value)
  } catch (err) {
    console.error('加载商品信息失败:', err)
    error.value = err instanceof Error ? err.message : '加载商品信息失败'
  } finally {
    loading.value = false
  }
}


const calculateItemTotal = (item: CheckoutItem) =>
  (item.price * item.quantity).toFixed(2)

// 计算商品价格
function calculatePrice(item: any): number {
  switch (item.prodType) {
    case ProductType.PRESELL:
      if (item.presellStatus === 1) {
        return item.presellDeposit || (item.presellPrice * 0.3)
      }
      return item.presellPrice || item.price

    case ProductType.GROUP:
      return item.groupPrice || item.price

    case ProductType.SECKILL:
      return item.seckillPrice || item.price

    default:
      return item.price
  }
}

// 定义emit
const emit = defineEmits<{
  (e: 'items-loaded', items: CheckoutItem[]): void
}>()

// 初始化时加载商品信息
onMounted(() => {
  loadDirectCheckoutItems()
})
</script>

<style scoped>
.checkout-items {
  width: 100%;
}
</style>
