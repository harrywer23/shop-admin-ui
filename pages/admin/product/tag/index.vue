<template>
  <div class="tag-management">
    <div class="page-header">
      <h1 class="text-h5">商品标签管理</h1>
      <q-btn
        color="primary"
        icon="add"
        label="新增标签"
        @click="showTagDialog('add')"
      />
    </div>

    <!-- 标签列表 -->
    <q-table
      :rows="tags"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
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

      <!-- 默认类型列 -->
      <template v-slot:body-cell-isDefault="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.isDefault ? 'primary' : 'grey'"
            text-color="white"
            dense
          >
            {{ props.row.isDefault ? '系统默认' : '自定义' }}
          </q-chip>
        </q-td>
      </template>

      <!-- 列表样式列 -->
      <template v-slot:body-cell-style="props">
        <q-td :props="props">
          {{ getStyleLabel(props.row.style) }}
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
              @click="showTagDialog('edit', props.row)"
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
              v-if="!props.row.isDefault"
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

    <!-- 标签编辑对话框 -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ dialogMode === 'add' ? '新增标签' : '编辑标签' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <!-- 标题国际化输入 -->
            <div class="translations-section">
              <div class="text-subtitle2 q-mb-sm">标签名称</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.translationsI18n.zh"
                    label="中文名称"
                    :rules="[val => !!val || '请输入中文名称']"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.translationsI18n.en"
                    label="English Name"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.translationsI18n.zhTw"
                    label="繁體中文名稱"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.translationsI18n.ja"
                    label="日本語名称"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.translationsI18n.ko"
                    label="한국어 이름"
                    outlined
                    dense
                  />
                </div>
              </div>
            </div>

            <!-- 列表样式 -->
            <q-select
              v-model="formData.style"
              :options="styleOptions"
              label="列表样式"
              :rules="[val => val !== null || '请选择列表样式']"
              outlined
              dense
              emit-value
              map-options
            />

            <!-- 排序 -->
            <q-input
              v-model.number="formData.seq"
              type="number"
              label="排序"
              outlined
              dense
            />

            <!-- 状态 -->
            <q-toggle
              v-model="formData.status"
              label="启用"
              :false-value="0"
              :true-value="1"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'

const $q = useQuasar()

// 标签接口定义
interface Translations {
  zh: string
  en: string
  zhTw: string
  ja: string
  ko: string
}

interface ProdTag {
  id: number | null
  title: string
  shopId: number | null
  status: boolean
  isDefault: boolean
  prodCount: number
  style: number
  seq: number
  createTime: string
  updateTime: string
  deleteTime: string | null
  translations: string
  translationsI18n: Translations
}

// 列表样式选项
const styleOptions = [
  { label: '一列一个', value: 0 },
  { label: '一列两个', value: 1 },
  { label: '一列三个', value: 2 }
]

// 获取样式标签
const getStyleLabel = (style: number) => {
  const option = styleOptions.find(opt => opt.value === style)
  return option ? option.label : '未知'
}

// 表格列定义
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'title', label: '标签名称', field: 'title', sortable: true },
  { name: 'prodCount', label: '商品数量', field: 'prodCount', sortable: true },
  { name: 'style', label: '列表样式', field: 'style' },
  { name: 'seq', label: '排序', field: 'seq', sortable: true },
  { name: 'status', label: '状态', field: 'status' },
  { name: 'isDefault', label: '类型', field: 'isDefault' },
  { name: 'createTime', label: '创建时间', field: 'createTime', sortable: true },
  { name: 'actions', label: '操作', field: 'actions' }
]

// 状态变量
const tags = ref<ProdTag[]>([])
const loading = ref(false)
const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formData = ref<ProdTag>({
  id: null,
  title: '',
  shopId: null,
  status: true,
  isDefault: false,
  prodCount: 0,
  style: 0,
  seq: 0,
  createTime: '',
  updateTime: '',
  deleteTime: null,
  translations: '{}',
  translationsI18n: {
    zh: '',
    en: '',
    zhTw: '',
    ja: '',
    ko: ''
  }
})
const pagination = ref({
  sortBy: 'seq',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 加载标签列表
const loadTags = async () => {
  loading.value = true
  try {
    const response = await api.get('/sys/prod/tag/list', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sort: pagination.value.sortBy,
        order: pagination.value.descending ? 'desc' : 'asc'
      }
    })
    const { code, data, total } = response.data

    if (code === 200) {
      tags.value = data.map((tag: ProdTag) => ({
        ...tag,
        translationsI18n: tag.translations ? JSON.parse(tag.translations) : {}
      }))
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载标签列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载标签列表失败'
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
  await loadTags()
}

// 显示标签编辑对话框
const showTagDialog = (mode: 'add' | 'edit', tag?: ProdTag) => {
  dialogMode.value = mode
  if (mode === 'edit' && tag) {
    formData.value = {
      ...tag,
      translationsI18n: tag.translations ? JSON.parse(tag.translations) : {
        zh: tag.title,
        en: '',
        zhTw: '',
        ja: '',
        ko: ''
      }
    }
  } else {
    formData.value = {
      id: null,
      title: '',
      shopId: null,
      status: true,
      isDefault: false,
      prodCount: 0,
      style: 0,
      seq: 0,
      createTime: '',
      updateTime: '',
      deleteTime: null,
      translations: '{}',
      translationsI18n: {
        zh: '',
        en: '',
        zhTw: '',
        ja: '',
        ko: ''
      }
    }
  }
  showDialog.value = true
}

// 提交表单
const handleSubmit = async () => {
  try {
    const url = dialogMode.value === 'add' ? '/sys/prod/tag/add' : '/sys/prod/tag/update'

    const submitData = {
      ...formData.value,
      title: formData.value.translationsI18n.zh,
      translations: JSON.stringify(formData.value.translationsI18n)
    }

    const response = await api.post(url, submitData)

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: dialogMode.value === 'add' ? '创建成功' : '更新成功'
      })
      showDialog.value = false
      loadTags()
    } else {
      throw new Error(msg || '保存失败')
    }
  } catch (error) {
    console.error('保存标签失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  }
}

// 切换状态
const toggleStatus = async (tag: ProdTag) => {
  try {
    const response = await api.post('/sys/prod/tag/status', {
      id: tag.id,
      status: !tag.status
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: tag.status ? '已禁用' : '已启用'
      })
      loadTags()
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
const confirmDelete = (tag: ProdTag) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除标签 "${tag.title}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/sys/prod/tag/delete/${tag.id}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadTags()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除标签失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 初始化
onMounted(() => {
  loadTags()
})
</script>

<style lang="scss" scoped>
.tag-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
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
