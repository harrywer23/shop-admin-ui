<template>
  <div class="custom-detail-page">
    <div class="page-container">
      <h1 class="text-h5 q-mb-lg">{{ t('custom.detail.title') }}</h1>

      <!-- 商品基本信息 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 商品图片 -->
            <div class="col-12 col-md-6">
              <q-carousel
                v-model="currentSlide"
                animated
                arrows
                navigation
                infinite
                :autoplay="3000"
                height="400px"
                class="rounded-borders"
              >
                <q-carousel-slide
                  v-for="(pic, index) in product.pics"
                  :key="index"
                  :name="index"
                >
                  <q-img :src="pic" style="height: 100%" />
                </q-carousel-slide>
              </q-carousel>
            </div>

            <!-- 商品信息 -->
            <div class="col-12 col-md-6">
              <div class="text-h6">{{ product.prodName }}</div>
              <div class="text-subtitle1 q-mt-md">{{ product.brief }}</div>

              <div class="price-info q-mt-lg">
                <div class="text-h5 text-primary">
                  {{ t('custom.detail.startingPrice') }}: ¥{{ product.startingPrice }}
                </div>
                <div class="text-caption q-mt-sm">
                  {{ t('custom.detail.priceNote') }}
                </div>
              </div>

              <div class="custom-features q-mt-lg">
                <div class="text-subtitle1 q-mb-md">{{ t('custom.detail.features') }}</div>
                <q-list bordered separator>
                  <q-item v-for="(feature, index) in product.features" :key="index">
                    <q-item-section avatar>
                      <q-icon :name="feature.icon" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ feature.title }}</q-item-label>
                      <q-item-label caption>{{ feature.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <!-- 申请定制按钮 -->
              <div class="action-buttons q-mt-xl">
                <q-btn
                  color="primary"
                  :label="t('custom.detail.apply')"
                  class="full-width"
                  size="lg"
                  @click="showApplicationDialog = true"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 定制流程 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('custom.detail.process') }}</div>
          <div class="row q-col-gutter-lg">
            <div
              v-for="(step, index) in customProcess"
              :key="index"
              class="col-12 col-sm-6 col-md-3"
            >
              <div class="process-step">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">
                  <div class="text-subtitle1">{{ step.title }}</div>
                  <div class="text-caption q-mt-sm">{{ step.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 商品详情 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('custom.detail.productDetails') }}</div>
          <div v-html="product.details"></div>
        </q-card-section>
      </q-card>

      <!-- 常见问题 -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('custom.detail.faq') }}</div>
          <q-list>
            <q-expansion-item
              v-for="(faq, index) in product.faqs"
              :key="index"
              :label="faq.question"
              header-class="text-primary"
            >
              <q-card>
                <q-card-section>
                  {{ faq.answer }}
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- 申请定制对话框 -->
      <q-dialog v-model="showApplicationDialog" persistent>
        <q-card style="min-width: 500px; max-width: 90vw;">
          <q-card-section class="row items-center">
            <div class="text-h6">{{ t('custom.detail.applicationTitle') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-form @submit="submitApplication" class="q-gutter-md">
              <!-- 需求描述 -->
              <q-input
                v-model="application.requirements"
                type="textarea"
                :label="t('custom.detail.requirements')"
                filled
                :rules="[val => !!val || t('custom.detail.error.requirementsRequired')]"
                rows="4"
              />

              <!-- 预算范围 -->
              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-input
                    v-model.number="application.budgetMin"
                    type="number"
                    :label="t('custom.detail.budgetMin')"
                    filled
                    :rules="[
                      val => val > 0 || t('custom.detail.error.invalidBudget'),
                      val => !application.budgetMax || val <= application.budgetMax || t('custom.detail.error.budgetRange')
                    ]"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model.number="application.budgetMax"
                    type="number"
                    :label="t('custom.detail.budgetMax')"
                    filled
                    :rules="[
                      val => val > 0 || t('custom.detail.error.invalidBudget'),
                      val => !application.budgetMin || val >= application.budgetMin || t('custom.detail.error.budgetRange')
                    ]"
                  />
                </div>
              </div>

              <!-- 期望完成时间 -->
              <q-input
                v-model="application.expectedDeliveryDate"
                :label="t('custom.detail.expectedDeliveryDate')"
                filled
                mask="date"
                :rules="['date']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="application.expectedDeliveryDate" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <!-- 联系方式 -->
              <q-input
                v-model="application.contact"
                :label="t('custom.detail.contact')"
                filled
                :rules="[val => !!val || t('custom.detail.error.contactRequired')]"
              />

              <!-- 备注 -->
              <q-input
                v-model="application.remarks"
                type="textarea"
                :label="t('custom.detail.remarks')"
                filled
                rows="2"
              />
            </q-form>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat :label="t('common.cancel')" v-close-popup />
            <q-btn
              flat
              :label="t('custom.detail.submit')"
              @click="submitApplication"
              :loading="submitting"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/axios'
import { useQuasar } from 'quasar'
import { date } from 'quasar'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()

interface CustomFeature {
  icon: string
  title: string
  description: string
}

interface CustomFaq {
  question: string
  answer: string
}

interface CustomProduct {
  prodId: number
  prodName: string
  brief: string
  pics: string[]
  startingPrice: number
  features: CustomFeature[]
  details: string
  faqs: CustomFaq[]
}

interface CustomApplication {
  requirements: string
  budgetMin: number
  budgetMax: number
  expectedDeliveryDate: string
  contact: string
  remarks: string
}

const currentSlide = ref(0)
const product = ref<CustomProduct>({} as CustomProduct)
const showApplicationDialog = ref(false)
const submitting = ref(false)

const application = ref<CustomApplication>({
  requirements: '',
  budgetMin: 0,
  budgetMax: 0,
  expectedDeliveryDate: '',
  contact: '',
  remarks: ''
})

// 定制流程步骤
const customProcess = [
  {
    title: t('custom.process.step1.title'),
    description: t('custom.process.step1.description')
  },
  {
    title: t('custom.process.step2.title'),
    description: t('custom.process.step2.description')
  },
  {
    title: t('custom.process.step3.title'),
    description: t('custom.process.step3.description')
  },
  {
    title: t('custom.process.step4.title'),
    description: t('custom.process.step4.description')
  }
]

// 提交定制申请
const submitApplication = async () => {
  try {
    submitting.value = true
    const response = await api.post(`/custom/apply/${product.value.prodId}`, application.value)

    if (response.data.code === 200) {
      showApplicationDialog.value = false
      $q.notify({
        type: 'positive',
        message: t('custom.detail.applicationSuccess')
      })
      // 跳转到申请详情页面
      router.push({
        path: '/user/custom/application',
        query: {
          id: response.data.data.applicationId
        }
      })
    }
  } catch (error) {
    console.error('提交申请失败:', error)
    $q.notify({
      type: 'negative',
      message: t('custom.detail.error.applicationFailed')
    })
  } finally {
    submitting.value = false
  }
}

// 加载商品信息
const loadProductInfo = async () => {
  try {
    const response = await api.get(`/custom/product/${route.params.id}`)
    if (response.data.code === 200) {
      product.value = response.data.data
    }
  } catch (error) {
    console.error('获取商品信息失败:', error)
    $q.notify({
      type: 'negative',
      message: t('custom.detail.error.loadFailed')
    })
  }
}

onMounted(() => {
  loadProductInfo()
})
</script>

<style lang="scss" scoped>
.custom-detail-page {
  padding: 20px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .process-step {
    display: flex;
    align-items: flex-start;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
    height: 100%;

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--q-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .step-content {
      flex-grow: 1;
    }
  }

  .custom-features {
    .q-item {
      padding: 16px;
    }
  }

  .price-info {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
  }
}
</style> 