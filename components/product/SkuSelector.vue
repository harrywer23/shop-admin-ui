<template>
  <div class="sku-section" v-if="skuList.length">
    <div v-for="(prop, propId) in skuProps" :key="propId" class="prop-item">
      <div class="prop-title">{{ t(`productDetail.sku.${prop.propName}`) }}</div>
      <div class="prop-values">
        <q-btn
          v-for="value in prop.values"
          :key="value.value_id"
          :label="value.prop_value"
          :class="{
            'sku-btn': true,
            'sku-btn-selected': isSkuValueSelected(propId, value.value_id),
            'sku-btn-disabled': !isSkuValueAvailable(propId, value.value_id)
          }"
          flat
          :disable="!isSkuValueAvailable(propId, value.value_id)"
          @click="selectSkuValue(propId, value.value_id)"
          class="q-ma-xs"
        >
          <q-icon
            v-if="!isSkuValueAvailable(propId, value.value_id)"
            name="sold_out"
            size="14px"
            class="q-ml-xs"
          />
          <q-tooltip v-if="!isSkuValueAvailable(propId, value.value_id)">
            {{ t('productDetail.sku.unavailable') }}
          </q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props 定义
const props = defineProps<{
  skuList: any[]
  skuProps: Record<string, any>
  selectedSku: Record<string, number>
}>()

// Emits 定义
const emit = defineEmits<{
  (e: 'select-value', propId: string, valueId: number): void
}>()

// 方法定义
const isSkuValueSelected = (propId: string, valueId: number) => {
  return props.selectedSku[propId] === valueId
}

const isSkuValueAvailable = (propId: string, valueId: number) => {
  // 检查该属性值组合是否有对应的SKU，且SKU有库存
  const tempSelected = { ...props.selectedSku, [propId]: valueId }
  return props.skuList.some(sku => {
    if (!sku.properties) return false
    const skuProps = parseSkuProperties(sku.properties)
    const propsMatch = Object.entries(tempSelected).every(([pid, vid]) =>
      skuProps[`p${pid}`] === `v${vid}` || !tempSelected[pid]
    )
    return propsMatch && (sku.stocks > 0 || sku.can_book)
  })
}

const selectSkuValue = (propId: string, valueId: number) => {
  emit('select-value', propId, valueId)
}

const parseSkuProperties = (properties: string) => {
  if (!properties) return {}
  return properties.split(';').reduce((acc: Record<string, string>, curr: string) => {
    const [key, value] = curr.split(':')
    acc[key] = value
    return acc
  }, {})
}
</script>

<style scoped>
/* 样式保持不变 */
</style>
