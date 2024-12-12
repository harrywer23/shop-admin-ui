<script setup lang="ts">
definePageMeta({
  layout: false,
});
import PayaplCard from "~/components/payment/PaypalCardComponent.vue";
import {useRoute} from "vue-router";
// 接收url里的参数
const route = useRoute();
const tokenCookie = useCookie('token');
const productAmount = ref(route.query.productAmount);
const productId = ref(route.query.productId);
const productIntro = ref(route.query.productIntro);
const productName = ref(route.query.productName);
const userId = ref(route.query.userId);
const kind = ref(route.query.kind);
const returnUrl = ref(route.query.returnUrl);
const cancelUrl = ref(route.query.cancelUrl);

const isParamsLoaded = ref(false);  // 新的响应式状态变量

onMounted(() => {
  const token = route.query.token;
  ////console.log("--------------------------------------- tokentokentoken "+token );
  const tokenValue = Array.isArray(token) ? token[0] : token;
  if (typeof tokenValue === 'string') {
    tokenCookie.value = tokenValue;
    ////console.log("tokenCookie.value tokenCookie.value tokenCookie.value "+tokenCookie.value );
    // 设置额外的 Cookie 选项，如过期时间等
  } else {
    // 处理 token 不存在的情况
  }
  isParamsLoaded.value = true;
});
</script>

<template>
  <div class="m-4 bg-white">
<!--    <p class="pb-4 text-2xl text-slate-600">这里是最外层 app.vue</p>-->
    <NuxtLayout name="payment" v-if="isParamsLoaded">
      <template #default>
        <PayaplCard :amount="productAmount" :productId="productId" :kind="kind" :intro="productIntro"
                    :productName="productName" :url='"/userVip?userId="+userId'
                    change="modile"
                    :returnUrl="returnUrl"
                    :cancelUrl="cancelUrl"
        />
      </template>
    </NuxtLayout>
    <div v-else>加载中...</div>
  </div>
</template>

<style scoped>

</style>
