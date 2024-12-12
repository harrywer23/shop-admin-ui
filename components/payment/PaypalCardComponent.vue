<template>
  <q-card class="my-card">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">{{ props.productName }}</div>
      <div class="text-subtitle2">{{ t('payment.notice.nonRefundable') }}</div>
    </q-card-section>

    <q-card-section>
      {{ props.description }}
    </q-card-section>

    <q-separator />
    <q-separator dark />

    <q-card-actions>
      <q-btn class="left-3" flat>付款金额：{{ props.amount }}</q-btn>
    </q-card-actions>

    <q-separator />

    <q-card-actions justify-center>
      <div id="paypal-button-container" class="paypal-button-container"></div>
      <!-- Card Fields -->
      <div id="card-form" class="card_container">
        <div id="card-name-field-container" class="card-field"></div>
        <div id="card-number-field-container" class="card-field"></div>
        <div id="card-expiry-field-container" class="card-field"></div>
        <div id="card-cvv-field-container" class="card-field"></div>
        <button id="card-field-submit-button" class="submit-button">
          Pay with Card
        </button>
      </div>
      <p id="result-message"></p>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from 'quasar'
import { loadScript } from "@paypal/paypal-js"
import { api } from "~/utils/axios"
import type { PayDto, PaymentOrderIntroDto } from '~/utils/payment'
import {useRouter} from "#vue-router";
const router = useRouter()

const { t } = useI18n()

const props = withDefaults(defineProps<{
  description: string
  returnUrl?: string
  cancelUrl?: string
  country?: string
  amount: string
  productName: string
  orderNumber: string
  items?: PaymentOrderIntroDto[]
}>(), {
  returnUrl: 'pc',
  cancelUrl: 'pc',
  country: 'CN'
})

// 创建订单回调
async function createOrderCallback() {
  try {
    const response = await api.post("/admin/paypal/create", {
      returnUrl: props.returnUrl,
      cancelUrl: props.cancelUrl,
      country: props.country,
      description: props.description,
      items: props.items
    })
    const result = response.data;
    if (result.code !== 200) {
      throw new Error(result.msg || 'Failed to create order')
    }
    return result.data.id;
  } catch (error) {
    console.error('Create order failed:', error)
    throw error
  }
}

// 订单批准回调
async function onApproveCallback(data, actions) {
  try {
    console.log('data', data)
    const response = await api.get(`/admin/paypal/ordersCapture?orderId=${data.orderID}`)

    if (response.data.code === 200) {
      Dialog.create({
        title: '通知',
        message: '支付完成',
        ok: {
          push: true
        }
      })
      router.push({
        path: '/order/success',
        query: {
          orderNumber: props.orderNumber,
          amount: props.amount,
          productName: props.productName
        }
      })

    } else {
      throw new Error(response.data.msg || 'Payment failed')
    }
  } catch (error) {
    console.error('Payment failed:', error)
    Dialog.create({
      title: '错误',
      message: error instanceof Error ? error.message : '支付失败',
      ok: { push: true }
    })
  }
}

// 错误处理回调
function onErrorCallback(error: Error) {
  console.error('PayPal error:', error)
  Dialog.create({
    title: '错误',
    message: '支付过程中发生错误，请稍后重试',
    ok: { push: true }
  })
}

// 初始化 PayPal
async function initializePayPal() {
  try {
    const paypal = await loadScript({
      clientId: "AWwAGKZhvPE3xSgDh-gRH9sXwNMKDQSzr65ZwaUHp-U7CTbUk-FTnRRjlF0zTpz5LaeDz5rHgcaaekVm",
      currency: "USD",
      components: ["buttons", "card-fields"]
    })

    if (!paypal) {
      throw new Error('Failed to load PayPal JS SDK')
    }

    // 渲染 PayPal 按钮
    await paypal.Buttons({
      createOrder: createOrderCallback,
      onApprove: onApproveCallback,
      onError: onErrorCallback,
      style: {
        shape: "pill",
        layout: "vertical",
        color: "gold",
        label: "paypal"
      }
    }).render("#paypal-button-container")

    // 初始化卡片字段
    const cardFields = paypal.CardFields({
      createOrder: createOrderCallback,
      onApprove: onApproveCallback,
      style: {
        input: {
          "font-size": "16px",
          "font-family": "Arial, sans-serif",
          color: "#3a3a3a"
        },
        ".invalid": { color: "#E53935" }
      }
    })

    if (cardFields.isEligible()) {
      // 渲染各个字段
      await Promise.all([
        cardFields.NameField().render("#card-name-field-container"),
        cardFields.NumberField().render("#card-number-field-container"),
        cardFields.ExpiryField().render("#card-expiry-field-container"),
        cardFields.CVVField().render("#card-cvv-field-container")
      ])

      // 添加提交按钮事件监听
      const submitButton = document.getElementById("card-field-submit-button")
      if (submitButton) {
        submitButton.addEventListener("click", async () => {
          try {
            // const state = await cardFields.getState()
            // console.log('Card fields state:', state)

            // if (!state.isFormValid) {
            //   throw new Error(t('payment.card.invalidFields'))
            // }

            await cardFields.submit()
          } catch (error) {
            console.error('Card submission failed:', error)
            Dialog.create({
              title: '错误',
              message: error instanceof Error ? error.message : t('payment.failed'),
              ok: { push: true }
            })
          }
        })
      }
    }
  } catch (error) {
    console.error('Failed to initialize PayPal:', error)
    Dialog.create({
      title: '错误',
      message: '支付初始化失败，请刷新页面重试',
      ok: { push: true }
    })
  }
}

onMounted(() => {
  initializePayPal()
})
</script>

<style scoped>
.card_container {
  width: 100%;
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
}

.card-field {
  height: 44px;
  margin-bottom: 15px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  transition: border-color 0.3s;
}

.card-field:hover {
  border-color: #0070ba;
}

.submit-button {
  width: 100%;
  height: 44px;
  margin-top: 20px;
  background: #0070ba;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-button:hover {
  background: #003087;
}

#result-message {
  margin-top: 20px;
  color: #666;
  text-align: center;
}

.paypal-button-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}
</style>
