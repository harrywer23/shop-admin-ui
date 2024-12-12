<template>
  <div class="detail-edit">
    <q-card class="edit-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">编辑商品详情</div>
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

      <!-- 商品基本信息展示 -->
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

      <!-- 富文本编辑器 -->
      <q-card-section>
        <div class="editor-container">
          <Editor
            ref="editorRef"
            v-model="content"
            api-key="z0s2wjpp6mrvdagfhnkghbi1bcsszmg52v1p3lvh69ljlygc"
            :init="{
              height: 500,
              menubar: true,
              plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount'
              ],
              toolbar:
                'undo redo | formatselect | bold italic backcolor | \
                alignleft aligncenter alignright alignjustify | \
                bullist numlist outdent indent | removeformat | help',
              language: 'zh_CN',
              images_upload_url: '/common/uploadImage',
              images_upload_handler: handleImageUpload
            }"
            @onInit="handleEditorInit"
          />
        </div>
      </q-card-section>

      <!-- 底部按钮 -->
      <q-card-section>
        <div class="row justify-end">
          <q-btn
            flat
            label="取消"
            color="grey-7"
            class="q-mr-sm"
            @click="router.back()"
          />
          <q-btn
            unelevated
            color="primary"
            :loading="submitting"
            label="保存"
            @click="handleSubmit"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import Editor from '@tinymce/tinymce-vue'
import { api } from '~/utils/axios'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const prodId = ref(route.query.prodId)
const submitting = ref(false)
const content = ref('')
const productInfo = ref<any>(null)
const editorRef = ref<any>(null)
const editorApiKey = 'your-api-key' // 替换为你的 TinyMCE API Key
const editorInstance = ref<any>(null)

// 加载商品数据
async function loadData() {
  //console.log('=== 开始加载商品数据 ===')
  try {
    const response = await fetch(`/api/prod/detail?id=${prodId.value}`)
    const result = await response.json()
    //console.log('商品数据:', result)

    if (result.code === 200) {
      productInfo.value = result.data
      content.value = result.data.content || ''
      //console.log('商品详情内容:', content.value)

      // 如果编辑器已经初始化，直接设置内容
      if (editorInstance.value) {
        editorInstance.value.setContent(content.value)
        //console.log('编辑器内容已更新')
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载数据失败'
    })
  }
  //console.log('=== 商品数据加载完成 ===')
}

// 编辑器初始化完成的回调
function handleEditorInit(evt: any, editor: any) {
  //console.log('编辑器初始化完成')
  editorInstance.value = editor

  // 初始化完成后设置内容
  if (content.value) {
    editor.setContent(content.value)
    //console.log('初始化时设置编辑器内容:', content.value)
  }
}

// 添加 idList 工具函数
function getIdList(content: string): string[] {
  //console.log('=== 开始解析内容中的ID ===')
  const ids: string[] = []

  try {
    // 匹配图片标签中的 src 属性
    const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/g
    let match

    while ((match = imgRegex.exec(content)) !== null) {
      const src = match[1]
      //console.log('找到图片:', src)

      // 从图片URL中提取ID
      const idMatch = src.match(/\/([^\/]+)$/)
      if (idMatch) {
        const id = idMatch[1]
        //console.log('提取到ID:', id)
        ids.push(id)
      }
    }

    //console.log('解析到的所有ID:', ids)
    return [...new Set(ids)] // 去重
  } catch (error) {
    console.error('解析ID失败:', error)
    return []
  }
}

// 修改提交更新方法
async function handleSubmit() {
  //console.log('=== 开始提交更新 ===')
  try {
    if (!content.value.trim()) {
      $q.notify({
        type: 'warning',
        message: '请输入商品详情内容'
      })
      return
    }

    submitting.value = true

    // 获取内容中的图片ID列表
    const imageIds = getIdList(content.value)
    //console.log('内容中的图片ID:', imageIds)

    const submitData = {
      prodId: prodId.value,
      content: content.value,
      imageIds // 添加图片ID列表
    }
    //console.log('提交数据:', submitData)

    const response = await api.post('/prod/update/content', submitData)

    //console.log('提交响应:', response)

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '保存成功'
      })
      router.back()
    } else {
      throw new Error(response.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  } finally {
    submitting.value = false
    //console.log('=== 更新提交完成 ===')
  }
}

// 修改图片上传处理方法
async function handleImageUpload(blobInfo: any, success: Function, failure: Function) {
  //console.log('=== 开始上传图片 ===')
  try {
    const formData = new FormData()
    formData.append('file', blobInfo.blob())
    //console.log('上传文件:', blobInfo.blob())

    const response = await api.post('/common/uploadImage', formData)

    const result = await response.data
    //console.log('上传结果:', result)

    if (result.code === 200) {
      const imageUrl = result.data.sourceUrl
      //console.log('上传成功, 图片URL:', imageUrl)

      // 从URL中提取ID
      const idMatch = imageUrl.match(/\/([^\/]+)$/)
      if (idMatch) {
        const imageId = idMatch[1]
        //console.log('提取到图片ID:', imageId)
      }

      success(imageUrl)
    } else {
      console.error('上传失败:', result.msg)
      failure('上传失败: ' + result.msg)
    }
  } catch (error) {
    console.error('上传异常:', error)
    failure('上传失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
  //console.log('=== 图片上传完成 ===')
}

// 监听内容变化
watch(content, (newContent) => {
  //console.log('内容变化:', newContent)
  if (editorInstance.value) {
    const currentContent = editorInstance.value.getContent()
    if (currentContent !== newContent) {
      editorInstance.value.setContent(newContent)
    }
  }
})

onMounted(() => {
  if (prodId.value) {
    loadData()
  }
})
</script>

<style lang="scss" scoped>
.detail-edit {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;

  .edit-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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

  .editor-container {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    min-height: 500px;

    :deep(.tox-tinymce) {
      border: none;
    }
  }
}
</style>
