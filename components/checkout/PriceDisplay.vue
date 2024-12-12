<template>
  <div class="price-display">
    <template v-if="item.prodType === ProductType.PRESELL">
      {{ t('product.presellPrice') }}: ¥{{ item.presellPrice || item.price }}
      <span class="deposit" v-if="item.presellStatus === 1">
        ({{ t('product.deposit') }}: ¥{{ item.presellDeposit || (item.presellPrice * 0.3).toFixed(2) }})
      </span>
    </template>
    <template v-else-if="item.prodType === ProductType.GROUP">
      {{ t('product.groupPrice') }}: ¥{{ item.groupPrice || item.price }}
      <span class="group-info">
        ({{ item.groupMinNum }}{{ t('product.groupMinNum') }})
      </span>
    </template>
    <template v-else-if="item.prodType === ProductType.SECKILL">
      {{ t('product.seckillPrice') }}: ¥{{ item.seckillPrice || item.price }}
    </template>
    <template v-else>
      ¥{{ item.price }}
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ProductType } from '~/utils/constants'
import type { CheckoutItem } from '~/types/checkout'

defineProps<{
  item: CheckoutItem
}>()

const { t } = useI18n()
</script>

<style scoped>
.price-display {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.deposit {
  font-size: 0.9em;
  color: #666;
}

.group-info {
  font-size: 0.9em;
  color: #666;
}
</style> 