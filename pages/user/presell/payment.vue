<template>
  <div class="presell-payment-page">
    <div class="page-container">
      <h1 class="text-h5 q-mb-lg">{{ t('presell.payment.title') }}</h1>

      <q-card flat bordered class="payment-card">
        <q-card-section>
          <!-- 订单信息 -->
          <div class="order-info q-mb-lg">
            <div class="text-h6 q-mb-md">{{ t('presell.payment.orderInfo') }}</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="info-item">
                  <span class="label">{{ t('presell.payment.orderNumber') }}:</span>
                  <span class="value">{{ orderInfo.orderNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ t('presell.payment.productName') }}:</span>
                  <span class="value">{{ orderInfo.productName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ t('presell.payment.quantity') }}:</span>
                  <span class="value">{{ orderInfo.quantity }}</span>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="info-item">
                  <span class="label">{{ t('presell.payment.totalAmount') }}:</span>
                  <span class="value text-primary">¥{{ orderInfo.totalAmount }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ t('presell.payment.depositAmount') }}:</span>
                  <span class="value">¥{{ orderInfo.depositAmount }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ t('presell.payment.finalAmount') }}:</span>
                  <span class="value">¥{{ orderInfo.finalAmount }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 支付方式选择 -->
          <div class="payment-method q-mb-lg">
            <div class="text-h6 q-mb-md">{{ t('presell.payment.method') }}</div>
            <q-option-group
              v-model="selectedMethod"
              :options="paymentMethods"
              color="primary"
            />
          </div>

          <!-- 支付按钮 -->
          <div class="payment-action">
            <q-btn
              color="primary"
              :label="isDeposit ? t('presell.payment.payDeposit') : t('presell.payment.payFinal')"
              @click="handlePayment"
              :loading="paying"
              :disable="!selectedMethod"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- 支付说明 -->
      <q-card flat bordered class="q-mt-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">{{ t('presell.payment.notice') }}</div>
          <ul class="q-mb-none">
            <li v-for="(notice, index) in paymentNotices" :key="index">
              {{ notice }}
            </li>
          </ul>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'users',
  middleware: 'auth'
});
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/axios'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()

const orderInfo = ref({
  orderNumber: '',
  productName: '',
  quantity: 0,
  totalAmount: 0,
  depositAmount: 0,
  finalAmount: 0
})

const selectedMethod = ref('')
const paying = ref(false)
const isDeposit = ref(true)

// 支付方式选项
const paymentMethods = [
  {
    label: t('payment.methods.alipay'),
    value: 'alipay'
  },
  {
    label: t('payment.methods.wechat'),
    value: 'wechat'
  },
  {
    label: t('payment.methods.bank'),
    value: 'bank'
  }
]

// 支付说明
const paymentNotices = [
  t('presell.payment.notices.deposit'),
  t('presell.payment.notices.final'),
  t('presell.payment.notices.refund'),
  t('presell.payment.notices.support')
]

// 加载订单信息
const loadOrderInfo = async () => {
  try {
    const { orderId, type } = route.query
    if (!orderId) {
      router.push('/user/presell')
      return
    }

    isDeposit.value = type === 'deposit'
    const response = await api.get(`/presell/order/${orderId}`)
    if (response.data.code === 200) {
      orderInfo.value = response.data.data
    }
  } catch (error) {
    console.error('获取订单信息失败:', error)
    $q.notify({
      type: 'negative',
      message: t('presell.payment.error.loadFailed')
    })
  }
}

// 处理支付
const handlePayment = async () => {
  if (!selectedMethod.value) return

  try {
    paying.value = true
    const { orderId } = route.query
    const url = isDeposit.value 
      ? `/presell/pay/deposit/${orderId}`
      : `/presell/pay/final/${orderId}`

    const response = await api.post(url, {
      paymentMethod: selectedMethod.value
    })

    if (response.data.code === 200) {
      // 处理支付响应,可能需要跳转到第三方支付页面
      const paymentUrl = response.data.data.paymentUrl
      if (paymentUrl) {
        window.location.href = paymentUrl
      } else {
        router.push({
          path: '/order/success',
          query: {
            orderNo: orderInfo.value.orderNumber,
            total: isDeposit.value ? orderInfo.value.depositAmount : orderInfo.value.finalAmount,
            time: new Date().toISOString()
          }
        })
      }
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.msg || t('presell.payment.error.payFailed')
      })
    }
  } catch (error) {
    console.error('支付失败:', error)
    $q.notify({
      type: 'negative',
      message: t('presell.payment.error.payFailed')
    })
  } finally {
    paying.value = false
  }
}

onMounted(() => {
  loadOrderInfo()
})
</script>

<style lang="scss" scoped>
.presell-payment-page {
  padding: 20px;

  .page-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .payment-card {
    background: #fff;
  }

  .info-item {
    margin-bottom: 12px;
    
    .label {
      color: #666;
      margin-right: 8px;
    }
    
    .value {
      font-weight: 500;
    }
  }

  .payment-method {
    border-top: 1px solid #f0f0f0;
    padding-top: 20px;
  }

  .payment-action {
    text-align: center;
    margin-top: 40px;
  }
}
</style> 