<template>
  <div class="payment-result-page">
    <div class="result-container">
      <div class="result-card">
        <div class="result-icon">
          <q-icon name="check_circle" color="positive" size="64px" />
        </div>

        <div class="result-title text-h5 text-positive q-mt-md">
          {{ $t('payment.result.success.title') }}
        </div>

        <div class="result-info q-mt-lg">
          <div class="info-item">
            <span class="label">{{ $t('payment.orderNumber') }}:</span>
            <span class="value">{{ orderNumber }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('payment.amount') }}:</span>
            <span class="value text-primary">¥{{ amount }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('payment.payTime') }}:</span>
            <span class="value">{{ formatDateTime(payTime) }}</span>
          </div>
        </div>

        <div class="action-buttons q-mt-xl">
          <q-btn v-for="(orderNum, index) in orderNumber" :key="orderNum"
            color="primary"
            :to="`/user/orders/${orderNum}`"
            class="q-mx-sm"
          >
            {{ t('payment.result.viewOrder', { index: index + 1 }) }}
          </q-btn>
          <q-btn
            outline
            color="primary"
            :label="$t('payment.result.continueShopping')"
            to="/"
            class="q-mx-sm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { date } from 'quasar'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 处理多个订单号，将字符串转换为数组
const orderNumber = ref<string[]>([])
const amount = ref(route.query.amount || 0)
const payTime = ref('')

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  // 如果是字符串，则按逗号分割成数组
  const orderNumberParam = route.query.orderNumber
  if (typeof orderNumberParam === 'string') {
    orderNumber.value = orderNumberParam.split(',')
  } else if (Array.isArray(orderNumberParam)) {
    orderNumber.value = orderNumberParam
  }
  
  amount.value = route.query.amount as string
  payTime.value = new Date().toISOString()
})
</script>

<style lang="scss" scoped>
.payment-result-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40px 20px;

  .result-container {
    max-width: 600px;
    margin: 0 auto;
  }

  .result-card {
    background: #fff;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .result-icon {
      animation: scale-in 0.5s ease;
    }

    .result-info {
      .info-item {
        margin: 12px 0;

        .label {
          color: #666;
          margin-right: 8px;
        }

        .value {
          font-weight: 500;
        }
      }
    }
  }
}

@keyframes scale-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>
