<template>
  <div class="payment-page">
    <div class="container q-pa-md">
      <!-- 订单信息卡片 -->
      <q-card flat bordered class="order-info q-mb-md">
        <q-card-section>
          <div class="text-h6">{{ $t('payment.orderInfo') }}</div>
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-md-6">
              <div class="text-subtitle2">{{ $t('payment.orderNumber') }}</div>
              <div class="text-body1">{{ orderInfo.orderNumber }}</div>
              <div class="text-body1">{{ orderInfo.prodName }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-subtitle2">{{ $t('payment.amount') }}</div>
              <div class="text-h5 text-primary">¥{{ orderInfo.actualTotal }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 支付方式选择 -->
      <q-card flat bordered class="payment-methods q-mb-md">
        <q-card-section>
          <div class="text-h6">{{ $t('payment.methods.title') }}</div>

          <!-- 余额支付 -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-radio v-model="selectedMethod" val="balance" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('payment.methods.balance') }}</q-item-label>
              <q-item-label caption>
                {{ $t('payment.methods.balanceAmount') }}: ¥{{ userBalance }}
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="userBalance < orderInfo.actualTotal">
              <q-btn
                color="primary"
                :label="$t('payment.recharge')"
                @click="goToRecharge"
                flat
              />
            </q-item-section>
          </q-item>

          <!-- 支付宝支付 -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-radio v-model="selectedMethod" val="alipay" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('payment.methods.alipay') }}</q-item-label>
              <q-item-label caption>
                {{ $t('payment.methods.alipayDesc') }}
              </q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-img src="/payment/alipay.jpeg" width="40px" />
            </q-item-section>
          </q-item>

          <!-- 微信支付 -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-radio v-model="selectedMethod" val="wechat" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('payment.methods.wechat') }}</q-item-label>
              <q-item-label caption>
                {{ $t('payment.methods.wechatDesc') }}
              </q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-img src="/payment/wechat.webp" width="40px" />
            </q-item-section>
          </q-item>

          <!-- PayPal支付 -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-radio v-model="selectedMethod" val="paypal" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('payment.methods.paypal') }}</q-item-label>
              <q-item-label caption>
                {{ $t('payment.methods.paypalDesc') }}
              </q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-img src="/payment/paypal.jpeg" width="40px" />
            </q-item-section>
          </q-item>
        </q-card-section>
      </q-card>

      <!-- 支付按钮 -->
      <div class="payment-action">
        <q-btn
          color="primary"
          :label="$t('payment.pay')"
          class="full-width"
          size="lg"
          :loading="paying"
          :disable="!canPay"
          @click="handlePayment"
        />
        <div class="text-caption text-grey q-mt-sm text-center">
          {{ $t('payment.notice.nonRefundable') }}
        </div>
      </div>

      <!-- 支付二维码弹窗 -->
      <q-dialog v-model="showQrCode" persistent>
        <q-card style="min-width: 300px">
          <q-card-section class="row items-center">
            <div class="text-h6">{{ $t('payment.qrcode.title') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="text-center">
            <q-img :src="qrCodeUrl" style="width: 200px; height: 200px" />
            <div class="text-subtitle1 q-mt-md">
              {{ $t('payment.qrcode.amount') }}: ¥{{ orderInfo.actualTotal }}
            </div>
            <div class="text-caption text-grey">
              {{ $t('payment.qrcode.tip') }}
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </div>
    <!-- PayPal支付对话框 -->
   <q-dialog v-model="paypalDialog">
      <q-card style="width: 90vw; max-width: 800px">
        <PayaplCard
          :amount="checkOrder.amount"
          :items="checkOrder.items"
          :intro="checkOrder.orderNumbers"
          product-name="支付订单"
          url="/admin"
        />
      </q-card>
    </q-dialog>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'
import PayaplCard from "~/components/payment/PaypalCardComponent.vue";

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// 状态变量
const orderInfo = ref({
  orderNumber: '',
  prodName: '',
  orderId: '',
  actualTotal: 0,
  status: ''
})
const userBalance = ref(0)
const selectedMethod = ref('balance')
const paypalDialog=ref(false);
const paying = ref(false)
const showQrCode = ref(false)
const qrCodeUrl = ref('')
const checkTimer = ref<NodeJS.Timer>()
const checkOrder=ref({})

// 计算属性
const canPay = computed(() => {
  //console.log("------1------")
  //console.log(orderInfo)
  if (!orderInfo.value || !userBalance.value) return false
  //console.log("------2------")
  // 余额支付时检查余额是否足够
  if (selectedMethod.value === 'balance') {
    //console.log("------3------",userBalance.value,orderInfo.value.actualTotal)
    return Number(userBalance.value) >= Number(orderInfo.value.actualTotal)
  }

  // 其他支付方式直接返回true
  return true
})
const kind=ref(1);

// 加载订单信息
const loadOrderInfo = async () => {
  try {
    const orderNumber = route.query.orderNumber as string
    if (!orderNumber) {
      throw new Error('订单号不能为空')
    }

    const response = await api.get(`/admin/order/info?orderNumber=${orderNumber}`)
    const { code, data } = response.data

    if (code === 200) {
      //充值订单
      if(data.orderType==2){
        kind.value=3;
      }
      orderInfo.value = data
      checkOrder.value.amount=data.actualTotal;
      checkOrder.value.items=[
        {
          orderId: data.orderId, // Long 在 TypeScript 中可以用 number 表示
          orderNumber: data.orderNumber,
          prodName: data.prodName,
          amount: data.actualTotal,// Double 在 TypeScript 中同样用 number 表示
          kind: kind.value
        }
      ]
      checkOrder.value.orderNumbers=data.orderNumber;
     console.log("checkOrder:",checkOrder)
      if (data.status === 2) {
        $q.notify({
          type: 'warning',
          message: '该订单已支付'
        })
        router.replace(`/user/orders/${orderNumber}`)
        return
      }

      if (data.status === 5) {
        $q.notify({
          type: 'warning',
          message: '该单已取消'
        })
        router.replace(`/user/orders/${orderNumber}`)
        return
      }
    } else {
      throw new Error('加载订单信息失败')
    }
  } catch (error) {
    console.error('加载订单信息失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '加载订单信息失败'
    })
  }
}

// 加载户余额
const loadUserBalance = async () => {
  try {
    const response = await api.get('/user/balance')
    const { code, data } = response.data
    if (code === 200) {
      userBalance.value = data
    }
  } catch (error) {
    console.error('加载用户余额失败:', error)
  }
}

// 跳转到充值页面
const goToRecharge = () => {
  router.push('/user/recharge')
}

// 处理支付
const handlePayment = async () => {
  if (!canPay.value) {
    $q.notify({
      type: 'warning',
      message: t('payment.insufficientBalance')
    })
    return
  }

  try {
    paying.value = true

    if (selectedMethod.value === 'balance') {

      // 余额支付
      const response = await api.post('/admin/paypal/pay',
          JSON.stringify({
            returnUrl: `${window.location.origin}/order/success`,
            cancelUrl: `${window.location.origin}/order/fail`,
            country: "CN",
            description: "结账页面跳转支付",
            items: checkOrder.value.items,
          })
      );

      if (response.data.code === 200) {
        // 余额支付直接跳转到成功页面
        router.push({
          path: '/order/success',
          query: {
            orderNumber: orderInfo.value.orderNumbers,
            amount: orderInfo.value.amount
          }
        })
      } else {
        throw new Error(response.data.msg || t('payment.error.payFailed'))
      }
    } else {
      // 其他支付方式
      // const response = await api.post('/order/pay', {
      //   orderNumber: orderInfo.value.orderNumber,
      //   payMethod: selectedMethod.value
      // })
      //
      // if (response.data.code === 200) {
      //   // 显示二维码
      //   qrCodeUrl.value = response.data.data.qrCode
      //   showQrCode.value = true
      //   startCheckPayStatus()
      // } else {
      //   throw new Error(response.data.msg || t('payment.error.payFailed'))
      // }
      if (selectedMethod.value === 'paypal') {
        paypalDialog.value=true;
      }
    }
  } catch (error) {
    console.error('支付失败:', error)
    $q.notify({
      type: 'negative',
      message: error.message || t('payment.error.payFailed')
    })
  } finally {
    paying.value = false
  }
}

// 开始检查支付状态
const startCheckPayStatus = () => {
  checkTimer.value = setInterval(async () => {
    try {
      const response = await api.get(`/order/payStatus/${orderInfo.value.orderNumber}`)
      if (response.data.code === 200 && response.data.data.isPaid) {
        clearInterval(checkTimer.value)
        showQrCode.value = false
        router.push({
          path: '/order/success',
          query: {
            orderNo: orderInfo.value.orderNumber,
            total: orderInfo.value.actualTotal,
            time: new Date().toISOString()
          }
        })
      }
    } catch (error) {
      console.error('检查支付状态失败:', error)
    }
  }, 3000)
}

// 获取用户信息
// const getUserInfo = async () => {
//   try {
//     const response = await api.get('/user/info')
//     if (response.data.code === 200) {
//       userInfo.value = response.data.data
//     }
//   } catch (error) {
//     console.error('获取用户信息失败:', error)
//   }
// }

// 生命周期钩子
onMounted(async () => {
  await Promise.all([
    loadOrderInfo(),
    loadUserBalance(),
    // getUserInfo()
  ])
})

// 清理定时器
onBeforeUnmount(() => {
  if (checkTimer.value) {
    clearInterval(checkTimer.value)
  }
})
</script>

<style lang="scss" scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f5f5;

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding-top: 20px;
  }

  .payment-methods {
    .q-item {
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background: #f5f5f5;
      }
    }
  }

  .payment-action {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px 0;
  }
}
</style>
