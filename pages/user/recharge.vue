<template>
  <div class="recharge-page">
    <h1 class="text-h4 q-mb-lg">账户充值</h1>

    <!-- 账户信息卡片 -->
    <q-card flat bordered class="account-info q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between">
          <div>
            <div class="text-subtitle1">当前余额</div>
            <div class="text-h5 text-primary">¥{{ userBalance }}</div>
          </div>
          <q-btn
            flat
            color="primary"
            icon="history"
            label="充值记录"
            @click="router.push('/user/recharge/history')"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- 充值金额选择 -->
    <q-card flat bordered class="recharge-amount q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">选择充值金额</div>
        <div class="row q-col-gutter-md">
          <!-- 预设金额选项 -->
          <div v-for="amount in rechargeAmounts" :key="amount" class="col-6 col-sm-4">
            <q-btn
              :class="{ 'selected': selectedAmount === amount }"
              class="amount-btn full-width"
              :label="`¥${amount}`"
              :color="selectedAmount === amount ? 'primary' : 'grey-3'"
              :text-color="selectedAmount === amount ? 'white' : 'black'"
              @click="handleAmountSelect(amount)"
            />
          </div>
          <!-- 自定义金额输入 -->
          <div class="col-12">
            <q-input
              v-model.number="customAmount"
              type="number"
              label="自定义金额"
              outlined
              dense
              :rules="[
                val => !val || val >= 1 || '最小充值金额为1元',
                val => !val || val <= 50000 || '单次最大充值金额为50000元'
              ]"
              @update:model-value="handleCustomAmountChange"
            >
              <template v-slot:prepend>
                <q-icon name="paid" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 支付方式选择 -->
    <q-card flat bordered class="payment-methods q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">选择支付方式</div>

        <!-- 支付宝支付 -->
        <q-item tag="label" v-ripple>
          <q-item-section avatar>
            <q-radio v-model="selectedMethod" val="alipay" />
          </q-item-section>
          <q-item-section>
            <q-item-label>支付宝支付</q-item-label>
            <q-item-label caption>
              推荐有支付宝账号的用户使用
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-img src="/payment/alipay.png" width="40px" />
          </q-item-section>
        </q-item>

        <!-- 微信支付 -->
        <q-item tag="label" v-ripple>
          <q-item-section avatar>
            <q-radio v-model="selectedMethod" val="wechat" />
          </q-item-section>
          <q-item-section>
            <q-item-label>微信支付</q-item-label>
            <q-item-label caption>
              推荐微信用户使用
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-img src="/payment/wechat.png" width="40px" />
          </q-item-section>
        </q-item>

        <!-- PayPal支付 -->
        <q-item tag="label" v-ripple>
          <q-item-section avatar>
            <q-radio v-model="selectedMethod" val="paypal" />
          </q-item-section>
          <q-item-section>
            <q-item-label>PayPal</q-item-label>
            <q-item-label caption>
              推荐国际用户使用
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-img src="/payment/paypal.png" width="40px" />
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>

    <!-- 充值按钮 -->
    <div class="recharge-action">
      <q-btn
        color="primary"
        label="立即充值"
        class="full-width"
        size="lg"
        :loading="loading"
        :disable="!canRecharge"
        @click="handleRecharge"
      />
      <div class="text-caption text-grey q-mt-sm text-center">
        点击充值表示同意《充值服务协议》
      </div>
    </div>

    <!-- 支付二维码弹窗 -->
    <q-dialog v-model="showQrCode" persistent>
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center">
          <div class="text-h6">扫码支付</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="text-center">
          <q-img :src="qrCodeUrl" style="width: 200px; height: 200px" />
          <div class="text-subtitle1 q-mt-md">
            充值金额: ¥{{ selectedAmount }}
          </div>
          <div class="text-caption text-grey">
            请使用{{ selectedMethod === 'alipay' ? '支付宝' : '微信' }}扫码支付
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'

const router = useRouter()
const $q = useQuasar()

// 状态变量
const userBalance = ref(0)
const selectedAmount = ref(0)
const customAmount = ref<number | null>(null)
const selectedMethod = ref('alipay')
const loading = ref(false)
const showQrCode = ref(false)
const qrCodeUrl = ref('')
const checkTimer = ref<NodeJS.Timer>()

// 预设充值金额选项
const rechargeAmounts = [10, 50, 100, 200, 500, 1000]

// 计算是否可以充值
const canRecharge = computed(() => {
  return selectedAmount.value > 0 && selectedAmount.value <= 50000
})

// 加载用户余额
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

// 处理充值
const handleRecharge = async () => {
  if (!canRecharge.value) return

  loading.value = true
  try {
    const rechargeData = {
      amount: selectedAmount.value,
      payType: selectedMethod.value
    }

    const response = await api.post('/user/recharge', rechargeData)
    const { code, data, msg } = response.data

    if (code === 200) {
      if (selectedMethod.value === 'paypal') {
        // PayPal支付跳转
        window.location.href = data.payUrl
      } else {
        // 显示支付二维码
        qrCodeUrl.value = data.qrCode
        showQrCode.value = true
        startCheckPayment(data.rechargeId)
      }
    } else {
      throw new Error(msg || '充值失败')
    }
  } catch (error) {
    console.error('充值失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '充值失败'
    })
  } finally {
    loading.value = false
  }
}

// 开始检查支付状态
const startCheckPayment = (rechargeId: string) => {
  checkTimer.value = setInterval(async () => {
    try {
      const response = await api.get(`/user/recharge/status/${rechargeId}`)
      const { code, data } = response.data
      if (code === 200 && data.isPaid) {
        clearInterval(checkTimer.value)
        showQrCode.value = false
        $q.notify({
          type: 'positive',
          message: '充值成功'
        })
        loadUserBalance() // 刷新余额
      }
    } catch (error) {
      console.error('检支付状态失败:', error)
    }
  }, 3000)
}

// 处理预设金额选择
const handleAmountSelect = (amount: number) => {
  selectedAmount.value = amount
  customAmount.value = null // 清空自定义金额
}

// 处理自定义金额变更
const handleCustomAmountChange = (value: number | null) => {
  if (value) {
    selectedAmount.value = value
  } else {
    selectedAmount.value = 0
  }
}

// 生命周期钩子
onMounted(() => {
  loadUserBalance()
})

onBeforeUnmount(() => {
  if (checkTimer.value) {
    clearInterval(checkTimer.value)
  }
})
</script>

<style lang="scss" scoped>
.recharge-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .amount-btn {
    height: 50px;
    font-size: 1.2em;
    border-radius: 8px;
    margin-bottom: 12px;
    transition: all 0.3s ease;

    // 移除原有的selected类样式，使用q-btn的color属性来控制
    &:hover {
      transform: scale(1.02);
    }
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

  .recharge-action {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px 0;
  }

  // 添加响应式样式
  @media (max-width: 599px) {
    .amount-btn {
      height: 44px;
      font-size: 1em;
    }
  }
}
</style> 