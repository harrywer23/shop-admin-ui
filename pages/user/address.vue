<template>
  <div class="address-management-page">
    <div class="page-header">
      <h1 class="text-h5">{{ $t('user.address.title') }}</h1>
      <q-btn
        color="primary"
        :label="$t('user.address.add')"
        @click="showAddressDialog('add')"
      />
    </div>
    <!-- 地址列表 -->
    <div class="address-list q-mt-md">
      <q-card v-for="address in addresses" :key="address.addrId" class="address-card q-mb-md">
        <q-card-section>
          <!-- 地址信息 -->
          <div class="row items-center justify-between">
            <div class="address-info">
              <div class="user-info">
                <span class="name">{{ address.receiver }}</span>
                <span class="phone q-ml-md">{{ address.mobile }}</span>
                <q-badge
                  v-if="address.commonAddr === 1"
                  color="primary"
                  :label="$t('user.address.default')"
                  class="q-ml-sm"
                />
              </div>
              <div class="address-detail q-mt-sm text-grey-8">
                {{ formatAddress(address) }}
              </div>
              <div class="email q-mt-xs text-grey-7">
                {{ address.email }}
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions">
              <q-btn
                flat
                round
                color="primary"
                icon="edit"
                @click.stop="showAddressDialog('edit', address)"
              >
                <q-tooltip>{{ $t('user.address.edit') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click.stop="confirmDelete(address)"
              >
                <q-tooltip>{{ $t('user.address.delete') }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="address.isDefault !== 1"
                flat
                round
                color="primary"
                icon="star_outline"
                @click.stop="setAsDefault(address)"
              >
                <q-tooltip>{{ $t('user.address.setDefault') }}</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 地址表单对话框 -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px; max-width: 800px; width: 100%;">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ dialogMode === 'add' ? $t('user.address.addTitle') : $t('user.address.editTitle') }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <AddressForm
            :initial-data="currentAddress"
            @submit="handleAddressSubmit"
            @cancel="showDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 修改确认删除对话框部分 -->
    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="text-h6 q-ml-sm">{{ t('user.address.deleteConfirm') }}</span>
        </q-card-section>

        <q-card-section>
          <div class="text-body1">{{ t('user.address.deleteMessage') }}</div>
          <div v-if="addressToDelete" class="address-preview q-mt-md">
            <div class="text-subtitle2">{{ addressToDelete.receiver }}</div>
            <div class="text-grey-8">{{ formatAddress(addressToDelete) }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1">
          <q-btn
            flat
            :label="t('common.cancel')"
            color="primary"
            v-close-popup
          />
          <q-btn
            :label="t('common.confirm')"
            color="negative"
            :loading="deleting"
            @click="handleDeleteConfirm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'users',
  middleware: 'auth'
});
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import type { Address } from '~/types/address'
import { useAddress } from '~/composables/useAddress'
import AddressForm from '~/components/address/AddressForm.vue'

const $q = useQuasar()
const { t } = useI18n()
const {
  addresses,
  loadAddresses,
} = useAddress()
const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentAddress = ref<Address | null>(null)

// 删除确认相关状态
const showDeleteConfirm = ref(false)
const deleting = ref(false)
const addressToDelete = ref<Address | null>(null)

function formatAddress(address: Address | null): string {
  if (!address) return ''
  
  const parts = [
    address.country,
    address.province,
    address.city,
    address.addr
  ]
  if (address.addr2) {
    parts.push(address.addr2)
  }
  return parts.filter(Boolean).join(', ')
}

// 显示地址对话框
const showAddressDialog = (mode: 'add' | 'edit', address?: Address) => {
  dialogMode.value = mode
  currentAddress.value = mode === 'edit' ? { ...address } : null
  showDialog.value = true
}

// 处理地址提交
const handleAddressSubmit = async (formData: any) => {
  try {
    const url = dialogMode.value === 'add' ? '/admin/userAddr/add' : '/admin/userAddr/update'
    // 如果是编辑模式，需要添加地址ID
    if (dialogMode.value === 'edit' && currentAddress.value) {
      formData.addrId = currentAddress.value.addrId
    }

    const response = await api.post(url, formData)
    const { code, msg } = response.data

    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: t(`user.address.${dialogMode.value}Success`)
      })
      showDialog.value = false
      loadAddresses()
    } else {
      throw new Error(msg || t(`user.address.${dialogMode.value}Error`))
    }
  } catch (error) {
    console.error('Failed to save address:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t(`user.address.${dialogMode.value}Error`)
    })
  }
}

// 显示删除确认对话框
const confirmDelete = (address: Address) => {
  addressToDelete.value = { ...address }
  showDeleteConfirm.value = true
}

// 处理删除确认
const handleDeleteConfirm = async () => {
  if (!addressToDelete.value) return
  deleting.value = true
  try {
    const response = await api.delete(`/admin/userAddr/delete/${addressToDelete.value.addrId}`)
    const data = await response.data
    if (data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('user.address.deleteSuccess')
      })
      showDeleteConfirm.value = false
      loadAddresses()
    } else {
      throw new Error(data.msg)
    }
  } catch (error) {
    console.error('Failed to delete address:', error)
    $q.notify({
      type: 'negative',
      message: t('user.address.deleteError')
    })
  } finally {
    deleting.value = false
  }
}

// 设为默认地址
const setAsDefault = async (address: Address) => {
  try {
    const response = await api.get(`/admin/userAddr/default/${address.addrId}`)
    const data = await response.data
    if (data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('user.address.setDefaultSuccess')
      })
      loadAddresses()
    } else {
      throw new Error(data.msg)
    }
  } catch (error) {
    console.error('Failed to set default address:', error)
    $q.notify({
      type: 'negative',
      message: t('user.address.setDefaultError')
    })
  }
}

// 初始化
onMounted(() => {
  loadAddresses()
})
</script>

<style lang="scss" scoped>
.address-management-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .address-card {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .address-info {
      flex: 1;

      .user-info {
        .name {
          font-size: 16px;
          font-weight: 500;
        }

        .phone {
          color: #666;
        }
      }

      .address-detail {
        font-size: 14px;
        line-height: 1.4;
      }

      .email {
        font-size: 13px;
      }
    }

    .actions {
      display: flex;
      gap: 8px;
    }
  }
}

// 响应式布局
@media (max-width: 600px) {
  .address-management-page {
    padding: 16px;

    .address-card {
      .q-card__section {
        padding: 12px;
      }

      .address-info {
        .user-info {
          flex-direction: column;
          align-items: flex-start;

          .phone {
            margin-left: 0;
            margin-top: 4px;
          }
        }
      }

      .actions {
        margin-top: 12px;
        justify-content: flex-end;
      }
    }
  }
}

.address-preview {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;

  .text-subtitle2 {
    margin-bottom: 4px;
  }
}
</style>
