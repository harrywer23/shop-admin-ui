<template>
  <div class="region-select">
    <!-- 邮政编码输入 -->
    <q-input
      v-model="postCode"
      :label="t('checkout.addressInfo.zipCode')"
      outlined
      dense
      @blur="handlePostCodeBlur"
      :loading="loadingAddress"
      :rules="[
        val => !!val || t('checkout.validation.zipCodeRequired'),
        val => /^[0-9a-zA-Z-]{3,10}$/.test(val) || t('checkout.validation.zipCodeInvalid')
      ]"
    >
      <template v-slot:append>
        <q-btn
          round
          dense
          flat
          icon="search"
          :loading="loadingAddress"
          @click="searchByPostCode"
        >
          <q-tooltip>{{ t('checkout.addressInfo.searchByZipCode') }}</q-tooltip>
        </q-btn>
      </template>
    </q-input>

    <!-- 国家选择 -->
    <q-select
      v-model="selectedCountry"
      :options="countries"
      :label="t('checkout.addressInfo.country')"
      option-label="name"
      :loading="loadingCountries"
      outlined
      dense
      emit-value
      map-options
      class="q-mt-sm"
      @update:model-value="handleCountryChange"
      :rules="[val => !!val || t('checkout.validation.countryRequired')]"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            {{ t('common.noData') }}
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- 省/州选择 -->
    <q-select
      v-model="selectedProvince"
      :options="provinces"
      :label="t('checkout.addressInfo.province')"
      option-label="name"
      :loading="loadingProvinces"
      :disable="!selectedCountry"
      outlined
      dense
      emit-value
      map-options
      class="q-mt-sm"
      @update:model-value="handleProvinceChange"
      :rules="[val => !!val || t('checkout.validation.provinceRequired')]"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            {{ t('common.noData') }}
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- 城市选择 -->
    <q-select
      v-model="selectedCity"
      :options="cities"
      :label="t('checkout.addressInfo.city')"
      option-label="name"
      :loading="loadingCities"
      :disable="!selectedProvince"
      outlined
      dense
      emit-value
      map-options
      class="q-mt-sm"
      @update:model-value="handleCityChange"
      :rules="[val => !!val || t('checkout.validation.cityRequired')]"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            {{ t('common.noData') }}
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- 详细地址输入 -->
    <q-input
      v-model="address"
      type="textarea"
      :label="t('checkout.addressInfo.address')"
      outlined
      class="q-mt-sm"
      :rules="[val => !!val || t('checkout.validation.addressRequired')]"
      :rows="2"
      :readonly="loadingAddress"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const $q = useQuasar()

// 定义接口
interface Region {
  geonameId: number
  name: string
  countryCode?: string
  adminCode1?: string
  adminName1?: string
  fcl?: string
  fcode?: string
}

interface AddressInfo {
  postCode: string
  country: string
  countryId: number
  province: string
  provinceId: number
  city: string
  cityId: number
  address: string
}

// 定义 props
const props = defineProps({
  modelValue: {
    type: Object as () => AddressInfo,
    default: () => ({
      postCode: '',
      country: '',
      countryId: 0,
      province: '',
      provinceId: 0,
      city: '',
      cityId: 0,
      address: ''
    })
  }
})

// 定义 emit
const emit = defineEmits(['update:modelValue'])

// 数据加载状态
const loadingCountries = ref(false)
const loadingProvinces = ref(false)
const loadingCities = ref(false)
const loadingAddress = ref(false)

// 选择数据
const countries = ref<Region[]>([])
const provinces = ref<Region[]>([])
const cities = ref<Region[]>([])

// 选中值
const selectedCountry = ref<Region | null>(null)
const selectedProvince = ref<Region | null>(null)
const selectedCity = ref<Region | null>(null)
const postCode = ref('')
const address = ref('')

// GeoNames API 配置
const GEONAMES_USERNAME = 'your_username' // 替换为你的 GeoNames 用户名
const GEONAMES_API = 'http://api.geonames.org'

// 添加安全的随机数生成函数
function safeRandom(): number {
  if (process.client) {
    return Math.random()
  }
  return 0.5 // 服务器端返回固定值
}

// 添加安全的时间戳生成函数
function safeNow(): number {
  if (process.client) {
    return Date.now()
  }
  return 0 // 服务器端返回固定值
}

// 修改生成ID的函数
function generateId(): number {
  return safeNow() + Math.floor(safeRandom() * 1000)
}

// 邮政编码查询
async function searchByPostCode() {
  if (!postCode.value) {
    $q.notify({
      type: 'warning',
      message: t('checkout.validation.zipCodeRequired')
    })
    return
  }

  try {
    loadingAddress.value = true
    //console.log('开始查询邮政编码:', postCode.value)

    // 添加随机延迟，避免频繁请求
    const delay = 1000 + (typeof window !== 'undefined' ? window.Math.random() * 1000 : 0)
    await new Promise(resolve => setTimeout(resolve, delay))

    const response = await fetch(
      `${GEONAMES_API}/postalCodeSearchJSON?postalcode=${postCode.value}&maxRows=1&username=${GEONAMES_USERNAME}`
    )
    const data = await response.json()
    //console.log('邮政编码查询结果:', data)

    if (data.postalCodes && data.postalCodes.length > 0) {
      const postalCode = data.postalCodes[0]

      // 自动填充地址信息
      selectedCountry.value = {
        geonameId: postalCode.countryId,
        name: postalCode.countryName,
        countryCode: postalCode.countryCode
      }

      await handleCountryChange(selectedCountry.value)

      // 查找并设置省份
      const matchingProvince = provinces.value.find(
        p => p.name.toLowerCase() === postalCode.adminName1.toLowerCase()
      )
      if (matchingProvince) {
        selectedProvince.value = matchingProvince
        await handleProvinceChange(matchingProvince)
      }

      // 查找并设置城市
      const matchingCity = cities.value.find(
        c => c.name.toLowerCase() === postalCode.placeName.toLowerCase()
      )
      if (matchingCity) {
        selectedCity.value = matchingCity
        handleCityChange(matchingCity)
      }

      // 设置详细地址
      address.value = `${postalCode.placeName}, ${postalCode.adminName1}`

      // 更新表单数据
      updateFormValue()

      $q.notify({
        type: 'positive',
        message: t('checkout.addressInfo.addressFound')
      })
    } else {
      throw new Error(t('checkout.addressInfo.addressNotFound'))
    }
  } catch (error) {
    console.error('邮政编码查询失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('checkout.addressInfo.searchError')
    })
  } finally {
    loadingAddress.value = false
  }
}

// 失去焦点时自动查询
function handlePostCodeBlur() {
  if (postCode.value && postCode.value.length >= 3) {
    // 添加随机延迟
    const delay = 500 + (typeof window !== 'undefined' ? window.Math.random() * 500 : 0)
    setTimeout(() => {
      searchByPostCode()
    }, delay)
  }
}

// 更新表单数据
function updateFormValue() {
  emit('update:modelValue', {
    postCode: postCode.value,
    country: selectedCountry.value?.name || '',
    countryId: selectedCountry.value?.geonameId || 0,
    province: selectedProvince.value?.name || '',
    provinceId: selectedProvince.value?.geonameId || 0,
    city: selectedCity.value?.name || '',
    cityId: selectedCity.value?.geonameId || 0,
    address: address.value
  })
}

// 监听表单数据变化
watch(
  [postCode, selectedCountry, selectedProvince, selectedCity, address],
  () => {
    updateFormValue()
  },
  { deep: true }
)

// 监听初始值变化
watch(() => props.modelValue, (newValue) => {
  postCode.value = newValue.postCode
  address.value = newValue.address

  if (newValue.country && countries.value.length > 0) {
    selectedCountry.value = countries.value.find(
      country => country.name === newValue.country
    ) || null
  }
  if (newValue.province && provinces.value.length > 0) {
    selectedProvince.value = provinces.value.find(
      province => province.name === newValue.province
    ) || null
  }
  if (newValue.city && cities.value.length > 0) {
    selectedCity.value = cities.value.find(
      city => city.name === newValue.city
    ) || null
  }
}, { deep: true })

// 组件挂载时加载国家列表
onMounted(() => {
  loadCountries()
})
</script>

<style lang="scss" scoped>
.region-select {
  .q-select, .q-input {
    width: 100%;
  }

  .address-input {
    :deep(.q-field__control) {
      height: auto;
      min-height: 56px;
      max-height: 80px;
    }

    :deep(.q-field_Native) {
      min-height: 40px;
      padding: 4px 0;
    }

    textarea {
      resize: none;
    }
  }
}
</style>
