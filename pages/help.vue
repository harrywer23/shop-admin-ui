<template>
  <div class="help-page">
    <div class="page-container">
      <h1 class="text-h4 q-mb-lg">{{ t('help.title') }}</h1>

      <!-- 搜索框 -->
      <div class="search-section q-mb-xl">
        <q-input
          v-model="searchQuery"
          :placeholder="t('help.searchPlaceholder')"
          outlined
          class="search-input"
          @update:model-value="filterQuestions"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="row q-col-gutter-lg">
        <!-- 左侧分类列表 -->
        <div class="col-12 col-md-3">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ t('help.categories') }}</div>
              <q-list padding>
                <q-item
                  v-for="category in categories"
                  :key="category.id"
                  clickable
                  :active="currentCategory === category.id"
                  @click="currentCategory = category.id"
                  active-class="text-primary"
                >
                  <q-item-section>
                    <q-item-label>{{ t(`help.categories.${category.id}`) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <!-- 右侧问题列表 -->
        <div class="col-12 col-md-9">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ currentCategoryName }}</div>
              
              <q-list padding separator>
                <q-expansion-item
                  v-for="faq in filteredFaqs"
                  :key="faq.id"
                  :label="faq.question"
                  header-class="text-primary"
                  expand-separator
                >
                  <q-card>
                    <q-card-section>
                      <div class="text-body1" v-html="faq.answer"></div>
                      
                      <!-- 帮助评价 -->
                      <div class="helpful-section q-mt-md">
                        <div class="text-caption text-grey q-mb-sm">
                          {{ t('help.wasHelpful') }}
                        </div>
                        <div class="row q-gutter-sm">
                          <q-btn
                            flat
                            dense
                            size="sm"
                            color="positive"
                            icon="thumb_up"
                            :label="t('help.yes')"
                            @click="markHelpful(faq.id, true)"
                          />
                          <q-btn
                            flat
                            dense
                            size="sm"
                            color="negative"
                            icon="thumb_down"
                            :label="t('help.no')"
                            @click="markHelpful(faq.id, false)"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-list>

              <!-- 无搜索结果 -->
              <div v-if="filteredFaqs.length === 0" class="text-center q-pa-lg">
                <q-icon name="search_off" size="48px" color="grey-5" />
                <div class="text-h6 q-mt-md">{{ t('help.noResults') }}</div>
                <div class="text-grey">{{ t('help.tryOtherKeywords') }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- 联系客服 -->
      <div class="contact-support q-mt-xl">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h6">{{ t('help.needMoreHelp') }}</div>
            <div class="text-body1 q-mt-md">{{ t('help.contactSupport') }}</div>
            <q-btn
              color="primary"
              :label="t('help.contactUs')"
              class="q-mt-md"
              to="/contact"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const $q = useQuasar()

// 问题分类
const categories = [
  { id: 'order', icon: 'shopping_cart' },
  { id: 'customization', icon: 'design_services' },
  { id: 'payment', icon: 'payment' },
  { id: 'shipping', icon: 'local_shipping' },
  { id: 'refund', icon: 'assignment_return' },
  { id: 'account', icon: 'person' }
]

// 常见问题数据
const faqs = [
  // 订单相关
  {
    id: 'order-1',
    category: 'order',
    question: t('help.faqs.order.howToOrder.question'),
    answer: t('help.faqs.order.howToOrder.answer')
  },
  {
    id: 'order-2',
    category: 'order',
    question: t('help.faqs.order.orderStatus.question'),
    answer: t('help.faqs.order.orderStatus.answer')
  },
  {
    id: 'order-3',
    category: 'order',
    question: t('help.faqs.order.cancelOrder.question'),
    answer: t('help.faqs.order.cancelOrder.answer')
  },
  // 定制相关
  {
    id: 'customization-1',
    category: 'customization',
    question: t('help.faqs.customization.howToCustomize.question'),
    answer: t('help.faqs.customization.howToCustomize.answer')
  },
  {
    id: 'customization-2',
    category: 'customization',
    question: t('help.faqs.customization.customizationTime.question'),
    answer: t('help.faqs.customization.customizationTime.answer')
  },
  {
    id: 'customization-3',
    category: 'customization',
    question: t('help.faqs.customization.requirements.question'),
    answer: t('help.faqs.customization.requirements.answer')
  },
  // 支付相关
  {
    id: 'payment-1',
    category: 'payment',
    question: t('help.faqs.payment.methods.question'),
    answer: t('help.faqs.payment.methods.answer')
  },
  {
    id: 'payment-2',
    category: 'payment',
    question: t('help.faqs.payment.security.question'),
    answer: t('help.faqs.payment.security.answer')
  },
  // 物流相关
  {
    id: 'shipping-1',
    category: 'shipping',
    question: t('help.faqs.shipping.time.question'),
    answer: t('help.faqs.shipping.time.answer')
  },
  {
    id: 'shipping-2',
    category: 'shipping',
    question: t('help.faqs.shipping.tracking.question'),
    answer: t('help.faqs.shipping.tracking.answer')
  },
  // 退款相关
  {
    id: 'refund-1',
    category: 'refund',
    question: t('help.faqs.refund.howToRefund.question'),
    answer: t('help.faqs.refund.howToRefund.answer')
  },
  {
    id: 'refund-2',
    category: 'refund',
    question: t('help.faqs.refund.refundTime.question'),
    answer: t('help.faqs.refund.refundTime.answer')
  },
  {
    id: 'refund-3',
    category: 'refund',
    question: t('help.faqs.refund.conditions.question'),
    answer: t('help.faqs.refund.conditions.answer')
  },
  // 账户相关
  {
    id: 'account-1',
    category: 'account',
    question: t('help.faqs.account.forgotPassword.question'),
    answer: t('help.faqs.account.forgotPassword.answer')
  },
  {
    id: 'account-2',
    category: 'account',
    question: t('help.faqs.account.security.question'),
    answer: t('help.faqs.account.security.answer')
  }
]

const currentCategory = ref('order')
const searchQuery = ref('')

// 获取当前分类名称
const currentCategoryName = computed(() => {
  return t(`help.categories.${currentCategory.value}`)
})

// 过滤问题列表
const filteredFaqs = computed(() => {
  let result = faqs
  
  // 按分类筛选
  if (currentCategory.value) {
    result = result.filter(faq => faq.category === currentCategory.value)
  }
  
  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 标记是否有帮助
const markHelpful = (faqId: string, helpful: boolean) => {
  // 这里可以添加向后端发送反馈的逻辑
  $q.notify({
    type: helpful ? 'positive' : 'negative',
    message: t(helpful ? 'help.feedbackThankYou' : 'help.feedbackSorry'),
    position: 'top'
  })
}

// 搜索问题
const filterQuestions = () => {
  // 搜索逻辑已通过计算属性实现
}
</script>

<style lang="scss" scoped>
.help-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40px 20px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .search-section {
    max-width: 600px;
    margin: 0 auto;
  }

  .helpful-section {
    border-top: 1px solid #eee;
    padding-top: 1rem;
  }

  @media (max-width: 600px) {
    padding: 20px 10px;
  }
}
</style>

