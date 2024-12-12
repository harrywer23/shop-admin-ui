<script lang="ts" setup>
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
import {ref} from "vue";
import {  Dialog, useQuasar } from 'quasar';
import {useRouter} from "vue-router";
import {api} from "~/utils/axios";

import PayaplCard from "~/components/payment/PaypalCardComponent.vue";
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const token = useCookie('token');
const router = useRouter(); // 使用 Vue Router 的 useRouter 函数

const user = ref({  });
const imgUrl = ref("/favicon.png");
const vip = ref(0);
const vipExpirationTime = ref(null);

async function getDetail() {
  const response = await api.get(`/admin/systemUser/getInfo`);
  const data = response.data;
  if (data.code == 200) {
    user.value=data.data;
    imgUrl.value = data.data.imgUrl  ;
    vip.value = data.data.vip;
    vipExpirationTime.value = data.data.vipExpirationTime;
  }
}
getDetail();

const  money=ref(0.0);
const paypalDialog = ref(false);

function openPayPalDialog (){
  if(money.value<1){
    Dialog.create({
      title: $t('admin.recharge.title'),
      message: $t('admin.recharge.minAmount'),
    })
    return;
  }
  ////console.log("------------openPayPalDialog---------------------------")
  if(token !== null && token !== '' && token !== undefined ) {
    paypalDialog.value = true;
  }else {
    Dialog.create({
      title: $t('admin.recharge.title'),
      message: $t('admin.recharge.needLogin'),
      ok: {
        push: true
      },
      cancel: {
        push: true
      },
    }).onOk(async () => {
      router.push('/login'); // Redirect to login page
    }).onCancel(async () => {
      // router.push('/admin/album'); // Redirect to login page
    });
  }
};
const cardId=ref("");

async function onSubmit() {
  const response = await api.post("/admin/rechargeCards/use", JSON.stringify({
    cardId: cardId.value,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  const data = response.data;
  ////console.log(data)
  if (data.code == 200) {
    Dialog.create({
      title: '通知',
      message: '激活成功.',
    })
    cardId.value="";
  } else {
    Dialog.create({
      title: '通知',
      message: `激活失败.${data.msg}`,
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

<template>
  <div class="q-pa-md">
    <!-- 顶部操作栏 -->
    <div class="row q-mb-md justify-between items-center">
      <div class="text-h5">{{ $t('admin.title') }}</div>
      <q-btn
          color="primary"
          :label="$t('user.edit')"
          icon="edit"
          to="/admin/users/userEdit"
      />
    </div>

    <div class="row q-col-gutter-md">
      <!-- 用户基本信息卡片 -->
      <div class="col-12 col-md-4">
        <q-card class="user-profile-card">
          <q-card-section class="text-center">
            <!-- 头像显示区域 -->
            <q-avatar size="100px" class="q-mb-sm">
              <q-img
                  :src="getImageUrl(imgUrl) || '/images/favicon.webp'"
                  @error="(err) => err.target.src = '/images/favicon.webp'"
              >
                <template v-slot:loading>
                  <q-spinner-bars color="white" />
                </template>
              </q-img>
            </q-avatar>

            <!-- 用户基本信息 -->
            <div class="text-h6 q-mt-sm">{{ user.nickname || $t('admin.userStatus.waitingLogin') }}</div>
            <div class="text-subtitle2">{{ user.email }}</div>
            <q-chip
                :color="vip ? 'positive' : 'grey'"
                text-color="white"
                icon="star"
                class="q-mt-sm"
            >
              {{ vip ? $t('admin.userStatus.vip') : $t('admin.userStatus.regular') }}
            </q-chip>
            <div v-if="vip" class="text-caption q-mt-xs">
              {{ $t('admin.userStatus.expireTime') }}: {{ vipExpirationTime }}
            </div>
          </q-card-section>

          <q-separator />

          <!-- 用户详细信息 -->
          <q-card-section>
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label>ID</q-item-label>
                  <q-item-label caption>{{ user.id }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label>最近登陆时间</q-item-label>
                  <q-item-label caption>{{ user.updeteTime }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <div class="balance-section">
                    <div class="balance-label">
                      <q-icon name="account_balance_wallet" color="primary" size="24px" class="q-mr-sm"/>
                      <span class="text-subtitle1">账户余额</span>
                    </div>
                    <div class="balance-amount">
                      <span class="currency">$</span>
                      <span class="amount">{{ user.balance || '0.00' }}</span>
                      <!-- <q-btn
                        flat
                        dense
                        round
                        color="primary"
                        icon="add_circle"
                        class="q-ml-sm"
                        @click="openPayPalDialog"
                        :title="$t('admin.recharge.button')"
                      /> -->
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- 统计信息卡片 -->
      <div class="col-12 col-md-8">
        <div class="row q-col-gutter-md">
          <!-- 统计卡片 -->
          <div class="col-12 col-sm-6 col-md-4">
            <q-card class="stat-card">
              <q-card-section>
                <div class="text-subtitle2">{{ $t('admin.stats.followers') }}</div>
                <div class="text-h4">{{ user.countAttention || 0 }}</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-card class="stat-card">
              <q-card-section>
                <div class="text-subtitle2">{{ $t('admin.stats.likes') }}</div>
                <div class="text-h4">{{ user.countLike || 0 }}</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-card class="stat-card">
              <q-card-section>
                <div class="text-subtitle2">{{ $t('admin.stats.views') }}</div>
                <div class="text-h4">{{ user.countSee || 0 }}</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- 充值卡片 -->
          <div class="col-12">
            <q-card>
              <q-card-section>
                <div class="text-h6">{{ $t('admin.recharge.title') }}（不支持中国银行卡）</div>
                <div class="row items-center q-mt-md">
                  <q-input
                      v-model="money"
                      type="number"
                      :label="$t('admin.recharge.amount')"
                      class="col-grow"
                      min="1"
                      step="0.01"
                  />
                  <q-btn
                      color="primary"
                      :label="$t('admin.recharge.button')"
                      class="q-ml-md"
                      @click="openPayPalDialog"
                  />
                </div>
              </q-card-section>
            </q-card>
            <q-card>
              <q-card-section>
                 <!-- 充值卡部分 -->
            <div class="row justify-between items-center">
              <div class="text-h6">充值卡激活</div>
              <q-btn
  color="primary"
  :label="$t('admin.recharge.buyCard')"
  icon="shopping_cart"
  type="a"
  href="https://www.51k.uk?cid=3&mid=3"
  target="_blank"
  class="q-ml-md"
/>
            </div>
                <div class="row items-center q-mt-md">
                  <q-input
                      v-model="cardId"
                      label="输入激活吗"
                      class="col-grow"
                  />
                  <q-btn
                      color="primary"
                      label="确定激活"
                      class="q-ml-md"
                      @click="onSubmit()"
                  />
                </div>
              </q-card-section>
            </q-card>

          </div>
        </div>
      </div>
    </div>

    <!-- PayPal 充值对话框 -->
    <q-dialog v-model="paypalDialog">
      <PayaplCard
          :amount="money"
          :product-id="user.id"
          :kind="5"
          intro="充值余额"
          product-name="充值余额"
          url="/admin"
      />
    </q-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user-profile-card {
  height: 100%;
}

.stat-card {
  background: linear-gradient(145deg, #1976d2 0%, #0d47a1 100%);
  color: white;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
}

.q-card {
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
}
</style>
