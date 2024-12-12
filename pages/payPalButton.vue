<template>
  <div id="paypal-button-container"></div>
</template>

<script setup lang="ts">
import { loadScript } from "@paypal/paypal-js";
import { onMounted, ref } from 'vue';

const paypalRef = ref(null);

onMounted(async () => {
  try {
    // 获取浏览器语言设置
    const userLang = navigator.language || navigator.userLanguage;
    // 替换为您的 PayPal 客户端 ID
    const clientId = "AWwAGKZhvPE3xSgDh-gRH9sXwNMKDQSzr65ZwaUHp-U7CTbUk-FTnRRjlF0zTpz5LaeDz5rHgcaaekVm";
    paypalRef.value = await loadScript({
      "client-id": clientId ,
      // "Locale": userLang // 使用用户的语言和地区设置
    });
    if (paypalRef.value) {
      setupPayPalButton();
    } else {
      console.error("PayPal SDK not loaded");
    }
  } catch (error) {
    console.error("Failed to load the PayPal JS SDK script", error);
  }
});

function setupPayPalButton() {
  paypalRef.value.Buttons({
    createOrder: (data, actions) => {
      // 在此处添加订单创建逻辑
      return actions.order.create({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: "d9f80740-38f0-11e8-b467-0ed5f89f718b",
          amount: {
            "currency_code": "USD",
            value: '18' // 设置交易金额
          }
        }],
      });
    },
    onApprove: (data, actions) => {
      // 在此处添加批准订单处理逻辑
      return actions.order.capture().then(function(details) {
        // 显示支付成功消息，例如：
        alert("Payment Successful! Thank you for your purchase, " + details.payer.name.givenName);
      });
    },
    onError: (err) => {
      // 在此处处理错误
      alert("An error occurred with your payment");
    }
  }).render("#paypal-button-container");
}
</script>

<style>
/* 如果需要，您可以在这里添加额外的 CSS 样式 */
</style>
