<script setup lang="ts">
import { ref } from 'vue';
import { api } from '~/utils/axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {useRoute} from "#vue-router";

const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const newPassword = ref('');
const newPassword2 = ref('');
const loading = ref(false);
const isPwd1Visible = ref(false);
const isPwd2Visible = ref(false);
const key = ref(route.query.key);
const check = ref(route.query.check);

async function onSubmit(e: Event) {
  e.preventDefault();
  if (loading.value) return;

  if (!newPassword.value || !newPassword2.value) {
    $q.notify({ type: 'warning', message: t('password.reset.pleaseComplete') });
    return;
  }

  if (newPassword.value !== newPassword2.value) {
    $q.notify({ type: 'warning', message: t('password.reset.passwordMismatch') });
    return;
  }

  if (newPassword.value.length < 6) {
    $q.notify({ type: 'warning', message: t('password.reset.passwordTooShort') });
    return;
  }

  loading.value = true;
  try {
    // 构造请求数据对象
    const requestData = {
      newPassword1: newPassword.value,
      newPassword2: newPassword2.value,
      key: key.value,
      check: check.value
    };

    console.log('Sending reset password request:', requestData);

    const response = await api.post('/sysUser/restPasswort', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Reset password response:', response.data);

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('password.reset.success')
      });
      router.push('/login');
    } else {
      throw new Error(response.data.msg || '重置密码失败');
    }
  } catch (error) {
    console.error('Reset password error:', error);
    $q.notify({
      type: 'negative',
      message: error.message || '重置密码失败'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="reset-password-page q-pa-md">
    <q-card class="reset-form" flat bordered>
      <q-card-section>
        <div class="text-h6">{{ t('password.reset.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            v-model="newPassword"
            :type="isPwd1Visible ? 'text' : 'password'"
            :label="t('password.reset.newPassword')"
            outlined
            class="q-mb-md"
          >
            <template #append>
              <q-icon
                :name="isPwd1Visible ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd1Visible = !isPwd1Visible"
              />
            </template>
          </q-input>

          <q-input
            v-model="newPassword2"
            :type="isPwd2Visible ? 'text' : 'password'"
            :label="t('password.reset.confirmPassword')"
            outlined
            class="q-mb-md"
          >
            <template #append>
              <q-icon
                :name="isPwd2Visible ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd2Visible = !isPwd2Visible"
              />
            </template>
          </q-input>

          <div class="row justify-center q-mt-lg">
            <q-btn
              type="submit"
              color="primary"
              :loading="loading"
              :label="t('password.reset.submitButton')"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<style lang="sass" scoped>
.reset-password-page
  max-width: 400px
  margin: 40px auto

.reset-form
  background: #fff
  border-radius: 8px
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2)
</style>
