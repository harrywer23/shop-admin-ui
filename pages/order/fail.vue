<template>
  <div class="payment-result-page">
    <div class="result-container">
      <div class="result-card">
        <div class="result-icon">
          <q-icon name="error" color="negative" size="64px" />
        </div>
        
        <div class="result-title text-h5 text-negative q-mt-md">
          {{ $t('payment.result.fail.title') }}
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
            <span class="label">{{ $t('payment.result.fail.reason') }}:</span>
            <span class="value text-negative">{{ failReason }}</span>
          </div>
        </div>

        <div class="action-buttons q-mt-xl">
          <q-btn
            color="primary"
            :label="$t('payment.result.retryPayment')"
            :to="`/order/payment?orderNumber=${orderNumber}`"
            class="q-mx-sm"
          />
          <q-btn
            outline
            color="primary"
            :label="$t('payment.result.viewOrder')"
            :to="`/user/orders/${orderNumber}`"
            class="q-mx-sm"
          />
        </div>

        <div class="help-text q-mt-lg text-grey">
          {{ $t('payment.result.fail.help') }}
          <q-btn
            flat
            dense
            color="primary"
            :label="$t('payment.result.contactService')"
            @click="contactService"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const orderNumber = ref('')
const amount = ref(0)
const failReason = ref('')

// 联系客服
const contactService = () => {
  // 这里可以实现打开客服对话或跳转到帮助中心
  $q.notify({
    type: 'info',
    message: '正在为您转接客服...'
  })
}

onMounted(() => {
  // 从路由参数获取订单信息
  const { orderNo, total, reason } = route.query
  if (!orderNo) {
    router.push('/')
    return
  }
  
  orderNumber.value = orderNo as string
  amount.value = Number(total) || 0
  failReason.value = reason as string || '支付失败'
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
      animation: shake 0.5s ease;
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

    .help-text {
      font-size: 14px;
    }
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
</style> 