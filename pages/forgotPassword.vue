<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import { Dialog, useQuasar } from 'quasar';
import {useRouter} from "vue-router";
import {api} from "~/utils/axios";
const router = useRouter(); // 使用 Vue Router 的 useRouter 函数

const email = ref('');
async function onSubmit() {
  try {
    const response = await api.get("/admin/systemUser/sendCheckEmailCode?email="+email.value, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = response.data;
    if (data.code == 200) {
      router.push('/checkEmailCode'); // 或者其他页面
    } else {
      Dialog.create({
        color: 'red-5',
        message: data.msg
      });
    }
  } catch (error) {
    //console.log(error)
  }
}

</script>


<template>
  <div class="center-container">
    <div class="q-pa-md" style="max-width: 600px">
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">找回密码</div>
          <div class="text-subtitle2">发送邮箱验证码，只有验证过的邮箱才能用于找回</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md" @submit.prevent="onSubmit">
            <!-- 账号输入框 -->
            <q-input
              v-model="email"
              :rules="[val => val && val.length > 3 || '请输入你的emial']"
              filled
              :label="$t('login.email')+' *'"
              lazy-rules
            />
            <div>
              <q-btn color="primary" label="发送验证码" style="width: 100%;" type="submit"/>
            </div>

          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<style scoped>
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* 使容器至少与视口一样高 */
}

.extra-links {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>
