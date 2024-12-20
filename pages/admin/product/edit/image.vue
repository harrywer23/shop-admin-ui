<template>
  <div class="promo-images-page">
    <q-card class="main-card">
      <!-- 顶部标题栏 -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">宣传图片管理</div>
        <q-space />
        <q-btn
          icon="arrow_back"
          flat
          round
          dense
          v-close-popup
          @click="router.back()"
        />
      </q-card-section>

      <!-- 产品信息 -->
      <q-card-section v-if="productInfo" class="product-info q-pt-none">
        <div class="row items-center">
          <q-img
            :src="getImageUrl(productInfo.pic)"
            class="product-image"
            width="80px"
            height="80px"
          />
          <div class="product-details q-ml-md">
            <div class="text-subtitle1">{{ productInfo.prodName }}</div>
            <div class="text-caption text-grey">编码: {{ productInfo.prodCode }}</div>
          </div>
        </div>
      </q-card-section>

      <!-- 图片上传区域 -->
      <q-card-section>
        <image-uploader
          v-model="imageList"
          hint="支持jpg、png格式，建议尺寸800x800像素"
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useRuntimeConfig } from '#app'
import ImageUploader from '~/components/common/ImageBatchUploader.vue'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const config = useRuntimeConfig()
const IMAGE_BASE_URL = config.public.imageBaseUrl || 'https://image.aiavr.uk/xinshijie'

// 添加 getImageUrl 函数
function getImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${IMAGE_BASE_URL}${url}`
}

// 产品信息
interface ProductInfo {
  prodId: string
  prodName: string
  prodCode: string
  pic: string
  imgs: string
}

const prodId = ref(route.query.prodId as string)
const productInfo = ref<ProductInfo | null>(null)
const imageList = ref<Array<{url: string}>>([])

// 加载产品信息和图片列表
async function loadData() {
  try {
    const response = await api.get(`/sys/prod/detail/${prodId.value}`)
    const result = await response.data

    if (result.code === 200) {
      productInfo.value = result.data
      // 将逗号分隔的图片字符串转换为数组对象
      imageList.value = result.data.imgs
        ? result.data.imgs.split(',').map((url: string) => ({ url }))
        : []
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载数据失败'
    })
  }
}

// 处理上传成功
async function handleUploadSuccess() {
  try {
    await saveImages()
    $q.notify({
      type: 'positive',
      message: '图片保存成功'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '图片保存失败'
    })
  }
}

// 处理上传失败
function handleUploadError(error: any) {
  console.error('上传失败:', error)
  $q.notify({
    type: 'negative',
    message: '图片上传失败'
  })
}

// 保存图片列表
async function saveImages() {
  try {
    const response = await api.post('/sys/prod/update/images', {
      prodId: prodId.value,
      imgs: imageList.value.map(img => img.url).join(',')
    })

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存图片列表失败:', error)
    throw error
  }
}

// 监听图片列表变化
watch(imageList, async () => {
  try {
    await saveImages()
  } catch (error) {
    console.error('自动保存失败:', error)
  }
}, { deep: true })

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.promo-images-page {
  padding: 20px;

  .main-card {
    max-width: 1200px;
    margin: 0 auto;
  }

  .product-info {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 0;

    .product-image {
      border-radius: 4px;
    }

    .product-details {
      .text-subtitle1 {
        font-weight: 500;
      }
    }
  }
}
</style>
