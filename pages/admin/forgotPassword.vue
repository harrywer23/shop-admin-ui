<script lang="ts" setup>
import { ref } from 'vue';
import { api } from '~/utils/axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();

const email = ref('');
const loading = ref(false);

// 发送重置密码邮件
async function sendResetEmail() {
  if (!email.value) {
    $q.notify({
      type: 'warning',
      message: t('password.forgot.emailPlaceholder')
    });
    return;
  }

  // 验证邮箱格式
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    $q.notify({
      type: 'warning',
      message: t('password.forgot.invalidEmail')
    });
    return;
  }

  loading.value = true;
  try {
    console.log('Sending reset email to:', email.value);
    const response = await api.get('/sysUser/sendCheckEmailCode', {
      params: { email: email.value }
    });

    console.log('Send email response:', response.data);

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('password.forgot.emailSent')
      });
      router.push('/resetPasswordSent');
    } else {
      throw new Error(response.data.msg || t('service.notification.error'));
    }
  } catch (error) {
    console.error('Error sending reset email:', error);
    $q.notify({
      type: 'negative',
      message: error.message || t('service.notification.error')
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="forgot-password-page">
    <div class="form-container">
      <q-card class="forgot-form" flat bordered>
        <q-card-section>
          <div class="text-h6">{{ t('password.forgot.title') }}</div>
          <div class="text-subtitle2 q-mt-sm">
            {{ t('password.forgot.subtitle') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="sendResetEmail">
            <q-input
              v-model="email"
              type="email"
              :label="t('password.forgot.emailLabel')"
              :placeholder="t('password.forgot.emailPlaceholder')"
              outlined
              class="q-mb-md"
              :rules="[
                val => !!val || t('password.forgot.emailPlaceholder'),
                val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || t('password.forgot.invalidEmail')
              ]"
            />

            <div class="row justify-center q-mt-lg">
              <q-btn
                type="submit"
                color="primary"
                :loading="loading"
                :label="t('password.forgot.submitButton')"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.forgot-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 16px;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.forgot-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}
</style>
