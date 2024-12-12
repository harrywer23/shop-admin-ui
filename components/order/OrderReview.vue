<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ t('order.review.title') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-sm">
        <!-- 商品信息 -->
        <div class="product-info q-mb-md">
          <q-item>
            <q-item-section avatar>
              <q-img :src="getImageUrl(orderItem.pic)" style="width: 50px; height: 50px" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ orderItem.prodName }}</q-item-label>
              <q-item-label caption>{{ orderItem.skuName }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>

        <!-- 评分 -->
        <div class="rating-section q-mb-md">
          <div class="text-subtitle2 q-mb-sm">{{ t('order.review.rating') }}</div>
          <q-rating
            v-model="rating"
            size="2em"
            color="primary"
            icon="star_border"
            icon-selected="star"
            :max="5"
          />
        </div>

        <!-- 评论内容 -->
        <div class="content-section">
          <q-input
            v-model="content"
            type="textarea"
            :label="t('order.review.content')"
            :placeholder="t('order.review.contentPlaceholder')"
            outlined
            autogrow
            :rules="[val => !!val || t('order.review.contentRequired')]"
          />
        </div>

        <!-- 图片上传 -->
        <div class="upload-section q-mt-md">
          <div class="text-subtitle2 q-mb-sm">{{ t('order.review.uploadPhotos') }}</div>
          <ImageUploader
            v-model="pictures"
            :max-files="6"
          />
        </div>

        <!-- 匿名评价 -->
        <div class="anonymous-section q-mt-md">
          <q-checkbox v-model="isAnonymous" :label="t('order.review.anonymous')"
                      true-value="1"
                      false-value="0"/>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('order.review.cancel')" color="grey" v-close-popup />
        <q-btn
          flat
          :label="t('order.review.submit')"
          color="primary"
          @click="submitReview"
          :loading="submitting"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/axios'
import ImageUploader from '~/components/common/ImageUploader.vue'

const { t } = useI18n()
const $q = useQuasar()

const props = defineProps<{
  orderItem: any
}>()

const emit = defineEmits(['review-submitted'])

const showDialog = ref(false)
const rating = ref(5)
const content = ref('')
const pictures = ref<string[]>([])
const isAnonymous = ref(0)
const submitting = ref(false)

// 表单验证
const isValid = computed(() => {
  return rating.value > 0 && content.value.trim().length > 0
})

const submitReview = async () => {
  if (!isValid.value) return

  submitting.value = true
  try {
    const reviewData = {
      orderItemId: props.orderItem.orderItemId,
      prodId: props.orderItem.prodId,
      orderId:props.orderItem.orderId,
      score: rating.value,
      content: content.value,
      pics: pictures.value,
      isAnonymous: isAnonymous.value
    }
    const response = await api.post('/admin/prod/comm/add', reviewData)

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: t('order.review.submitSuccess')
      })
      emit('review-submitted')
      showDialog.value = false
    } else {
      throw new Error(msg || t('order.review.submitFailed'))
    }
  } catch (error) {
    console.error('提交评论失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('order.review.submitFailed')
    })
  } finally {
    submitting.value = false
  }
}

// 对外暴露打开方法
defineExpose({
  open: () => {
    showDialog.value = true
  }
})
</script>

<style lang="scss" scoped>
.upload-box {
  border: 1px dashed #ddd;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--q-primary);
    color: var(--q-primary);
  }
}
</style>
