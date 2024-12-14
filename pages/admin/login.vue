<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import { Dialog, Notify } from 'quasar';
import {useRouter} from "vue-router";
import {api} from "~/utils/axios";
import {API_CONSTANTS} from "~/utils/constants";
const router = useRouter(); // 使用 Vue Router 的 useRouter 函数

const username = ref('');
const password = ref('');
const uuid = ref('');
const captcha = ref('');
const accept = ref(false);

async function onSubmit() {
  if (!accept.value) {
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'You need to accept the license and terms first'
    })
    return;
  }

  try {
    const response = await api.post("/sysUser/login", {
      username: username.value,
      password: password.value,
      uuid: uuid.value,
      code: captcha.value,
      captcha: captcha.value,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;
    if (data.code == 200) {
      const token = useCookie('token', {
        maxAge: 60 * 60 * 24 * 7, // 7天过期
        path: '/',  // 添加路径
        secure: process.env.NODE_ENV === 'production', // 在生产环境中使用 HTTPS
        sameSite: 'strict'  // 增加安全性
      });

      const userInfo = useCookie('userInfo', { maxAge: 60 * 60 * 24 * 7, path: '/' });
      const accessToken = useCookie('accessToken', { maxAge: 60 * 60 * 24 * 7, path: '/' });
      const refreshToken = useCookie('refreshToken', { maxAge: 60 * 60 * 24 * 7, path: '/' });
      const userId = useCookie('id', { maxAge: 60 * 60 * 24 * 7, path: '/' });

      token.value = data.token;
      userInfo.value = JSON.stringify(data.user);
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      userId.value = data.user.id.toString();

      Dialog.create({
        color: 'positive',
        message: '登录成功'
      });

      setTimeout(() => {
        router.push('/user');
      }, 500);
    } else {
      // await refreshCaptcha();
      Dialog.create({
        color: 'red-5',
        message: data.msg
      });
    }
  } catch (error) {
    // await refreshCaptcha();
    Dialog.create({
      color: 'red-5',
      message: '登录失败，请重试'
    });
  }
}

function login(){
  if (!accept.value) {
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'You need to accept the license and terms first'
    })
    return;
  }
  const captchaConfig = {
    // 请求验证码接口
    // 验证验证码接口
    requestCaptchaDataUrl: API_CONSTANTS.BASE_URL+"/gen",
    validCaptchaUrl: API_CONSTANTS.BASE_URL+"/check",
    // requestCaptchaDataUrl: "https://admin.51x.uk/gen",
    // validCaptchaUrl: "https://admin.51x.uk/check",
    // 绑定的div
    bindEl: "#captcha-box",
    // 验证成功回调函数
    validSuccess: (res, c, t) => {
      //console.log("验证码验证成功回调...")
      //console.log(res.data.id)
      // 销毁验证码
      t.destroyWindow();
      uuid.value=res.data.id;
      onSubmit();
      // alert("验证成功: token:" + res.data.token)
      //console.log(res)
      // todo 携带token调用登录接口
    }
  }
  // 这里分享一些作者自己调的样式供参考
const style = {
    // 按钮样式
    btnUrl: "btn3.png",
    // 背景样式
    bgUrl: "btn3-bg.jpg",
    // logo地址
    logoUrl: "favicon.ico",
    // 滑动边框样式
    moveTrackMaskBgColor: "#f7b645",
    moveTrackMaskBorderColor: "#ef9c0d"
}
  if (process.client) {
    window.initTAC("tac", captchaConfig, style).then(tac => {
      tac.init();
    })
  }
}
onMounted(() => {
    if (process.client) {
      import("~/utils/load.min").then(module => {
        module.default();
      });
    }
});
  // isLogin();
  // 当组件挂载时，刷新验证码
  // refreshCaptcha();
</script>

<template>
  <div class="center-container">
    <div class="q-pa-md" style="max-width: 600px">
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">{{$t(`login.login`)}}</div>
          <div class="text-subtitle2">{{ $t('login.welcome') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md"
          >
            <!-- 账号输入框 -->
            <q-input
                v-model="username"
                :rules="[val => val && val.length > 0 || 'Please enter your account']"
                filled
                :label="$t('login.name')+' *'"
                lazy-rules
            />

            <!-- 密码输入框 -->
            <q-input
                v-model="password"
                :rules="[val => val && val.length > 0 || 'Please enter your password']"
                filled
                :label="$t('login.password')+' *'"
                type="password"
            />

            <!-- 接受条款切换 -->
            <q-toggle v-model="accept" :label="$t(`introTerms`)"></q-toggle>
            <a href="/privacyPolicy">{{ $t(`useTerms`) }}</a><a href="/use">{{ $t(`privateTerms`) }}</a>
            <div>
              <q-btn color="primary" @click="login" :label="$t(`login.login`) " style="width: 100%;"/>
            </div>
            <div id="captcha-box"></div>

            <!-- 注册与忘记密码链接 -->
            <div class="extra-links">
              <router-link to="/admin/register">{{ $t(`login.regis`) }}</router-link>
              <router-link to="/admin/forgotPassword">忘记密码?</router-link>
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
