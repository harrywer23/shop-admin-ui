<template>
  <div class="category-add q-pa-md">
    <q-card class="q-pa-lg">
      <div class="text-h6 q-mb-md">{{ $t('添加分类') }}</div>

      <q-form @submit="onSubmit" class="q-gutter-md">
        <!-- 分类名称 -->
        <q-input
          v-model="formData.categoryName"
          :label="$t('分类名称')"
          :rules="[val => !!val || $t('请输入分类名称')]"
          outlined
        />

        <!-- 上级分类 -->
        <q-select
          v-model="formData.parentId"
          :options="categoryOptions"
          :label="$t('上级分类')"
          option-value="categoryId"
          option-label="categoryName"
          emit-value
          map-options
          outlined
        >
          <template v-slot:prepend>
            <q-btn
              flat
              round
              dense
              icon="clear"
              @click.stop="formData.parentId = 0"
              :disable="!formData.parentId"
            />
          </template>
        </q-select>

        <!-- 排序 -->
        <q-input
          v-model.number="formData.seq"
          type="number"
          :label="$t('排序')"
          outlined
        />

        <!-- 图标上传 -->
        <div class="row items-center q-gutter-md">
          <div class="col">
            <div class="text-subtitle2 q-mb-sm">{{ $t('分类图标') }}</div>
            <q-file
              v-model="iconFile"
              :label="$t('选择图片')"
              accept=".jpg,.jpeg,.png,.gif"
              outlined
              @update:model-value="handleIconUpload"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
          </div>
          <q-img
            v-if="iconPreview"
            :src="iconPreview"
            style="width: 100px; height: 100px"
            class="q-ml-md"
          />
        </div>

        <!-- 分类图片上传 -->
        <div class="row items-center q-gutter-md">
          <div class="col">
            <div class="text-subtitle2 q-mb-sm">{{ $t('分类图片') }}</div>
            <q-file
              v-model="picFile"
              :label="$t('选择图片')"
              accept=".jpg,.jpeg,.png,.gif"
              outlined
              @update:model-value="handlePicUpload"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
          </div>
          <q-img
            v-if="picPreview"
            :src="picPreview"
            style="width: 100px; height: 100px"
            class="q-ml-md"
          />
        </div>

        <!-- 状态 -->
        <q-toggle
          v-model="formData.status"
          :false-value="0"
          :true-value="1"
          :label="$t('启用')"
        />

        <!-- 按钮 -->
        <div class="row justify-end q-gutter-sm">
          <q-btn
            :label="$t('取消')"
            color="primary"
            flat
            @click="$router.back()"
          />
          <q-btn
            :label="$t('保存')"
            color="primary"
            type="submit"
          />
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/axios'

const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

interface CategoryOption {
  categoryId: number
  categoryName: string
  parentId: number
}

// 表单数据
const formData = ref({
  categoryName: '',
  parentId: 0,
  seq: 0,
  icon: '',
  pic: '',
  status: 1
})

// 文件对象
const iconFile = ref<File | null>(null)
const picFile = ref<File | null>(null)

// 图片预览
const iconPreview = ref<string | null>(null)
const picPreview = ref<string | null>(null)

// 分类选项
const categoryOptions = ref<CategoryOption[]>([
  { categoryId: 0, categoryName: t('顶级分类'), parentId: -1 }
])

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await api.get('/category/list')
    if (res.data.succ) {
      categoryOptions.value = [
        { categoryId: 0, categoryName: t('顶级分类'), parentId: -1 },
        ...res.data.data
      ]
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 处理图标上传
const handleIconUpload = (file: File) => {
  if (!file) return
  iconFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    iconPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// 处理图片上传
const handlePicUpload = (file: File) => {
  if (!file) return
  picFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    picPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// 提交表单
const onSubmit = async () => {
  const formDataToSend = new FormData()
  formDataToSend.append('categoryName', formData.value.categoryName)
  formDataToSend.append('parentId', formData.value.parentId.toString())
  formDataToSend.append('seq', formData.value.seq.toString())
  formDataToSend.append('status', formData.value.status ? '1' : '0')
  if (iconFile.value) formDataToSend.append('icon', iconFile.value)
  if (picFile.value) formDataToSend.append('pic', picFile.value)

  try {
    const res = await api.post('/category/add', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    if (res.data.succ) {
      $q.notify({
        type: 'positive',
        message: t('添加成功')
      })
      router.back()
    } else {
      $q.notify({
        type: 'negative',
        message: res.data.msg || t('添加失败')
      })
    }
  } catch (error) {
    console.error('添加分类失败:', error)
    $q.notify({
      type: 'negative',
      message: t('添加失败')
    })
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style lang="scss" scoped>
.category-add {
  max-width: 800px;
  margin: 0 auto;
}
</style>
