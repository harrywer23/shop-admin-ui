<template>
  <div class="address-list">
    <!-- 添加新地址按钮 -->
    <div class="add-address">
      <q-btn
        color="primary"
        :label="t('checkout.addressInfo.addNew')"
        @click="$emit('add')"
      />
    </div>

    <!-- 地址列表 -->
    <div class="address-items">
      <div
        v-for="address in addresses"
        :key="address.addrId"
        class="address-item"
        :class="{ active: modelValue === address.addrId }"
        @click="handleAddressClick(address)"
      >
        <div class="address-content">
          <div class="address-header">
            <span class="receiver">{{ address.receiver }}</span>
            <span class="mobile">{{ address.mobile }}</span>
            <q-badge
              v-if="address.commonAddr === 1"
              color="primary"
              :label="t('checkout.addressInfo.default')"
              class="q-ml-sm"
            />
          </div>
          <div class="address-detail">
            {{ formatAddress(address) }}
          </div>
        </div>

        <div class="address-actions">
          <q-btn
            flat
            round
            color="primary"
            icon="edit"
            @click.stop="$emit('edit', address)"
          />
          <q-btn
            flat
            round
            color="negative"
            icon="delete"
            @click.stop="$emit('delete', address)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Address } from '~/types/address'

const { t } = useI18n()

// Props
const props = defineProps<{
  addresses: Address[]
  modelValue: number | null
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'add'): void
  (e: 'edit', address: Address): void
  (e: 'delete', address: Address): void
  (e: 'select', address: Address): void
}>()

// Format address
function formatAddress(address: Address): string {
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

// 处理地址点击
function handleAddressClick(address: Address) {
  //console.log('AddressList - 点击选择地址:', address)
  //console.log('AddressList - 当前modelValue:', props.modelValue)
  emit('update:modelValue', address.addrId)
  emit('select', address)
  //console.log('AddressList - 发出选择事件后')
}
</script>

<style scoped>
.address-list {
  margin-bottom: 20px;
}

.add-address {
  margin-bottom: 16px;
}

.address-items {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.address-item {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--q-primary);
    transform: translateY(-2px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  &.active {
    border-color: var(--q-primary);
    background-color: #f6f7ff;
  }
}

.address-header {
  margin-bottom: 8px;

  .receiver {
    font-weight: 500;
    margin-right: 12px;
  }

  .mobile {
    color: #666;
  }
}

.address-detail {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.address-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.address-item:hover .address-actions {
  opacity: 1;
}
</style>
