<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { api } from '~/utils/axios'

const router = useRouter()
const inviteCode = useCookie('invite')
const name = ref('')
const email = ref('')
const password = ref('')
const uuid = ref('')
const accept = ref(false)
const showPassword = ref(false)

// 用户名和密码的验证规则
const usernameRules = [
  (val: string) => /^[a-zA-Z0-9]+$/.test(val) || 'Username must contain only letters and numbers',
  (val: string) => val.length >= 5 && val.length <= 20 || 'Username must be between 5 and 20 characters'
]

const passwordRules = [
  (val: string) => val.length >= 5 && val.length <= 20 || 'Password must be between 5 and 20 characters'
]

// 重置表单
function onReset() {
  name.value = ''
  email.value = ''
  password.value = ''
  accept.value = false
}

// 提交注册
async function onSubmit() {
  if (!accept.value) {
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'You need to accept the license and terms first'
    })
    return
  }

  try {
    // 构建注册数据
    const registerData = {
      name: name.value,
      email: email.value,
      password: password.value,
      uuid: uuid.value,
      inviteCode: inviteCode.value
    }

    //console.log('注册数据:', registerData)

    const response = await api.post('/sysUser/register', registerData)
    const data = response.data

    if (data && data.code === 200) {
      Notify.create({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Registration successful'
      })

      // 延迟跳转
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      throw new Error(data.msg || 'Registration failed')
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: error.message || 'An error occurred'
    })
  }
}

// 切换密码显示
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="center-container">
    <div class="q-pa-md" style="max-width: 600px">
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">{{ $t('login.regis') }}</div>
          <div class="text-subtitle2">{{ $t('login.welcome') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form
            class="q-gutter-md"
            @reset="onReset"
            @submit.prevent="onSubmit"
          >
            <!-- 用户名输入 -->
            <q-input
              v-model="name"
              :label="$t('login.name') + ' *'"
              :rules="usernameRules"
              filled
              lazy-rules
            />

            <!-- 邮箱输入 -->
            <q-input
              v-model="email"
              :label="$t('login.email') + ' *'"
              :rules="[
                val => !!val || 'Email is required',
                val => val.length >= 5 && val.length <= 30 || 'Email must be between 5 and 30 characters',
                val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format'
              ]"
              filled
              type="email"
              lazy-rules
            />

            <!-- 密码输入 -->
            <q-input
              v-model="password"
              :label="$t('login.password') + ' *'"
              :rules="passwordRules"
              :type="showPassword ? 'text' : 'password'"
              filled
              lazy-rules
            >
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="togglePasswordVisibility"
                />
              </template>
            </q-input>

            <!-- 条款同意 -->
            <div class="terms-section">
              <q-toggle v-model="accept" :label="$t('introTerms')" />
              <div class="terms-links">
                <a href="/privacyPolicy">{{ $t('useTerms') }}</a>
                <a href="/use">{{ $t('privateTerms') }}</a>
              </div>
            </div>

            <!-- 提交按钮 -->
            <q-btn
              :label="$t('login.regis')"
              color="primary"
              class="full-width"
              type="submit"
            />

            <!-- 登录链接 -->
            <div class="extra-links">
              <router-link to="/admin/login" class="login-link">
                {{ $t('login.login') }}
              </router-link>
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
  min-height: 100vh;
  padding: 20px;
}

.terms-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.terms-links {
  display: flex;
  gap: 16px;
}

.terms-links a {
  color: var(--q-primary);
  text-decoration: none;
}

.extra-links {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.login-link {
  color: var(--q-primary);
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
