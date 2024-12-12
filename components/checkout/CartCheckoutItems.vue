<template>
  <div class="cart-checkout-items">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ t('checkout.items.title') }}</div>

        <q-list>
          <q-item v-for="item in items" :key="item.skuId || item.prodId">
            <q-item-section avatar>
              <q-img :src="getImageUrl(item.pic)" style="width: 80px; height: 80px" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ item.prodName }}</q-item-label>
              <q-item-label caption v-if="item.properties">
                {{ item.properties }}
              </q-item-label>

              <!-- 价格显示部分 -->
              <div class="price-section q-mt-sm">
                <!-- 预售商品 -->
                <template v-if="item.prodType === ProductType.PRESELL">
                  <div class="text-primary text-weight-medium">
                    预售价：¥{{ item.presellPrice }}
                  </div>
                  <div class="text-grey-8">
                    定金：¥{{ item.presellDeposit }}
                  </div>
                  <div class="text-grey-8">
                    尾款：¥{{ (item.presellPrice - item.presellDeposit).toFixed(2) }}
                  </div>
                </template>

                <!-- 团购商品 -->
                <template v-else-if="item.prodType === ProductType.GROUP">
                  <div class="text-primary text-weight-medium">
                    团购价：¥{{ item.groupPrice }}
                  </div>
                  <div class="text-grey-8">
                    {{ item.groupMinNum }}人成团
                  </div>
                </template>

                <!-- 秒杀商品 -->
                <template v-else-if="item.prodType === ProductType.SECKILL">
                  <div class="text-primary text-weight-medium">
                    秒杀价：¥{{ item.seckillPrice }}
                  </div>
                  <div class="text-grey-8 text-strike">
                    原价：¥{{ item.oriPrice }}
                  </div>
                </template>

                <!-- 普通商品 -->
                <template v-else>
                  <div class="text-primary text-weight-medium">
                    ¥{{ item.price }}
                  </div>
                  <div v-if="item.oriPrice && item.oriPrice > item.price" class="text-grey-8 text-strike">
                    ¥{{ item.oriPrice }}
                  </div>
                </template>
              </div>
            </q-item-section>

            <q-item-section side>
              <div class="text-subtitle1">
                × {{ item.basketCount || item.quantity }}
              </div>
              <div class="text-primary text-weight-medium q-mt-sm">
                ¥{{ calculateItemTotal(item) }}
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator class="q-my-md" />

        <div class="row justify-end items-center q-gutter-sm">
          <div class="text-subtitle1">
            {{ t('checkout.items.total') }}:
          </div>
          <div class="text-h6 text-primary">
            ¥{{ calculateTotal() }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ProductType } from '~/utils/constants'
import type { CheckoutItem } from '~/types/checkout'

const { t } = useI18n()
const props = defineProps<{
  items: CheckoutItem[]
}>()

// 获取图片URL
const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${useRuntimeConfig().public.imageBaseUrl}/${url}`
}

// 计算单个商品总价
const calculateItemTotal = (item: CheckoutItem) => {
  const quantity = item.basketCount || item.quantity || 0

  switch (item.prodType) {
    case ProductType.PRESELL:
      return (item.price * quantity).toFixed(2)
    case ProductType.GROUP:
      return (item.groupPrice * quantity).toFixed(2)
    case ProductType.SECKILL:
      return (item.seckillPrice * quantity).toFixed(2)
    default:
      return (item.price * quantity).toFixed(2)
  }
}

// 计算所有商品总价
const calculateTotal = () => {
  const total = props.items.reduce((sum, item) => {
    const quantity = item.basketCount || item.quantity || 0
    let price = item.price

    switch (item.prodType) {
      case ProductType.PRESELL:
        price = item.presellDeposit
        break
      case ProductType.GROUP:
        price = item.groupPrice
        break
      case ProductType.SECKILL:
        price = item.seckillPrice
        break
    }

    return sum + (price * quantity)
  }, 0)

  return total.toFixed(2)
}
</script>

<style lang="scss" scoped>
.cart-checkout-items {
  .price-section {
    line-height: 1.5;
  }

  .text-strike {
    text-decoration: line-through;
  }
}
</style>
