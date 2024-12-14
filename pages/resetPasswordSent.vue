<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();

function goToHome() {
  router.push('/');
}

function goToLogin() {
  router.push('/login');
}
</script>

<template>
  <div class="reset-sent-page q-pa-md">
    <q-card class="reset-sent-card" flat bordered>
      <q-card-section class="text-center">
        <q-icon name="check_circle" color="positive" size="4rem" />
        
        <div class="text-h6 q-mt-md">
          {{ t('password.reset.emailSentTitle') }}
        </div>
        
        <div class="text-body1 q-mt-md">
          {{ t('password.reset.emailSentMessage') }}
        </div>

        <div class="text-caption q-mt-sm text-grey">
          {{ t('password.reset.checkSpam') }}
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-md">
        <q-btn
          color="primary"
          :label="t('password.reset.backToLogin')"
          @click="goToLogin"
          class="q-mr-sm"
        />
        <q-btn
          outline
          color="primary"
          :label="t('password.reset.backToHome')"
          @click="goToHome"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<style lang="scss" scoped>
.reset-sent-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.reset-sent-card {
  max-width: 400px;
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}
</style> 