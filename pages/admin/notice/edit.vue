<template>
  <div class="notice-edit">
    <div class="page-header">
      <h1 class="text-h5">{{ isEdit ? '编辑公告' : '新增公告' }}</h1>
    </div>

    <q-card class="edit-form">
      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- 标题国际化输入 -->
          <div class="translations-section">
            <div class="text-subtitle2 q-mb-sm">公告标题</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.translationsI18n.zh"
                  label="中文标题"
                  :rules="[val => !!val || '请输入中文标题']"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.translationsI18n.en"
                  label="English Title"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.translationsI18n.zhTw"
                  label="繁體中文標題"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.translationsI18n.ja"
                  label="日本語タイトル"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.translationsI18n.ko"
                  label="한국어 제목"
                  outlined
                  dense
                />
              </div>
            </div>
          </div>

          <!-- 内容国际化输入 -->
          <div class="translations-section">
            <div class="text-subtitle2 q-mb-sm">公告内容</div>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="text-subtitle2">中文内容</div>
                <tiny-mce
                  v-model="formData.translationsContentI18n.zh"
                  :rules="[val => !!val || '请输入中文内容']"
                />
              </div>
              <div class="col-12">
                <div class="text-subtitle2">English Content</div>
                <tiny-mce v-model="formData.translationsContentI18n.en" />
              </div>
              <div class="col-12">
                <div class="text-subtitle2">繁體中文內容</div>
                <tiny-mce v-model="formData.translationsContentI18n.zhTw" />
              </div>
              <div class="col-12">
                <div class="text-subtitle2">日本語内容</div>
                <tiny-mce v-model="formData.translationsContentI18n.ja" />
              </div>
              <div class="col-12">
                <div class="text-subtitle2">한국어 내용</div>
                <tiny-mce v-model="formData.translationsContentI18n.ko" />
              </div>
            </div>
          </div>

          <!-- 发布时间 -->
          <q-input
            v-model="formData.publishTime"
            type="datetime-local"
            label="发布时间"
            outlined
            dense
          />

          <!-- 置顶和状态 -->
          <div class="row q-gutter-md">
            <q-toggle
              v-model="formData.isTop"
              :false-value="0"
              :true-value="1"
              label="置顶"
            />
            <q-toggle
              v-model="formData.status"
              :false-value="0"
              :true-value="1"
              label="发布"
            />
          </div>

          <!-- 按钮 -->
          <div class="row justify-end q-gutter-sm">
            <q-btn
              flat
              label="返回"
              color="primary"
              @click="$router.back()"
            />
            <q-btn
              :label="isEdit ? '保存' : '创建'"
              color="primary"
              type="submit"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import TinyMce from '~/components/tiny-mce/index.vue'
import { api } from '~/utils/axios'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const isEdit = ref(!!route.query.id)

// 表单数据
const formData = ref({
  id: null,
  title: '',
  content: '',
  status: false,
  isTop: false,
  publishTime: '',
  updateTime: '',
  translations: '{}',
  translationsContent: '{}',
  translationsI18n: {
    zh: '',
    en: '',
    zhTw: '',
    ja: '',
    ko: ''
  },
  translationsContentI18n: {
    zh: '',
    en: '',
    zhTw: '',
    ja: '',
    ko: ''
  }
})

// 获取公告详情
const getNoticeDetail = async (id: string) => {
  try {
    const response = await api.get(`/admin/notice/detail/${id}`)
    const { code, data } = response.data
    if (code === 200) {
      formData.value = {
        ...data,
        translationsI18n: data.translations ? JSON.parse(data.translations) : {
          zh: data.title,
          en: '',
          zhTw: '',
          ja: '',
          ko: ''
        },
        translationsContentI18n: data.translationsContent ? JSON.parse(data.translationsContent) : {
          zh: data.content,
          en: '',
          zhTw: '',
          ja: '',
          ko: ''
        }
      }
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取公告详情失败'
    })
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    const url = isEdit.value ? '/admin/notice/update' : '/admin/notice/add'
    const submitData = {
      ...formData.value,
      title: formData.value.translationsI18n.zh,
      content: formData.value.translationsContentI18n.zh,
      translations: JSON.stringify(formData.value.translationsI18n),
      translationsContent: JSON.stringify(formData.value.translationsContentI18n)
    }

    const response = await api.post(url, submitData)
    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: isEdit.value ? '更新成功' : '创建成功'
      })
      router.back()
    } else {
      throw new Error(msg || '保存失败')
    }
  } catch (error) {
    console.error('保存公告失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  }
}

onMounted(() => {
  if (route.query.id) {
    getNoticeDetail(route.query.id as string)
  }
})
</script>

<style lang="scss" scoped>
.notice-edit {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;

    h1 {
      margin: 0;
      color: #1976d2;
      display: flex;
      align-items: center;

      &:before {
        content: '';
        width: 4px;
        height: 20px;
        background: #1976d2;
        margin-right: 8px;
        border-radius: 2px;
      }
    }
  }

  .edit-form {
    background: white;
    border-radius: 8px;
  }

  .translations-section {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fafafa;

    .text-subtitle2 {
      color: #666;
      font-weight: 500;
      margin-bottom: 12px;
    }
  }
}
</style>
