<template>
  <div class="crowdfunding-detail-page">
    <div class="page-container">
      <h1 class="text-h5 q-mb-lg">{{ t('crowdfunding.detail.title') }}</h1>

      <!-- 众筹基本信息 -->
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

            <!-- 众筹信息 -->
            <div class="col-12 col-md-6">
              <div class="text-h6">{{ product.prodName }}</div>
              <div class="text-subtitle1 q-mt-md">{{ product.brief }}</div>

              <div class="crowdfunding-progress q-mt-lg">
                <div class="text-h5 text-primary q-mb-sm">
                  ¥{{ crowdfunding.currentAmount }}
                  <span class="text-subtitle1 text-grey">/ ¥{{ crowdfunding.targetAmount }}</span>
                </div>
                <q-linear-progress
                  :value="progress"
                  color="primary"
                  class="q-mb-sm"
                />
                <div class="row justify-between text-grey">
                  <div>{{ t('crowdfunding.detail.progress') }}: {{ (progress * 100).toFixed(1) }}%</div>
                  <div>{{ t('crowdfunding.detail.supporters') }}: {{ crowdfunding.supportCount }}</div>
                </div>
              </div>

              <div class="time-info q-mt-lg">
                <div class="row items-center q-mb-md">
                  <q-icon name="schedule" size="sm" class="q-mr-sm" />
                  <span>
                    {{ getRemainingTime() }}
                  </span>
                </div>
                <div class="row items-center">
                  <q-icon name="event" size="sm" class="q-mr-sm" />
                  <span>
                    {{ t('crowdfunding.detail.period') }}:
                    {{ formatDate(crowdfunding.startTime) }} - {{ formatDate(crowdfunding.endTime) }}
                  </span>
                </div>
              </div>

              <!-- 支持按钮 -->
              <div class="action-buttons q-mt-xl">
                <q-btn
                  color="primary"
                  :label="t('crowdfunding.detail.support')"
                  class="full-width"
                  size="lg"
                  :disable="!canSupport"
                  @click="showSupportDialog = true"
                />
                <div class="text-caption text-center q-mt-sm" v-if="!canSupport">
                  {{ getSupportDisabledReason() }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 项目详情 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('crowdfunding.detail.projectDetails') }}</div>
          <div v-html="crowdfunding.details"></div>
        </q-card-section>
      </q-card>

      <!-- 回报设置 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('crowdfunding.detail.rewards') }}</div>
          <div class="row q-col-gutter-md">
            <div 
              v-for="reward in crowdfunding.rewards"
              :key="reward.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card class="reward-card">
                <q-card-section>
                  <div class="text-h6">¥{{ reward.amount }}</div>
                  <div class="text-subtitle2 q-mt-sm">{{ reward.title }}</div>
                  <div class="text-body2 q-mt-md">{{ reward.description }}</div>
                  <div class="text-caption q-mt-md">
                    {{ t('crowdfunding.detail.supportCount') }}: {{ reward.supportCount }}
                  </div>
                  <div class="text-caption">
                    {{ t('crowdfunding.detail.limitCount') }}: 
                    {{ reward.limitCount > 0 ? reward.limitCount : t('crowdfunding.detail.unlimited') }}
                  </div>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn
                    flat
                    color="primary"
                    :label="t('crowdfunding.detail.chooseReward')"
                    @click="selectReward(reward)"
                    :disable="!canSelectReward(reward)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 常见问题 -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('crowdfunding.detail.faq') }}</div>
          <q-list>
            <q-expansion-item
              v-for="(faq, index) in crowdfunding.faqs"
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

      <!-- 支持对话框 -->
      <q-dialog v-model="showSupportDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <div class="text-h6">{{ t('crowdfunding.detail.supportProject') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-subtitle1 q-mb-sm">{{ selectedReward?.title }}</div>
            <div class="text-body2">{{ selectedReward?.description }}</div>
            <div class="text-h6 text-primary q-mt-md">¥{{ selectedReward?.amount }}</div>

            <q-input
              v-model.number="supportCount"
              type="number"
              :label="t('crowdfunding.detail.supportCount')"
              filled
              :rules="[
                val => val > 0 || t('crowdfunding.detail.error.invalidCount'),
                val => !selectedReward?.limitCount || val <= selectedReward.limitCount || t('crowdfunding.detail.error.exceedLimit')
              ]"
              class="q-mt-md"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat :label="t('common.cancel')" v-close-popup />
            <q-btn
              flat
              :label="t('crowdfunding.detail.confirmSupport')"
              @click="confirmSupport"
              :loading="supporting"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/axios'
import { useQuasar } from 'quasar'
import { date } from 'quasar'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()

interface CrowdfundingReward {
  id: number
  title: string
  description: string
  amount: number
  limitCount: number
  supportCount: number
}

interface CrowdfundingFaq {
  question: string
  answer: string
}

interface CrowdfundingProduct {
  prodId: number
  prodName: string
  brief: string
  pics: string[]
}

interface Crowdfunding {
  id: number
  targetAmount: number
  currentAmount: number
  supportCount: number
  startTime: string
  endTime: string
  details: string
  rewards: CrowdfundingReward[]
  faqs: CrowdfundingFaq[]
}

const currentSlide = ref(0)
const product = ref<CrowdfundingProduct>({} as CrowdfundingProduct)
const crowdfunding = ref<Crowdfunding>({} as Crowdfunding)
const showSupportDialog = ref(false)
const selectedReward = ref<CrowdfundingReward | null>(null)
const supportCount = ref(1)
const supporting = ref(false)

// 计算众筹进度
const progress = computed(() => {
  if (!crowdfunding.value.targetAmount) return 0
  return Math.min(crowdfunding.value.currentAmount / crowdfunding.value.targetAmount, 1)
})

// 是否可以支持
const canSupport = computed(() => {
  if (!crowdfunding.value.startTime || !crowdfunding.value.endTime) return false
  const now = new Date().getTime()
  const start = new Date(crowdfunding.value.startTime).getTime()
  const end = new Date(crowdfunding.value.endTime).getTime()
  return now >= start && now <= end
})

// 获取剩余时间
const getRemainingTime = () => {
  if (!crowdfunding.value.endTime) return ''
  
  const now = new Date().getTime()
  const end = new Date(crowdfunding.value.endTime).getTime()
  const diff = end - now

  if (diff <= 0) {
    return t('crowdfunding.detail.ended')
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return t('crowdfunding.detail.remaining', { days, hours, minutes })
}

// 获取不可支持原因
const getSupportDisabledReason = () => {
  if (!crowdfunding.value.startTime || !crowdfunding.value.endTime) return ''
  
  const now = new Date().getTime()
  const start = new Date(crowdfunding.value.startTime).getTime()
  const end = new Date(crowdfunding.value.endTime).getTime()

  if (now < start) {
    return t('crowdfunding.detail.notStarted')
  }
  if (now > end) {
    return t('crowdfunding.detail.ended')
  }
  return ''
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 是否可以选择回报
const canSelectReward = (reward: CrowdfundingReward) => {
  if (!canSupport.value) return false
  if (reward.limitCount > 0 && reward.supportCount >= reward.limitCount) return false
  return true
}

// 选择回报
const selectReward = (reward: CrowdfundingReward) => {
  selectedReward.value = reward
  supportCount.value = 1
  showSupportDialog.value = true
}

// 确认支持
const confirmSupport = async () => {
  if (!selectedReward.value) return

  try {
    supporting.value = true
    const response = await api.post(`/crowdfunding/support/${crowdfunding.value.id}`, {
      rewardId: selectedReward.value.id,
      count: supportCount.value
    })

    if (response.data.code === 200) {
      showSupportDialog.value = false
      $q.notify({
        type: 'positive',
        message: t('crowdfunding.detail.supportSuccess')
      })
      // 跳转到支付页面
      router.push({
        path: '/order/payment',
        query: {
          orderId: response.data.data.orderId
        }
      })
    }
  } catch (error) {
    console.error('支持失败:', error)
    $q.notify({
      type: 'negative',
      message: t('crowdfunding.detail.error.supportFailed')
    })
  } finally {
    supporting.value = false
  }
}

// 加载众筹信息
const loadCrowdfundingInfo = async () => {
  try {
    const response = await api.get(`/crowdfunding/${route.params.id}`)
    if (response.data.code === 200) {
      const data = response.data.data
      product.value = data.product
      crowdfunding.value = data.crowdfunding
    }
  } catch (error) {
    console.error('获取众筹信息失败:', error)
    $q.notify({
      type: 'negative',
      message: t('crowdfunding.detail.error.loadFailed')
    })
  }
}

onMounted(() => {
  loadCrowdfundingInfo()
})
</script>

<style lang="scss" scoped>
.crowdfunding-detail-page {
  padding: 20px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .reward-card {
    height: 100%;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .crowdfunding-progress {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
  }

  .time-info {
    color: #666;
  }
}
</style> 