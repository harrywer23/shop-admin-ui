<template>
  <div class="contact-page">
    <div class="page-container">
      <h1 class="text-h4 q-mb-lg">{{ $t('contact.title') }}</h1>

      <div class="row q-col-gutter-lg">
        <!-- 联系信息 -->
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('contact.info') }}</div>

              <div class="contact-info q-gutter-y-md">
                <div class="info-item">
                  <q-icon name="email" size="24px" />
                  <div class="info-content">
                    <div class="info-label">{{ $t('contact.email') }}</div>
                    <div class="info-value">super@aivrw.com</div>
                  </div>
                </div>

                <div class="info-item">
                  <q-icon name="phone" size="24px" />
                  <div class="info-content">
                    <div class="info-label">{{ $t('contact.phone') }}</div>
                    <div class="info-value">+1 234 567 890</div>
                  </div>
                </div>

                <div class="info-item">
                  <q-icon name="schedule" size="24px" />
                  <div class="info-content">
                    <div class="info-label">{{ $t('contact.hours') }}</div>
                    <div class="info-value">9:00 AM - 6:00 PM</div>
                  </div>
                </div>

                <div class="info-item">
                  <q-icon name="location_on" size="24px" />
                  <div class="info-content">
                    <div class="info-label">{{ $t('contact.address') }}</div>
                    <div class="info-value">123 Example Street, City, Country</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 联系表单 -->
        <div class="col-12 col-md-8">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('contact.form.title') }}</div>

              <q-form @submit="onSubmit" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="formData.name"
                      :label="$t('contact.form.name')"
                      outlined
                      :rules="[val => !!val || $t('contact.form.nameRequired')]"
                    />
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="formData.email"
                      :label="$t('contact.form.email')"
                      outlined
                      type="email"
                      :rules="[
                        val => !!val || $t('contact.form.emailRequired'),
                        val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || $t('contact.form.emailInvalid')
                      ]"
                    />
                  </div>
                </div>

                <q-input
                  v-model="formData.subject"
                  :label="$t('contact.form.subject')"
                  outlined
                  :rules="[val => !!val || $t('contact.form.subjectRequired')]"
                />

                <q-input
                  v-model="formData.message"
                  type="textarea"
                  :label="$t('contact.form.message')"
                  outlined
                  autogrow
                  :rules="[val => !!val || $t('contact.form.messageRequired')]"
                />

                <div class="row justify-end q-mt-md">
                  <q-btn
                    type="submit"
                    color="primary"
                    :label="$t('contact.form.submit')"
                    :loading="submitting"
                  />
                </div>
              </q-form>
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

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const submitting = ref(false)

const onSubmit = async () => {
  submitting.value = true
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData.value)
    })

    const result = await response.json()
    if (result.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('contact.form.submitSuccess')
      })
      resetForm()
    } else {
      throw new Error(result.msg || t('contact.form.submitError'))
    }
  } catch (error) {
    console.error('提交联系表单失败:', error)
    $q.notify({
      type: 'negative',
      message: t('contact.form.submitError')
    })
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  }
}
</script>

<style lang="scss" scoped>
.contact-page {
  padding: 20px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .contact-info {
    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      .q-icon {
        color: var(--q-primary);
      }

      .info-content {
        flex: 1;

        .info-label {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .info-value {
          color: #666;
        }
      }
    }
  }
}
</style>
