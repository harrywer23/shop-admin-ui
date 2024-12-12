<template>
  <div class="review-detail-page">
    <div class="page-header">
      <h1 class="text-h5">{{ t('order.review.detail') }}</h1>
    </div>

    <q-card v-if="review" flat bordered class="q-mb-lg">
      <!-- 商品信息 -->
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <q-img
            :src="getImageUrl(review.productPic)"
            style="width: 100px; height: 100px"
            class="rounded-borders"
          />
          <div>
            <div class="text-h6">{{ review.productName }}</div>
            <div class="text-subtitle2">{{ review.skuName }}</div>
          </div>
        </div>
      </q-card-section>

      <!-- 评价内容 -->
      <q-card-section>
        <div class="row items-center q-mb-md">
          <q-rating
            v-model="review.score"
            size="2em"
            color="primary"
            icon="star_border"
            icon-selected="star"
            :max="5"
            readonly
          />
          <div class="text-caption q-ml-md">
            {{ formatDate(review.createTime) }}
          </div>
        </div>

        <div class="review-content q-mb-lg">
          {{ review.content }}
        </div>

        <!-- 评价图片 -->
        <div v-if="review.pics?.length" class="row q-col-gutter-md">
          <div
            v-for="(pic, index) in review.pics"
            :key="index"
            class="col-4 col-sm-3"
          >
            <q-img
              :src="getImageUrl(pic)"
              @click="previewImage(pic)"
              style="height: 200px"
              class="rounded-borders cursor-pointer"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="flex flex-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- 图片预览 -->
    <q-dialog v-model="showPreview">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-img :src="previewUrl" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/axios'
import { formatDate } from '@/utils/format'

const route = useRoute()
const { t } = useI18n()

const review = ref(null)
const loading = ref(true)
const showPreview = ref(false)
const previewUrl = ref('')

// 获取评论详情
const loadReview = async () => {
  try {
    const response = await api.get(`/order/review/${route.params.id}`)
    const { code, data } = response.data
    if (code === 200) {
      review.value = data
    }
  } catch (error) {
    console.error('获取评论详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 图片预览
const previewImage = (url: string) => {
  previewUrl.value = getImageUrl(url)
  showPreview.value = true
}

// 获取图片URL
const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${useRuntimeConfig().public.imageBaseUrl}/${url}`
}

onMounted(() => {
  loadReview()
})
</script>

<style lang="scss" scoped>
.review-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
  }

  .review-content {
    font-size: 1.1em;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .q-img {
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>
