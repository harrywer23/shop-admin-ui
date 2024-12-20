<template>
  <div class="crowdfunding-detail-page">
    <div class="page-container">
      <h1 class="text-h5 q-mb-lg">{{ t('custom.crowdfunding.detail.title') }}</h1>

      <q-card flat bordered class="q-mb-lg">
        <!-- 基本信息 -->
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('custom.crowdfunding.detail.basicInfo') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="info-item">
                <div class="label">{{ t('custom.crowdfunding.detail.applicant') }}</div>
                <div class="value">{{ detail.name }}</div>
              </div>
              <div class="info-item">
                <div class="label">{{ t('custom.crowdfunding.detail.contact') }}</div>
                <div class="value">{{ detail.contact }}</div>
              </div>
              <div class="info-item">
                <div class="label">{{ t('custom.crowdfunding.detail.type') }}</div>
                <div class="value">{{ t(`custom.type.${detail.type}`) }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="info-item">
                <div class="label">{{ t('custom.crowdfunding.detail.targetAmount') }}</div>
                <div class="value text-primary text-h6">¥{{ detail.targetAmount }}</div>
              </div>
              <div class="info-item">
                <div class="label">{{ t('custom.crowdfunding.detail.currentAmount') }}</div>
                <div class="value text-positive text-h6">¥{{ detail.currentAmount }}</div>
              </div>
              <div class="info-item">
                <div class="label">{{ t('custom.crowdfunding.detail.supportCount') }}</div>
                <div class="value">{{ detail.supportCount }}</div>
              </div>
            </div>
          </div>

          <!-- 众筹进度 -->
          <div class="crowdfunding-progress q-mt-md">
            <q-linear-progress
              :value="progress"
              color="primary"
              class="q-mb-sm"
            />
            <div class="row justify-between text-grey">
              <div>{{ t('crowdfunding.detail.progress') }}: {{ (progress * 100).toFixed(1) }}%</div>
              <div>{{ getRemainingTime() }}</div>
            </div>
          </div>
        </q-card-section>

        <!-- 需求描述 -->
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('custom.crowdfunding.detail.requirements') }}</div>
          <div class="requirements-content">{{ detail.requirements }}</div>
        </q-card-section>

        <!-- 回报设置 -->
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('custom.crowdfunding.detail.rewards') }}</div>
          <div class="row q-col-gutter-md">
            <div
              v-for="reward in detail.rewards"
              :key="reward.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card class="reward-card">
                <q-card-section>
                  <div class="text-h6">¥{{ reward.amount }}</div>
                  <div class="text-subtitle2 q-mt-sm">{{ reward.title }}</div>
                  <div class="text-body2 q-mt-md">{{ reward.description }}</div>
                  <div class="text-caption q-mt-md">
                    {{ t('custom.crowdfunding.detail.supportCount') }}: {{ reward.supportCount }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <!-- 参考图片和附件部分与个人申请相同 -->
        <!-- ... -->

      </q-card>

      <!-- 进度追踪部分与个人申请相同 -->
      <!-- ... -->
    </div>

    <!-- 图片预览对话框与个人申请相同 -->
    <!-- ... -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import { api } from '~/utils/axios'

const route = useRoute()
const { t } = useI18n()

// 详情数据
const detail = ref({
  name: '',
  contact: '',
  type: '',
  requirements: '',
  targetAmount: 0,
  currentAmount: 0,
  supportCount: 0,
  rewards: [],
  endTime: ''
})

// 图片预览状态
const imagePreview = ref({
  show: false,
  currentSlide: 0
})

// 计算众筹进度
const progress = computed(() => {
  if (!detail.value.targetAmount) return 0
  return Math.min(detail.value.currentAmount / detail.value.targetAmount, 1)
})

// 获取剩余时间
const getRemainingTime = () => {
  if (!detail.value.endTime) return ''
  
  const now = new Date().getTime()
  const end = new Date(detail.value.endTime).getTime()
  const diff = end - now

  if (diff <= 0) {
    return t('crowdfunding.detail.ended')
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return t('crowdfunding.detail.remaining', { days, hours, minutes })
}

// 加载众筹详情
const loadDetail = async () => {
  try {
    const response = await api.get(`/custom/crowdfunding/detail/${route.params.id}`)
    if (response.data.code === 200) {
      detail.value = response.data.data
    }
  } catch (error) {
    console.error('加载详情失败:', error)
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style lang="scss" scoped>
.crowdfunding-detail-page {
  padding: 20px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .info-item {
    margin-bottom: 16px;

    .label {
      color: #666;
      margin-bottom: 4px;
    }

    .value {
      font-size: 1.1em;
    }
  }

  .requirements-content {
    white-space: pre-wrap;
    line-height: 1.6;
  }

  .crowdfunding-progress {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
  }

  .reward-card {
    height: 100%;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}
</style> 