<template>
  <div class="suggestions-page">
    <div class="page-container">
      <h1 class="text-h4 q-mb-lg">{{ $t('suggestions.title') }}</h1>

      <div class="row q-col-gutter-lg">
        <!-- 建议表单 -->
        <div class="col-12 col-md-8">
          <q-card flat bordered>
            <q-card-section>
              <q-form @submit="onSubmit" class="q-gutter-md">
                <!-- 建议类型 -->
                <q-select
                  v-model="formData.type"
                  :options="suggestionTypes"
                  :label="$t('suggestions.type')"
                  outlined
                  :rules="[val => !!val || $t('suggestions.typeRequired')]"
                />

                <!-- 建议标题 -->
                <q-input
                  v-model="formData.title"
                  :label="$t('suggestions.title')"
                  outlined
                  :rules="[val => !!val || $t('suggestions.titleRequired')]"
                />

                <!-- 建议内容 -->
                <q-input
                  v-model="formData.content"
                  type="textarea"
                  :label="$t('suggestions.content')"
                  outlined
                  autogrow
                  :rules="[val => !!val || $t('suggestions.contentRequired')]"
                />

                <!-- 期望效果 -->
                <q-input
                  v-model="formData.expectation"
                  type="textarea"
                  :label="$t('suggestions.expectation')"
                  outlined
                  autogrow
                />

                <!-- 图片上传 -->
                <div class="q-mb-md">
                  <div class="text-subtitle2 q-mb-sm">{{ $t('suggestions.screenshots') }}</div>
                  <q-file
                    v-model="formData.files"
                    :label="$t('suggestions.uploadImage')"
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
                  :label="$t('suggestions.contact')"
                  outlined
                  :hint="$t('suggestions.contactHint')"
                />

                <!-- 提交按钮 -->
                <div class="row justify-end q-mt-md">
                  <q-btn
                    type="submit"
                    color="primary"
                    :label="$t('suggestions.submit')"
                    :loading="submitting"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <!-- 提示信息 -->
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('suggestions.tips.title') }}</div>
              <ul class="q-mb-none">
                <li v-for="(tip, index) in tips" :key="index" class="q-mb-sm">
                  {{ tip }}
                </li>
              </ul>
            </q-card-section>
          </q-card>

          <!-- 最新采纳建议 -->
          <q-card flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('suggestions.adopted.title') }}</div>
              <q-list separator>
                <q-item v-for="item in adoptedSuggestions" :key="item.id">
                  <q-item-section>
                    <q-item-label>{{ item.title }}</q-item-label>
                    <q-item-label caption>{{ item.date }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip color="positive" text-color="white" size="sm">
                      {{ $t('suggestions.adopted.label') }}
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
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

const suggestionTypes = [
  { label: t('suggestions.types.feature'), value: 'feature' },
  { label: t('suggestions.types.improvement'), value: 'improvement' },
  { label: t('suggestions.types.design'), value: 'design' },
  { label: t('suggestions.types.other'), value: 'other' }
]

const tips = [
  t('suggestions.tips.item1'),
  t('suggestions.tips.item2'),
  t('suggestions.tips.item3'),
  t('suggestions.tips.item4'),
  t('suggestions.tips.item5')
]

const adoptedSuggestions = [
  {
    id: 1,
    title: t('suggestions.adopted.example1'),
    date: '2024-03-15'
  },
  {
    id: 2,
    title: t('suggestions.adopted.example2'),
    date: '2024-03-10'
  },
  {
    id: 3,
    title: t('suggestions.adopted.example3'),
    date: '2024-03-05'
  }
]

const formData = ref({
  type: '',
  title: '',
  content: '',
  expectation: '',
  files: [],
  contact: ''
})

const submitting = ref(false)

const onSubmit = async () => {
  submitting.value = true
  try {
    const submitData = new FormData()
    submitData.append('type', formData.value.type)
    submitData.append('title', formData.value.title)
    submitData.append('content', formData.value.content)
    submitData.append('expectation', formData.value.expectation)
    submitData.append('contact', formData.value.contact)
    
    if (formData.value.files) {
      formData.value.files.forEach((file: File) => {
        submitData.append('files', file)
      })
    }

    const response = await fetch('/api/suggestions', {
      method: 'POST',
      body: submitData
    })

    const result = await response.json()
    if (result.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('suggestions.submitSuccess')
      })
      resetForm()
    } else {
      throw new Error(result.msg || t('suggestions.submitError'))
    }
  } catch (error) {
    console.error('提交建议失败:', error)
    $q.notify({
      type: 'negative',
      message: t('suggestions.submitError')
    })
  } finally {
    submitting.value = false
  }
}

const onRejected = () => {
  $q.notify({
    type: 'negative',
    message: t('suggestions.fileError')
  })
}

const resetForm = () => {
  formData.value = {
    type: '',
    title: '',
    content: '',
    expectation: '',
    files: [],
    contact: ''
  }
}
</script>

<style lang="scss" scoped>
.suggestions-page {
  padding: 20px;
  
  .page-container {
    max-width: 1200px;
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
