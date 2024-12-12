<template>
  <div class="address-form">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <div class="form-content">
        <div class="row q-col-gutter-md">
          <!-- 联系人信息 -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="form.receiver"
              :label="t('checkout.contactInfo.name')"
              :rules="rules.receiver"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="form.mobile"
              :label="t('checkout.contactInfo.phone')"
              :rules="rules.mobile"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="form.email"
              label="e-mail"
              :rules="rules.email"
              outlined
              dense
            />
          </div>

          <!-- 地区选择 -->
          <div class="col-12">
            <div class="area-wrapper">
              <AreaCascader
                v-model="form.area"
                class="q-mb-md"
              />
            </div>
          </div>

          <!-- 编和详细地址 -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="form.postCode"
              :label="t('checkout.addressInfo.zipCode')"
              :rules="rules.postCode"
              outlined
              dense
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="form.addr"
              :label="t('checkout.addressInfo.address1')"
              :rules="rules.addr"
              type="textarea"
              rows="2"
              outlined
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="form.addr2"
              :label="t('checkout.addressInfo.address2')"
              type="textarea"
              rows="2"
              outlined
            >
              <template v-slot:append>
                <q-badge color="grey" text-color="white">
                  {{ t('checkout.addressInfo.optional') }}
                </q-badge>
              </template>
            </q-input>
          </div>

          <!-- 默认地址设置 -->
          <div class="col-12">
            <q-checkbox
              v-model="form.isDefault"
              :label="t('checkout.addressInfo.setDefault')"
              :true-value = "1"
              :false-value= "0"
            />
          </div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="row justify-end q-gutter-sm">
        <q-btn
          flat
          :label="t('common.cancel')"
          color="primary"
          @click="$emit('cancel')"
        />
        <q-btn
          :label="t('common.save')"
          color="primary"
          type="submit"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import AreaCascader from './AreaCascader.vue'

const { t } = useI18n()
const $q = useQuasar()

// Props
const props = defineProps<{
  initialData?: any
}>()

// Emits
const emit = defineEmits<{
  (e: 'submit', data: any): void
  (e: 'cancel'): void
}>()

// Form data
const form = ref({
  addrId: '',
  receiver: '',
  mobile: '',
  email: '',
  area: {
    country: null,
    province: null,
    city: null
  },
  postCode: '',
  addr: '',
  addr2: '',
  isDefault: 0
})

// Validation rules
const rules = {
  receiver: [
    (val: string) => !!val || t('checkout.validation.nameRequired'),
    (val: string) => val.length <= 50 || t('checkout.validation.nameTooLong')
  ],
  mobile: [
    (val: string) => !!val || t('checkout.validation.phoneRequired'),
    (val: string) => /^[0-9-+]{5,20}$/.test(val) || t('checkout.validation.phoneInvalid')
  ],
  email: [
    (val: string) => !!val || t('checkout.validation.emailRequired'),
    (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || t('checkout.validation.emailInvalid')
  ],
  country: [(val: any) => !!val || t('checkout.validation.countryRequired')],
  province: [(val: any) => !!val || t('checkout.validation.provinceRequired')],
  city: [(val: any) => !!val || t('checkout.validation.cityRequired')],
  postCode: [
    (val: string) => !!val || t('checkout.validation.zipCodeRequired'),
    (val: string) => /^[0-9a-zA-Z-]{3,10}$/.test(val) || t('checkout.validation.zipCodeInvalid')
  ],
  addr: [
    (val: string) => !!val || t('checkout.validation.address1Required'),
    (val: string) => val.length <= 200 || t('checkout.validation.addressTooLong')
  ]
}

// Options for select
const countryOptions = ref([])
const provinceOptions = ref([])
const cityOptions = ref([])

// Load area data
async function loadAreas(parentId: string | number = '0', level: number = 1) {
  try {
    const response = await fetch(`/api/areas/list?parentId=${parentId}&level=${level}`)
    const data = await response.json()
    //console.log("国家地址：",data.data);
    return data.data || []
  } catch (error) {
    console.error('Failed to load areas:', error)
    return []
  }
}

// Handle area changes
async function onCountryChange(country: any) {
  if (!country) return
  form.value.area.province = null
  form.value.area.city = null
  provinceOptions.value = await loadAreas(country.id, 2)
}

async function onProvinceChange(province: any) {
  if (!province) return
  form.value.area.city = null
  cityOptions.value = await loadAreas(province.id, 3)
}

// Submit handler
async function onSubmit() {
  try {
    // 确保地区信息完整
    if (!form.value.area.country || !form.value.area.province || !form.value.area.city) {
      $q.notify({
        type: 'negative',
        message: t('checkout.validation.fillRequired')
      })
      return
    }

    // 打印调试信息
    console.log('地区信息:', {
      country: form.value.area.country,
      province: form.value.area.province,
      city: form.value.area.city
    })

    const formData: AddressSubmitData = {
      addrId: form.value.addrId,
      receiver: form.value.receiver,
      // 地区ID和名称
      countryId: Number(form.value.area.country.id),
      provinceId: Number(form.value.area.province.id),
      cityId: Number(form.value.area.city.id),
      country: form.value.area.country.name,
      province: form.value.area.province.name,
      city: form.value.area.city.name,
      // 其他必填字段
      areaId: 0,
      area: '',
      postCode: form.value.postCode,
      addr: form.value.addr,
      addr2: form.value.addr2 || '',
      mobile: form.value.mobile,
      email: form.value.email,
      status: 1,
      isDefault: form.value.isDefault,
      // 可选字段
      createTime: '',
      version: 0,
      updateTime: ''
    }

    // 打印提交的数据
    console.log('提交的地址数据:', formData)

    emit('submit', formData)
  } catch (error) {
    console.error('Form submission failed:', error)
    $q.notify({
      type: 'negative',
      message: t('checkout.addressInfo.saveError')
    })
  }
}

// Initialize form with props data
function initForm() {
  if (props.initialData) {
    form.value = {
      ...form.value,
      ...props.initialData,
      area: {
        country: props.initialData.country ? {
          id: props.initialData.countryId,
          name: props.initialData.country
        } : null,
        province: props.initialData.province ? {
          id: props.initialData.provinceId,
          name: props.initialData.province
        } : null,
        city: props.initialData.city ? {
          id: props.initialData.cityId,
          name: props.initialData.city
        } : null
      }
    }
  }
}

// Load initial data
onMounted(async () => {
  countryOptions.value = await loadAreas()
  initForm()
})
</script>

<style scoped>
.address-form {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.form-content {
  position: relative;
  z-index: 1;
}

.area-wrapper {
  position: relative;
  z-index: 2;
}

/* 确保其他表单字段在地区选择器下方 */
.q-input, .q-checkbox {
  position: relative;
  z-index: 1;
}
</style>
