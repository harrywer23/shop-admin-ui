<template>
  <div class="report-page">
    <div class="page-container">
      <h1 class="text-h4 q-mb-lg">{{ $t('report.title') }}</h1>

      <q-card flat bordered>
        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <!-- 举报类型 -->
            <q-select
              v-model="formData.type"
              :options="reportTypes"
              :label="$t('report.type')"
              outlined
              :rules="[val => !!val || $t('report.typeRequired')]"
            />

            <!-- 举报对象 -->
            <q-input
              v-model="formData.target"
              :label="$t('report.target')"
              outlined
              :hint="$t('report.targetHint')"
              :rules="[val => !!val || $t('report.targetRequired')]"
            />

            <!-- 举报原因 -->
            <q-input
              v-model="formData.reason"
              type="textarea"
              :label="$t('report.reason')"
              outlined
              autogrow
              :rules="[val => !!val || $t('report.reasonRequired')]"
            />

            <!-- 详细说明 -->
            <q-input
              v-model="formData.description"
              type="textarea"
              :label="$t('report.description')"
              outlined
              autogrow
            />

            <!-- 证据上传 -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">{{ $t('report.evidence') }}</div>
              <q-file
                v-model="formData.files"
                :label="$t('report.uploadImage')"
                outlined
                multiple
                accept=".jpg,.jpeg,.png,.gif"
                max-files="5"
                @rejected="onRejected"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </div>

            <!-- 联系方式 -->
            <q-input
              v-model="formData.contact"
              :label="$t('report.contact')"
              outlined
              :hint="$t('report.contactHint')"
            />

            <!-- 提交按钮 -->
            <div class="row justify-end q-mt-md">
              <q-btn
                type="submit"
                color="primary"
                :label="$t('report.submit')"
                :loading="submitting"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- 举报须知 -->
      <q-card flat bordered class="q-mt-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('report.guidelines.title') }}</div>
          <ul class="q-mb-none">
            <li v-for="(guideline, index) in guidelines" :key="index" class="q-mb-sm">
              {{ guideline }}
            </li>
          </ul>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
const $q = useQuasar()

const reportTypes = [
  { label: t('report.types.spam'), value: 'spam' },
  { label: t('report.types.abuse'), value: 'abuse' },
  { label: t('report.types.inappropriate'), value: 'inappropriate' },
  { label: t('report.types.copyright'), value: 'copyright' },
  { label: t('report.types.other'), value: 'other' }
]

const guidelines = [
  t('report.guidelines.item1'),
  t('report.guidelines.item2'),
  t('report.guidelines.item3'),
  t('report.guidelines.item4'),
  t('report.guidelines.item5')
]

const formData = ref({
  type: '',
  target: '',
  reason: '',
  description: '',
  files: [],
  contact: ''
})

const submitting = ref(false)

const onSubmit = async () => {
  submitting.value = true
  try {
    const submitData = new FormData()
    submitData.append('type', formData.value.type)
    submitData.append('target', formData.value.target)
    submitData.append('reason', formData.value.reason)
    submitData.append('description', formData.value.description)
    submitData.append('contact', formData.value.contact)
    
    if (formData.value.files) {
      formData.value.files.forEach((file: File) => {
        submitData.append('files', file)
      })
    }

    const response = await fetch('/api/report', {
      method: 'POST',
      body: submitData
    })

    const result = await response.json()
    if (result.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('report.submitSuccess')
      })
      resetForm()
    } else {
      throw new Error(result.msg || t('report.submitError'))
    }
  } catch (error) {
    console.error('提交举报失败:', error)
    $q.notify({
      type: 'negative',
      message: t('report.submitError')
    })
  } finally {
    submitting.value = false
  }
}

const onRejected = () => {
  $q.notify({
    type: 'negative',
    message: t('report.fileError')
  })
}

const resetForm = () => {
  formData.value = {
    type: '',
    target: '',
    reason: '',
    description: '',
    files: [],
    contact: ''
  }
}
</script>

<style lang="scss" scoped>
.report-page {
  padding: 20px;
  
  .page-container {
    max-width: 800px;
    margin: 0 auto;
  }

  ul {
    padding-left: 20px;
    
    li {
      line-height: 1.6;
    }
  }
}
</style>
