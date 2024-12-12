<template>
  <div class="area-cascader">
    <div class="area-select-group">
      <!-- 国家选择 -->
      <q-select
        v-model="selectedCountry"
        :options="countryOptions"
        :label="t('checkout.addressInfo.country')"
        :rules="[val => !!val || t('checkout.validation.countryRequired')]"
        option-value="id"
        option-label="name"
        :map-options="false"
        :emit-value="false"
        outlined
        dense
        class="area-select"
        @update:model-value="handleCountryChange"
      />

      <!-- 省份选择 -->
      <q-select
        v-model="selectedProvince"
        :options="provinceOptions"
        :label="t('checkout.addressInfo.province')"
        :rules="[val => !!val || t('checkout.validation.provinceRequired')]"
        :disable="!selectedCountry"
        option-value="id"
        option-label="name"
        :map-options="false"
        :emit-value="false"
        outlined
        dense
        class="area-select"
        @update:model-value="handleProvinceChange"
      />

      <!-- 城市选择 -->
      <q-select
        v-model="selectedCity"
        :options="cityOptions"
        :label="t('checkout.addressInfo.city')"
        :rules="[val => !!val || t('checkout.validation.cityRequired')]"
        :disable="!selectedProvince"
        option-value="id"
        option-label="name"
        :map-options="false"
        :emit-value="false"
        outlined
        dense
        class="area-select"
        @update:model-value="handleCityChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AreaOption } from '~/types/area'

const props = defineProps<{
  modelValue: {
    country?: any
    province?: any
    city?: any
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { country?: any, province?: any, city?: any }): void
}>()

const { t } = useI18n()

// 状态
const selectedCountry = ref<any>(null)
const selectedProvince = ref<any>(null)
const selectedCity = ref<any>(null)

// 选项数据
const countryOptions = ref<AreaOption[]>([])
const provinceOptions = ref<AreaOption[]>([])
const cityOptions = ref<AreaOption[]>([])

// 加载地区数据
async function loadAreas(parentId: string | number = '0', level: number = 1) {
  try {
    const response = await fetch(`/api/areas/list?parentId=${parentId}&level=${level}`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('加载地区数据失败:', error)
    return []
  }
}

// 处理国家变化
async function handleCountryChange(value: any) {
  if (!value) {
    selectedCountry.value = null
    selectedProvince.value = null
    selectedCity.value = null
    provinceOptions.value = []
    cityOptions.value = []
    return
  }

  console.log('选择的国家:', value) // 调试日志

  selectedCountry.value = {
    id: value.id,
    name: value.name
  }
  selectedProvince.value = null
  selectedCity.value = null
  
  try {
    provinceOptions.value = await loadAreas(value.id, 2)
    cityOptions.value = []
  } catch (error) {
    console.error('加载省份数据失败:', error)
    provinceOptions.value = []
  }
  
  emit('update:modelValue', {
    country: selectedCountry.value,
    province: null,
    city: null
  })
}

// 处理省份变化
async function handleProvinceChange(value: any) {
  if (!value) {
    selectedProvince.value = null
    selectedCity.value = null
    cityOptions.value = []
    return
  }

  console.log('选择的省份:', value) // 调试日志

  selectedProvince.value = {
    id: value.id,
    name: value.name
  }
  selectedCity.value = null
  
  try {
    cityOptions.value = await loadAreas(value.id, 3)
  } catch (error) {
    console.error('加载城市数据失败:', error)
    cityOptions.value = []
  }
  
  emit('update:modelValue', {
    country: selectedCountry.value,
    province: selectedProvince.value,
    city: null
  })
}

// 处理城市变化
function handleCityChange(value: any) {
  console.log('选择的城市:', value) // 调试日志

  selectedCity.value = value ? {
    id: value.id,
    name: value.name
  } : null

  emit('update:modelValue', {
    country: selectedCountry.value,
    province: selectedProvince.value,
    city: selectedCity.value
  })
}

// 初始化数据
onMounted(async () => {
  countryOptions.value = await loadAreas()
  
  // 如果有初始值，加载相应的省份和城市数据
  if (props.modelValue?.country) {
    selectedCountry.value = props.modelValue.country
    provinceOptions.value = await loadAreas(props.modelValue.country.id, 2)
    
    if (props.modelValue.province) {
      selectedProvince.value = props.modelValue.province
      cityOptions.value = await loadAreas(props.modelValue.province.id, 3)
      
      if (props.modelValue.city) {
        selectedCity.value = props.modelValue.city
      }
    }
  }
})

// 修改监听逻辑
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    // 如果新值与当前选中值不同，才进行更新
    if (JSON.stringify(selectedCountry.value) !== JSON.stringify(newValue.country)) {
      selectedCountry.value = newValue.country || null
      if (newValue.country) {
        provinceOptions.value = await loadAreas(newValue.country.id, 2)
      }
    }
    
    if (JSON.stringify(selectedProvince.value) !== JSON.stringify(newValue.province)) {
      selectedProvince.value = newValue.province || null
      if (newValue.province) {
        cityOptions.value = await loadAreas(newValue.province.id, 3)
      }
    }
    
    if (JSON.stringify(selectedCity.value) !== JSON.stringify(newValue.city)) {
      selectedCity.value = newValue.city || null
    }
  } else {
    selectedCountry.value = null
    selectedProvince.value = null
    selectedCity.value = null
  }
}, { immediate: true })
</script>

<style scoped>
.area-cascader {
  width: 100%;
  position: relative;
}

.area-select-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
}

.area-select {
  width: 100%;
  min-width: 150px;
  position: relative;
  z-index: 1; /* 基础层级 */
}

/* 确保下拉菜单在其他内容之上 */
:deep(.q-menu) {
  z-index: 9999 !important; /* 确保下拉菜单在最上层 */
}

/* 响应式布局 */
@media (max-width: 768px) {
  .area-select-group {
    grid-template-columns: 1fr;
  }
  
  /* 在移动端调整每个选择器的层级，确保后面的选择器下拉菜单不会被前面的遮挡 */
  .area-select:nth-child(1) { z-index: 3; }
  .area-select:nth-child(2) { z-index: 2; }
  .area-select:nth-child(3) { z-index: 1; }
}

/* 中等屏幕 */
@media (min-width: 769px) and (max-width: 1024px) {
  .area-select-group {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* 城市选择器占满宽度 */
  .area-select:last-child {
    grid-column: 1 / -1;
  }
}
</style> 