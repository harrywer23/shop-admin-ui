<template>
    <div class="estimate-confirm-page">
      <div class="page-header">
        <h1 class="text-h4">预估方案确认</h1>
      </div>
  
      <div class="row q-col-gutter-lg">
        <!-- 左侧预估信息 -->
        <div class="col-12 col-md-8">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">预估成品信息</div>
              
              <!-- 基本信息 -->
              <div class="info-section q-mt-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <div class="label">成品名称</div>
                    <div class="value">{{ estimate.name }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="label">尺寸规格</div>
                    <div class="value">{{ estimate.size }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="label">材质</div>
                    <div class="value">{{ estimate.material }}</div>
                  </div>
                  <div class="col-12">
                    <div class="label">工艺说明</div>
                    <div class="value">{{ estimate.craft }}</div>
                  </div>
                </div>
              </div>
  
              <!-- 预览图 -->
              <div class="preview-section q-mt-lg">
                <div class="text-subtitle2 q-mb-sm">效果预览</div>
                <div class="row q-col-gutter-md">
                  <div
                    v-for="(pic, index) in estimate.previewPics"
                    :key="index"
                    class="col-6 col-sm-4"
                  >
                    <q-img
                      :src="getImageUrl(pic)"
                      @click="previewImage(pic)"
                      class="rounded-borders cursor-pointer"
                    />
                  </div>
                </div>
              </div>
  
              <!-- 特点说明 -->
              <div class="features-section q-mt-lg">
                <div class="text-subtitle2 q-mb-sm">特点说明</div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="(feature, index) in estimate.features"
                    :key="index"
                    class="col-12 col-sm-6"
                  >
                    <q-item dense>
                      <q-item-section avatar>
                        <q-icon name="check_circle" color="positive" />
                      </q-item-section>
                      <q-item-section>
                        {{ feature }}
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
              </div>
  
              <!-- 备注说明 -->
              <div class="remark-section q-mt-lg" v-if="estimate.remark">
                <div class="text-subtitle2 q-mb-sm">备注说明</div>
                <div class="remark-content">{{ estimate.remark }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
  
        <!-- 右侧价格信息 -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="price-card">
            <q-card-section>
              <div class="text-h6">价格信息</div>
              
              <div class="price-info q-mt-md">
                <div class="price-item">
                  <span class="label">预估价格</span>
                  <span class="value text-h5 text-primary">
                    ¥{{ estimate.estimatedPrice }}
                  </span>
                </div>
                
                <div class="price-item">
                  <span class="label">定金比例</span>
                  <span class="value">{{ estimate.depositRate }}%</span>
                </div>
                
                <div class="price-item">
                  <span class="label">需付定金</span>
                  <span class="value text-h6 text-negative">
                    ¥{{ estimate.depositAmount }}
                  </span>
                </div>
                
                <div class="price-item">
                  <span class="label">预估工期</span>
                  <span class="value">{{ estimate.estimatedTime }}天</span>
                </div>
              </div>
  
              <!-- 确认按钮 -->
              <div class="actions q-mt-xl">
                <q-btn
                  color="negative"
                  outline
                  label="拒绝方案"
                  class="full-width q-mb-md"
                  @click="rejectEstimate"
                />
                <q-btn
                  color="primary"
                  label="确认并支付定金"
                  class="full-width"
                  @click="confirmEstimate"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
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
  import { useRoute, useRouter } from 'vue-router'
  import { useQuasar } from 'quasar'
  import { api } from '@/utils/axios'
  
  const route = useRoute()
  const router = useRouter()
  const $q = useQuasar()
  
  const estimate = ref<any>(null)
  const showPreview = ref(false)
  const previewUrl = ref('')
  
  // 加载预估信息
  const loadEstimate = async () => {
    try {
      const response = await api.get(`/custom/estimate/${route.params.id}`)
      const { code, data } = response.data
      if (code === 200) {
        estimate.value = data
      }
    } catch (error) {
      console.error('获取预估信息失败:', error)
    }
  }
  
  // 确认预估方案
  const confirmEstimate = async () => {
    try {
      const response = await api.post(`/custom/estimate/${route.params.id}/confirm`)
      const { code, data } = response.data
      if (code === 200) {
        // 跳转到支付页面
        router.push(`/order/payment?orderNumber=${data.orderNumber}`)
      }
    } catch (error) {
      console.error('确认预估方案失败:', error)
    }
  }
  
  // 拒绝预估方案
  const rejectEstimate = async () => {
    try {
      await $q.dialog({
        title: '拒绝方案',
        message: '确定要拒绝此预估方案吗？',
        cancel: true,
        persistent: true
      })
  
      const response = await api.post(`/custom/estimate/${route.params.id}/reject`)
      if (response.data.code === 200) {
        $q.notify({
          type: 'positive',
          message: '已拒绝预估方案'
        })
        router.push('/custom/list')
      }
    } catch (error) {
      console.error('拒绝预估方案失败:', error)
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
    loadEstimate()
  })
  </script>
  
  <style lang="scss" scoped>
  .estimate-confirm-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  
    .info-section {
      .label {
        color: #666;
        font-size: 0.9em;
        margin-bottom: 4px;
      }
      .value {
        font-weight: 500;
      }
    }
  
    .price-card {
      position: sticky;
      top: 20px;
  
      .price-info {
        .price-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
  
          .label {
            color: #666;
          }
        }
      }
    }
  
    .remark-content {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
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