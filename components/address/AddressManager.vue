<template>
  <div class="address-manager">
    <!-- 地址列表 -->
    <AddressList
      v-model="selectedAddressId"
      :addresses="addresses"
      :loading="loading"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @select="handleSelect"
    />

    <!-- 地址表单对话框 -->
    <q-dialog v-model="showAddressForm" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? t('checkout.addressInfo.editTitle') : t('checkout.addressInfo.addTitle') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <AddressForm
            :initial-data="editingAddress"
            @submit="handleSubmit"
            @cancel="showAddressForm = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAddress } from '~/composables/useAddress'
import type { Address,AreaSelectValue, AddressSubmitData } from '~/types/address'

const props = defineProps<{
  modelValue?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'select', address: Address): void
}>()

const $q = useQuasar()
const { t } = useI18n()

// 使用地址管理hook
const {
  addresses,
  selectedAddressId,
  selectedAddress,
  loading,
  loadAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  selectAddress
} = useAddress()

// 表单相关状态
const showAddressForm = ref(false)
const isEditing = ref(false)
const editingAddress = ref<AreaSelectValue | null>(null)

// 处理编辑
function handleEdit(address: AreaSelectValue) {
  isEditing.value = true
  editingAddress.value = { ...address }
  showAddressForm.value = true
}

// 处理删除
async function handleDelete(address: AreaSelectValue) {
  try {
    await $q.dialog({
      title: t('checkout.addressInfo.deleteConfirm'),
      message: t('checkout.addressInfo.deleteMessage'),
      cancel: true,
      persistent: true
    })

    await deleteAddress(address.addrId)

    $q.notify({
      type: 'positive',
      message: t('checkout.addressInfo.deleteSuccess')
    })
  } catch (error) {
    console.error('删除地址失败:', error)
    $q.notify({
      type: 'negative',
      message: t('checkout.addressInfo.deleteError')
    })
  }
}

// 处理选择
function handleSelect(address: Address) {
  //console.log('AddressManager - 接收到地址选择:', address)
  //console.log('AddressManager - 当前 selectedAddressId:', selectedAddressId.value)
  selectAddress(address)
  emit('select', address)
  //console.log('AddressManager - 选择后 selectedAddressId:', selectedAddressId.value)
}

// 处理表单提交
async function handleSubmit(formData: AddressSubmitData) {
  try {
    if (isEditing.value && editingAddress.value) {
      await updateAddress(formData)
    } else {
      await addAddress(formData)
    }

    showAddressForm.value = false
    $q.notify({
      type: 'positive',
      message: t('checkout.addressInfo.saveSuccess')
    })
  } catch (error) {
    console.error('保存地址失败:', error)
    $q.notify({
      type: 'negative',
      message: t('checkout.addressInfo.saveError')
    })
  }
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  //console.log('AddressManager - modelValue 变化:', newValue)
  if (newValue && newValue !== selectedAddressId.value) {
    const address = addresses.value.find(addr => addr.addrId === newValue)
    if (address) {
      //console.log('AddressManager - 根据 modelValue 找到地址:', address)
      selectAddress(address)
    }
  }
})

// 监听 selectedAddressId 变化
watch(selectedAddressId, (newValue) => {
  //console.log('AddressManager - selectedAddressId 变化:', newValue)
  if (newValue !== props.modelValue) {
    emit('update:modelValue', newValue)
  }
})

// 监听 showAddressForm，当关闭时重置状态
watch(showAddressForm, (newValue) => {
  if (!newValue) {
    isEditing.value = false
    editingAddress.value = null
  }
})

// 修改 AddressList 的 @add 处理函数
function handleAdd() {
  isEditing.value = false
  editingAddress.value = null
  showAddressForm.value = true
}

// 初始化数据
onMounted(() => {
  loadAddresses()
})
</script>

<style scoped>
.address-manager {
  width: 100%;
}
</style>
