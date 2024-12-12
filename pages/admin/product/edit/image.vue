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
            :src="productInfo.pic"
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
        <div class="upload-section">
          <!-- 已上传图片列表 -->
          <div class="image-grid" v-if="imageList.length">
            <div
              v-for="(img, index) in imageList"
              :key="index"
              class="image-item"
            >
              <q-img :src="getImageUrl(img.url)" :ratio="1">
                <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                  <q-btn-group spread flat>
                    <q-btn
                      color="negative"
                      icon="delete"
                      flat
                      dense
                      @click="removeImage(index)"
                    >
                      <q-tooltip>删除</q-tooltip>
                    </q-btn>
                    <q-btn
                      color="primary"
                      icon="visibility"
                      flat
                      dense
                      @click="previewImage(img.url)"
                    >
                      <q-tooltip>预览</q-tooltip>
                    </q-btn>
                    <q-btn
                      color="primary"
                      icon="swap_vert"
                      flat
                      dense
                      @click="showSortDialog(index)"
                    >
                      <q-tooltip>排序</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </div>
              </q-img>
            </div>
          </div>

          <!-- 上传按钮 -->
          <div class="upload-trigger" @click="triggerUpload">
            <q-icon name="add_photo_alternate" size="48px" color="grey-6" />
            <div class="upload-text">
              <div>点击上传宣传图片</div>
              <div class="text-caption text-grey">支持jpg、png格式，建议尺寸800x800像素</div>
            </div>
          </div>

          <!-- 隐藏的文件输入框 -->
          <q-file
            v-model="uploadFiles"
            multiple
            accept=".jpg,.jpeg,.png"
            style="display: none"
            @update:model-value="handleFileUpload"
            ref="fileInput"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- 图片预览对话框 -->
    <q-dialog v-model="previewDialog">
      <q-card class="preview-card">
        <q-card-section class="row items-center">
          <div class="text-h6">图片预览</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-img :src="previewUrl" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 排序对话框 -->
    <q-dialog v-model="sortDialog.show">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">调整排序</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model.number="sortDialog.newIndex"
            type="number"
            label="新位置"
            :rules="[
              val => val >= 0 || '位置不能为负数',
              val => val < imageList.length || '位置超出范围'
            ]"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确定" color="primary" @click="confirmSort" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const prodId = ref(route.query.prodId)

// 产品信息
const productInfo = ref<any>(null)
const imageList = ref<any[]>([])
const uploadFiles = ref<File[]>([])
const fileInput = ref<any>(null)

// 预览相关
const previewDialog = ref(false)
const previewUrl = ref('')

// 排序相关
const sortDialog = ref({
  show: false,
  currentIndex: 0,
  newIndex: 0
})

// 加载产品信息和图片列表
async function loadData() {
  try {
    const response = await fetch(`/api/prod/detail?id=${prodId.value}`)
    const result = await response.json()
    //console.log('商品数据加载成功 1:',result);
    if (result.code === 200) {
      productInfo.value = result.data;
      // 转换图片列表格式
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

// 触发文件选择
function triggerUpload() {
  fileInput.value.$el.querySelector('input').click()
}

// 处理文件上传
async function handleFileUpload(files: File[]) {
  if (!files.length) return

  try {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await fetch('/api/upload/batch', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    if (result.code === 200) {
      // 添加新上传的图片
      const newImages = result.data.map((item: any) => ({ url: item.url }))
      imageList.value.push(...newImages)
      await saveImages()

      $q.notify({
        type: 'positive',
        message: '图片上传成功'
      })
    }
  } catch (error) {
    console.error('上传失败:', error)
    $q.notify({
      type: 'negative',
      message: '图片上传失败'
    })
  } finally {
    uploadFiles.value = []
  }
}

// 删除图片
async function removeImage(index: number) {
  try {
    imageList.value.splice(index, 1)
    await saveImages()

    $q.notify({
      type: 'positive',
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除失败:', error)
    $q.notify({
      type: 'negative',
      message: '删除失败'
    })
  }
}

// 预览图片
function previewImage(url: string) {
  previewUrl.value = url
  previewDialog.value = true
}

// 显示排序对话框
function showSortDialog(index: number) {
  sortDialog.value = {
    show: true,
    currentIndex: index,
    newIndex: index
  }
}

// 确认排序
async function confirmSort() {
  try {
    const { currentIndex, newIndex } = sortDialog.value
    const item = imageList.value.splice(currentIndex, 1)[0]
    imageList.value.splice(newIndex, 0, item)
    await saveImages()

    sortDialog.value.show = false
    $q.notify({
      type: 'positive',
      message: '排序已更新'
    })
  } catch (error) {
    console.error('更新排序失败:', error)
    $q.notify({
      type: 'negative',
      message: '更新排序失败'
    })
  }
}

// 保存图片列表
async function saveImages() {
  try {
    const response = await fetch('/api/prod/prod/images/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prodId: prodId.value,
        imgs: imageList.value.map(img => img.url).join(',')
      })
    })

    const result = await response.json()
    if (result.code !== 200) {
      throw new Error(result.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存图片列表失败:', error)
    throw error
  }
}

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

  .upload-section {
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;

      .image-item {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);

        &:hover {
          .absolute-bottom {
            opacity: 1;
          }
        }

        .absolute-bottom {
          opacity: 0;
          transition: opacity 0.3s;
          background: rgba(0,0,0,0.6) !important;
          padding: 8px;
        }
      }
    }

    .upload-trigger {
      width: 200px;
      height: 200px;
      border: 2px dashed #dcdfe6;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--primary-color);
        background: #f5f7fa;
      }

      .upload-text {
        margin-top: 16px;
        text-align: center;
      }
    }
  }
}

.preview-card {
  width: 90vw;
  max-width: 800px;
}
</style>
