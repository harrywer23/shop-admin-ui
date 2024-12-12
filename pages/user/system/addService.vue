<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { api } from '~/utils/axios';
import { getImageUrl } from '~/utils/tools';

definePageMeta({
  layout: 'users',
  middleware: 'auth'
});

const $q = useQuasar();
const { t } = useI18n();

const title = ref('');
const content = ref('');
const workType = ref('1');
const email = ref('');
const images = ref<string[]>([]);
const uploadFile = ref<File | null>(null);

const typeOptions = [
  { label: 'BUG', value: '1' },
  { label: t('service.type.complaint'), value: '2' },
  { label: t('service.type.suggestion'), value: '3' },
  { label: t('service.type.other'), value: '0' }
];

// 触发文件选择
const triggerFileUpload = () => {
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    fileInput.click();
  }
};

// 处理文件上传
const handleFileUpload = async (file: File | null) => {
  if (!file) return;

  // 验证文件类型
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
    $q.notify({
      type: 'negative',
      message: '只支持 jpg、png、gif 格式的图片'
    });
    return;
  }

  // 验证文件大小 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    $q.notify({
      type: 'negative',
      message: '图片大小不能超过 2MB'
    });
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/common/uploadImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.code === 200) {
      const imageUrl = response.data.data.sourceUrl || response.data.data;
      images.value.push(imageUrl);
      $q.notify({
        type: 'positive',
        message: '图片上传成功'
      });
    } else {
      throw new Error(response.data.msg || '上传失败');
    }
  } catch (error) {
    console.error('上传图片失败:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '系统内部错误'
    });
  } finally {
    uploadFile.value = null;
  }
};

// 移除图片
const removeImage = (index: number) => {
  images.value.splice(index, 1);
};

// 重置表单
const resetForm = () => {
  title.value = '';
  content.value = '';
  workType.value = '1';
  images.value = [];
};

const onSubmit = async () => {
  if (!title.value) {
    $q.notify({
      type: 'warning',
      message: t('service.notification.titleRequired')
    });
    return;
  }

  if (!content.value) {
    $q.notify({
      type: 'warning',
      message: t('service.notification.contentRequired')
    });
    return;
  }

  try {
    const imgUrlsString = images.value.map(img => img.toString()).join(',');

    const response = await api.post('/admin/workOrder/add', {
      title: title.value,
      explanation: content.value,
      workType: workType.value,
      imgUrls: imgUrlsString,
      email: email.value
    });

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('service.notification.success')
      });
      resetForm();
    } else {
      throw new Error(response.data.msg || t('service.notification.error'));
    }
  } catch (error) {
    console.error('Error submitting service request:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('service.notification.error')
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
              v-model="workType"
              :options="typeOptions"
              :label="t('service.form.type')"
              outlined
              emit-value
              map-options
          />
          <q-input
              v-model="email"
              label="E-mail"
              outlined
          />
          <q-input
              v-model="content"
              type="textarea"
              :label="t('service.form.content')"
              :placeholder="t('service.form.contentPlaceholder')"
              outlined
              rows="6"
          />

          <!-- 图片上传区域 -->
          <div class="image-upload-section">
            <div class="text-subtitle2 q-mb-sm">上传图片</div>
            <div class="row q-col-gutter-sm">
              <div v-for="(img, index) in images" :key="index" class="col-4 col-sm-3 col-md-2">
                <q-img
                  :src="getImageUrl(img)"
                  :ratio="1"
                  class="rounded-borders"
                >
                  <div class="absolute-top-right q-pa-xs">
                    <q-btn
                      round
                      dense
                      flat
                      color="negative"
                      icon="close"
                      size="sm"
                      @click="removeImage(index)"
                    />
                  </div>
                </q-img>
              </div>

              <!-- 上传按钮 -->
              <div class="col-4 col-sm-3 col-md-2">
                <q-file
                  v-model="uploadFile"
                  accept=".jpg,.jpeg,.png,.gif"
                  style="display: none"
                  @update:model-value="handleFileUpload"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                <div
                  class="upload-box flex flex-center cursor-pointer"
                  style="height: 100%; min-height: 100px; border: 2px dashed #ccc; border-radius: 4px;"
                  @click="triggerFileUpload"
                >
                  <q-icon name="add" size="40px" color="grey-6" />
                </div>
              </div>
            </div>
          </div>

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
                @click="resetForm"
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

.image-upload-section {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
}

.upload-box {
  transition: all 0.3s ease;
}

.upload-box:hover {
  border-color: var(--q-primary);
  background: #f0f0f0;
}
</style>
