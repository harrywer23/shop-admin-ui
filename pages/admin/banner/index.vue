<template>
  <div class="banner-management">
    <div class="page-header">
      <h1 class="text-h5">Banner 管理</h1>
      <q-btn
        color="primary"
        icon="add"
        label="新增 Banner"
        @click="showBannerDialog('add')"
      />
    </div>

    <!-- Banner 列表 -->
    <q-table
      :rows="banners"
      :columns="columns"
      row-key="bannerId"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- 图片预览列 -->
      <template v-slot:body-cell-imgUrl="props">
        <q-td :props="props">
          <q-img
            :src="getImageUrl(props.row.imgUrl)"
            style="width: 100px; height: 50px"
            fit="cover"
            @click="previewImage(props.row.imgUrl)"
          />
        </q-td>
      </template>

      <!-- 状态列 -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.status ? 'positive' : 'negative'"
            text-color="white"
            dense
          >
            {{ props.row.status ? '启用' : '禁用' }}
          </q-chip>
        </q-td>
      </template>

      <!-- 操作列 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              @click="showBannerDialog('edit', props.row)"
            >
              <q-tooltip>编辑</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              :color="props.row.status ? 'negative' : 'positive'"
              :icon="props.row.status ? 'visibility_off' : 'visibility'"
              @click="toggleStatus(props.row)"
            >
              <q-tooltip>{{ props.row.status ? '禁用' : '启用' }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>删除</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Banner 编辑对话框 -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ dialogMode === 'add' ? '新增 Banner' : '编辑 Banner' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <!-- 标题国际化输入 -->
            <div class="translations-section">
              <div class="text-subtitle2 q-mb-sm">标题</div>
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

            <!-- 描述国际化输入 -->
            <div class="translations-section">
              <div class="text-subtitle2 q-mb-sm">描述</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.descriptionsI18n.zh"
                    label="中文描述"
                    type="textarea"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.descriptionsI18n.en"
                    label="English Description"
                    type="textarea"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.descriptionsI18n.zhTw"
                    label="繁體中文描述"
                    type="textarea"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.descriptionsI18n.ja"
                    label="日本語説明"
                    type="textarea"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.descriptionsI18n.ko"
                    label="한국어 설명"
                    type="textarea"
                    outlined
                    dense
                  />
                </div>
              </div>
            </div>

            <!-- 图片上传 -->
            <div class="upload-section">
              <div class="text-subtitle2 q-mb-sm">Banner 图片</div>
              <q-file
                v-model="uploadFile"
                accept="image/*"
                outlined
                dense
                @update:model-value="handleFileUpload"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
              <div v-if="formData.imgUrl" class="preview-image q-mt-sm">
                <q-img
                  :src="getImageUrl(formData.imgUrl)"
                  style="max-width: 200px"
                />
              </div>
            </div>

            <!-- 链接地址 -->
            <q-input
              v-model="formData.linkUrl"
              label="链接地址"
              outlined
              dense
            />

            <!-- 位置选择 -->
            <q-select
              v-model="formData.position"
              :options="positionOptions"
              option-value="value"
              label="显示位置"
              :rules="[val => !!val || '请选择显示位置']"
              outlined
              dense
            />

            <!-- 排序 -->
            <q-input
              v-model.number="formData.sort"
              type="number"
              label="排序"
              outlined
              dense
            />

            <!-- 时间范围 -->
<!--            <div class="row q-col-gutter-md">-->
<!--              <div class="col-12 col-sm-6">-->
<!--                <q-input-->
<!--                  v-model="formData.startTime"-->
<!--                  label="开始时间"-->
<!--                  type="datetime-local"-->
<!--                  outlined-->
<!--                  dense-->
<!--                />-->
<!--              </div>-->
<!--            </div>-->

            <!-- 状态 -->
            <q-toggle
              v-model="formData.status"
              :false-value="2"
              :true-value="1"
              label="启用"
            />

            <!-- 按钮 -->
            <div class="row justify-end q-gutter-sm">
              <q-btn
                flat
                label="取消"
                color="primary"
                v-close-popup
              />
              <q-btn
                :label="dialogMode === 'add' ? '创建' : '保存'"
                color="primary"
                type="submit"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 图片预览对话框 -->
    <q-dialog v-model="previewDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <q-img :src="previewUrl" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { date } from 'quasar'
import { api } from '~/utils/axios'

const $q = useQuasar()
const config = useRuntimeConfig()

// Banner 接口定义
interface Translations {
  zh: string
  en: string
  zhTw: string
  ja: string
  ko: string
}

interface Banner {
  bannerId: number | null
  title: string
  imgUrl: string
  linkUrl: string
  position: string
  sort: number
  status: number
  startTime: string
  translations: string
  descriptions: string
  translationsI18n: Translations
  descriptionsI18n: Translations
}



// 转换请求参数
const tansParams = (params: Record<string, any>): string => {
  let result = ''
  for (const key in params) {
    if (params[key] !== null && params[key] !== undefined) {
      result += `&${key}=${encodeURIComponent(params[key])}`
    }
  }
  return result.substring(1)
}

// 表格列定义
const columns = [
  { name: 'bannerId', label: 'ID', field: 'bannerId', sortable: true },
  { name: 'title', label: '标题', field: 'title', sortable: true },
  { name: 'imgUrl', label: '图片', field: 'imgUrl' },
  { name: 'position', label: '位置', field: 'position', sortable: true },
  { name: 'sort', label: '排序', field: 'sort', sortable: true },
  { name: 'status', label: '状态', field: 'status' },
  { name: 'startTime', label: '开始时间', field: 'startTime', sortable: true,
    format: (val: string) => val ? date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') : '-'
  },
  { name: 'description', label: '描述', field: (row: Banner) => row.descriptionsI18n?.zh || '-', sortable: true },
  { name: 'actions', label: '操作', field: 'actions' }
]

// 状态变量
const banners = ref<Banner[]>([])
const loading = ref(false)
const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formData = ref<Banner>({
  bannerId: null,
  title: '',
  imgUrl: '',
  linkUrl: '',
  position: '',
  sort: 0,
  status: 1,
  startTime: '',
  translations: '{}',
  descriptions: '{}',
  translationsI18n: {
    zh: '',
    en: '',
    zhTw: '',
    ja: '',
    ko: ''
  },
  descriptionsI18n: {
    zh: '',
    en: '',
    zhTw: '',
    ja: '',
    ko: ''
  }
})
const uploadFile = ref<File | null>(null)
const previewDialog = ref(false)
const previewUrl = ref('')
const pagination = ref({
  sortBy: 'sort',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 位置选项
const positionOptions = [
  { label: '首页', value: 'home' },
  { label: '分类页', value: 'category' },
  { label: '商品页', value: 'product' }
]

// 添加 initFormData 函数定义
const initFormData = (): Banner => ({
  bannerId: null,
  title: '',
  imgUrl: '',
  linkUrl: '',
  position: '',
  sort: 0,
  status: 1,
  startTime: '',
  translations: '{}',
  descriptions: '{}',
  translationsI18n: {
    zh: '',
    en: '',
    zhTw: '',
    ja: '',
    ko: ''
  },
  descriptionsI18n: {
    zh: '',
    en: '',
    zhTw: '',
    ja: '',
    ko: ''
  }
})

// 加载Banner列表
const loadBanners = async () => {
  loading.value = true
  try {
    const params = tansParams(pagination.value)
    const response = await api.get(`/admin/banner/list?${params}`)
    const { code, data, total } = response.data

    if (code === 200) {
      banners.value = data.map((banner: Banner) => ({
        ...banner,
        translationsI18n: banner.translations ? JSON.parse(banner.translations) : {},
        descriptionsI18n: banner.descriptions ? JSON.parse(banner.descriptions) : {}
      }))
      pagination.value.rowsNumber = total
    } else {
      banners.value = []
      throw new Error('加载Banner列表失败')
    }
  } catch (error) {
    console.error('加载Banner列表失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '加载Banner列表失败'
    })
  } finally {
    loading.value = false
  }
}

// 处理分页和排序
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  await loadBanners()
}

// 修改 showBannerDialog 函数
const showBannerDialog = (mode: 'add' | 'edit', banner?: Banner) => {
  dialogMode.value = mode
  if (mode === 'edit' && banner) {
    // 编辑模式：解析现有的 JSON 字符串
    const translationsObj = banner.translations ? JSON.parse(banner.translations) : {}
    const descriptionsObj = banner.descriptions ? JSON.parse(banner.descriptions) : {}

    formData.value = {
      ...banner,
      translationsI18n: {
        zh: banner.title || '', // 使用现有标题作为中文标题
        en: translationsObj.en || '',
        zhTw: translationsObj.zhTw || '',
        ja: translationsObj.ja || '',
        ko: translationsObj.ko || ''
      },
      descriptionsI18n: {
        zh: descriptionsObj.zh || '',
        en: descriptionsObj.en || '',
        zhTw: descriptionsObj.zhTw || '',
        ja: descriptionsObj.ja || '',
        ko: descriptionsObj.ko || ''
      }
    }
  } else {
    // 新增模式：使用初始值
    formData.value = initFormData()
  }
  showDialog.value = true
}

// 处理文件上传
const handleFileUpload = async (file: File) => {
  if (!file) return

  try {
    const form = new FormData()
    form.append('file', file)

    const response = await api.post('/common/uploadImage', form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const { code, data, msg } = response.data

    if (code === 200) {
      formData.value.imgUrl = data.sourceUrl
      $q.notify({
        type: 'positive',
        message: '上传成功'
      })
    } else {
      throw new Error(msg || '上传失败')
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '上传图片失败'
    })
  } finally {
    uploadFile.value = null
  }
}

// 修改提交表单函数
const handleSubmit = async () => {
  try {
    const url = dialogMode.value === 'add' ? '/admin/banner/add' : '/admin/banner/update'

    // 将国际化对象转换为 JSON 字符串
    const submitData = {
      ...formData.value,
      position: typeof formData.value.position === 'object'
        ? formData.value.position.value
        : formData.value.position,
      title: formData.value.translationsI18n.zh, // 使用中文标题作为主标题
      translations: JSON.stringify(formData.value.translationsI18n),
      descriptions: JSON.stringify(formData.value.descriptionsI18n)
    }

    const response = await api.post(url, submitData)

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: dialogMode.value === 'add' ? '创建成功' : '更新成功'
      })
      showDialog.value = false
      loadBanners()
    } else {
      throw new Error(msg || '保存失败')
    }
  } catch (error) {
    console.error('保存Banner失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  }
}

// 切换状态
const toggleStatus = async (banner: Banner) => {
  try {
    const response = await api.get(`/admin/banner/status`, {
      params: {
        bannerId: banner.bannerId,
        status: !banner.status
      }
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: banner.status ? '已禁用' : '已启用'
      })
      loadBanners()
    } else {
      throw new Error(msg || '操作失败')
    }
  } catch (error) {
    console.error('切换状态失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '操作失败'
    })
  }
}

// 确认删除
const confirmDelete = (banner: Banner) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除Banner "${banner.title}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/banner/del`, {
        params: { bannerId: banner.bannerId }
      })

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadBanners()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除Banner失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 预览图片
const previewImage = (url: string) => {
  if (!url) return
  previewUrl.value = getImageUrl(url)
  previewDialog.value = true
}

// 初始化
onMounted(() => {
  loadBanners()
})
</script>

<style lang="scss" scoped>
.banner-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .upload-section {
    .preview-image {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px;
      cursor: pointer; // 添加指针样式

      &:hover {
        border-color: var(--q-primary);
      }
    }
  }

  // 添加图片预览样式
  .q-img {
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .translations-section {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fafafa;

    .text-subtitle2 {
      color: #666;
      font-weight: 500;
    }
  }
}
</style>
