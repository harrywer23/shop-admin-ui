<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { api } from '~/utils/axios';

const $q = useQuasar();
const { t } = useI18n();

const title = ref('');
const content = ref('');
const type = ref('1');

const typeOptions = [
  { label: 'BUG', value: '1' },
  { label: t('service.type.complaint'), value: '2' },
  { label: t('service.type.suggestion'), value: '3' },
  { label: t('service.type.other'), value: '0' }
];

const onSubmit = async () => {
  if (!title.value) {
    Notify.create({
      type: 'warning',
      message: t('service.notification.titleRequired')
    });
    return;
  }

  if (!content.value) {
    Notify.create({
      type: 'warning',
      message: t('service.notification.contentRequired')
    });
    return;
  }

  try {
    const response = await api.post('/workOrder/add', {
      title: title.value,
      explanation: content.value,
      workType: type.value
    });

    if (response.data.code === 200) {
      Notify.create({
        type: 'positive',
        message: t('service.notification.success')
      });
      // 清空表单
      title.value = '';
      content.value = '';
      type.value = '1';
    } else {
      Notify.create({
        type: 'negative',
        message: response.data.msg || t('service.notification.error')
      });
    }
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: t('service.notification.error')
    });
  }
};
</script>

<template>
  <div class="q-pa-md">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">{{ t('service.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="title"
            :label="t('service.form.title')"
            :placeholder="t('service.form.titlePlaceholder')"
            outlined
          />

          <q-select
            v-model="type"
            :options="typeOptions"
            :label="t('service.form.type')"
            outlined
            emit-value
            map-options
          />

          <q-input
            v-model="content"
            type="textarea"
            :label="t('service.form.content')"
            :placeholder="t('service.form.contentPlaceholder')"
            outlined
            rows="6"
          />

          <div class="row justify-end q-gutter-sm">
            <q-btn
              :label="t('service.form.submit')"
              type="submit"
              color="primary"
            />
            <q-btn
              :label="t('service.form.cancel')"
              type="reset"
              color="grey-7"
              flat
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.my-card {
  max-width: 800px;
  margin: 0 auto;
}
</style>
