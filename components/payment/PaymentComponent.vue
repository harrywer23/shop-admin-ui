<template>
  <q-card class="my-card">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6" v-if="props.kind != 1">{{ props.productName }}</div>
      <div class="text-h6" v-if="props.kind == 1">{{   $t(`vip.${props.productName}`) }}</div>

      <div class="text-subtitle2">  {{ $t('payment.notice.nonRefundable') }}</div>
    </q-card-section>
    <q-card-section>
      {{ props.intro }}
    </q-card-section>
    <q-separator />
    <q-separator dark />

    <q-card-actions>
      <q-btn class="left-3" flat>{{ $t('payment.price') }}：{{props.amount}}</q-btn>
      <q-btn class="left-3" flat>{{ $t('payment.paymentAmount') }}：{{discountAmount}}</q-btn>
    </q-card-actions>
    <q-card-actions>
      <q-btn class="left-3" flat>{{ $t('payment.accountBalance') }}：{{user.balance}}</q-btn>
    </q-card-actions>
    <q-card-actions>
      <q-btn class="left-3" flat to="/admin">{{ user.balance < discountAmount ? $t('payment.insufficientBalance') : "" }}</q-btn>
    </q-card-actions>
    <q-card-actions>
      <q-btn class="left-3" @click="onPay()">{{ $t('payment.pay') }}</q-btn>
      <q-btn class="left-3" to="/admin">{{ $t('payment.recharge') }}</q-btn>
    </q-card-actions>
  </q-card>


</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { Dialog } from 'quasar'
import { api } from '~/utils/axios'
import { deleteCache } from '~/utils/storage'
import type { PayDto, PaymentOrderIntroDto } from '~/utils/payment'

// 使用 PayDto 接口定义 props
const props = defineProps<{
  // 基本支付信息
  description: string
  userId: number
  returnUrl: string
  cancelUrl: string
  country: string

  // 扩展的支付信息
  amount: string
  productName:String
  // 订单信息
  intros?: PaymentOrderIntroDto[]
}>()

// 设置默认值
withDefaults(defineProps<{
  url?: string
  change?: 'pc' | 'mobile'
  returnUrl?: string
  cancelUrl?: string
  country?: string
}>(), {
  url: '/index',
  change: 'pc',
  returnUrl: 'pc',
  cancelUrl: 'pc',
  country: 'CN'
})

const token=useCookie("token");

const user=ref({});
async function getDetail() {
  const response = await api.get(`/admin/systemUser/getInfo`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  const data = response.data;
  if (data.code == 200) {
    user.value = data.data;
  }
}
getDetail();
const discountAmount=ref(0);
async function getAmount() {
  // 滚动到顶部
  const response = await api.post("/admin/payments/getAmount",JSON.stringify({
    returnUrl: props.returnUrl,
    cancelUrl: props.cancelUrl,
    country: props.country,
    description: props.description,
    intros: props.intros
  }),  {
    headers: {
      "Content-Type": "application/json",
      "change":props.change,
      "Authorization": `Bearer ${token}`
    }
  })
  const data = response.data;
  if (data.code === 200) {
    discountAmount.value=data.data
  }
}
getAmount();
async  function onPay(){
  const response = await api.post(`/admin/payments/pay`,  JSON.stringify({
    returnUrl: props.returnUrl,
    cancelUrl: props.cancelUrl,
    country: props.country,
    description: props.description,
    intros: props.intros
  }),{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  const data = response.data;
  if (data.code == 200) {
    const cacheKey = "user_album_detail_"+props.productId;
     deleteCache(cacheKey);
    Dialog.create({
      title: '通知',
      message: `支付成功.`,
      ok: {
        push: true
      },
      cancel: {
        push: true,
        color: 'negative'
      },
    }).onOk(async () => {
  //刷新页面
      location.reload();
    }).onCancel(() => {
      //刷新页面
      location.reload();
      ////console.log('Cancel')
    });
  }else{
    Dialog.create({
      title: '通知',
      message: `支付失败.${data.msg}`,
      ok: {
        push: true
      },
      cancel: {
        push: true,
        color: 'negative'
      },
    }).onOk(async () => {

    }).onCancel(() => {
      ////console.log('Cancel')
    });
  }
}

</script>

<style scoped>
/* 您的样式 */
.card_container {
  /* 样式定义 */
}
/* 其他样式 */
</style>
