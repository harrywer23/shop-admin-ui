<template>
  <div class="alipay-payment">
    <q-radio
      v-model="selectedMethod"
      val="alipay"
      :label="t('payment.methods.alipay')"
      class="q-mb-sm"
    >
      <template v-slot:default>
        <div class="payment-method-content">
          <img src="/payment/alipay.jpeg" alt="Alipay" class="payment-logo">
          <span class="payment-label">{{ t('payment.methods.alipay') }}</span>
        </div>
      </template>
    </q-radio>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const selectedMethod = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value || '')
})
</script>

<style lang="scss" scoped>
.alipay-payment {
  .payment-method-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .payment-logo {
    width: 60px;
    height: auto;
  }

  .payment-label {
    font-size: 14px;
  }
}
</style>
