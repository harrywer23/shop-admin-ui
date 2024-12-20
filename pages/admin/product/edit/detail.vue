<template>
  <div class="detail-edit">
    <q-card class="edit-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">商品详情编辑</div>
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

      <q-card-section>
        <!-- 商品名称显示 -->
        <div class="product-name q-mb-md">
          <div class="text-subtitle2 q-mb-sm">商品名称</div>
          <div class="text-h6">{{ prodName }}</div>
        </div>

        <!-- TinyMCE 编辑器 -->
        <div class="editor-container">
          <tiny-mce
            v-model="content"
            :height="600"
            @change="handleEditorChange"
          />
        </div>

        <!-- 底部按钮 -->
        <div class="row justify-end q-mt-lg">
          <q-btn
            flat
            label="取消"
            color="grey-7"
            class="q-mr-sm"
            @click="router.back()"
          />
          <q-btn
            label="保存"
            color="primary"
            :loading="saving"
            @click="handleSave"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import TinyMce from '~/components/tiny-mce/index.vue'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const prodId = ref(route.query.prodId)
const prodName = ref('')
const content = ref('')
const saving = ref(false)

// 加载商品数据
async function loadProductData() {
  if (!prodId.value) return

  try {
    const response = await api.get(`/sys/prod/detail/${prodId.value}`)
    const result = await response.data

    if (result.code === 200) {
      prodName.value = result.data.prodName
      content.value = result.data.detail || ''
    }
  } catch (error) {
    console.error('加载商品数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载商品数据失败'
    })
  }
}

// 处理编辑器内容变化
function handleEditorChange(value: string) {
  content.value = value
}

// 保存商品详情
async function handleSave() {
  if (!content.value.trim()) {
    $q.notify({
      type: 'warning',
      message: '请输入商品详情'
    })
    return
  }

  try {
    saving.value = true
    const response = await api.post('/sys/prod/update/detail', {
      prodId: prodId.value,
      detail: content.value
    })

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
    saving.value = false
  }
}

// 在组件挂载时加载数据
onMounted(() => {
  loadProductData()
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .product-name {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e0e0e0;

    .text-subtitle2 {
      color: #666;
    }

    .text-h6 {
      color: #333;
    }
  }

  .editor-container {
    margin-top: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }
}
</style>
