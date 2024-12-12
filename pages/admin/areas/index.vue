<template>
  <div class="areas-management">
    <div class="page-header">
      <h1 class="text-h5">区域管理</h1>
      <q-btn
        color="primary"
        icon="add"
        label="新增区域"
        @click="showAreaDialog('add')"
      />
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 层级筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.level"
                :options="levelOptions"
                label="层级"
                dense
                outlined
                clearable
                emit-value
                map-options
                @update:model-value="onLevelChange"
              />
            </div>

            <!-- 父级区域筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.parentId"
                :options="parentOptions"
                label="父级区域"
                option-label="name"
                option-value="id"
                dense
                outlined
                clearable
                :disable="!filters.level || filters.level === 1"
              />
            </div>

            <!-- 状态筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                label="状态"
                dense
                outlined
                clearable
                emit-value
                map-options
              />
            </div>

            <!-- 搜索按钮 -->
            <div class="col-12 col-sm-3">
              <q-btn
                color="primary"
                icon="search"
                label="搜索"
                @click="loadAreas"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 区域列表 -->
    <q-table
      :rows="areas"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- 层级列 -->
      <template v-slot:body-cell-level="props">
        <q-td :props="props">
          <q-chip
            :color="getLevelColor(props.value)"
            text-color="white"
            dense
          >
            {{ getLevelLabel(props.value) }}
          </q-chip>
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
              @click="showAreaDialog('edit', props.row)"
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

    <!-- 区域编辑对话框 -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ dialogMode === 'add' ? '新增区域' : '编辑区域' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <!-- 层级选择 -->
            <q-select
              v-model="formData.level"
              :options="levelOptions"
              label="层级"
              :rules="[val => !!val || '请选择层级']"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="onFormLevelChange"
            />

            <!-- 父级区域选择 -->
            <q-select
              v-if="formData.level !== 1"
              v-model="formData.parentId"
              :options="formParentOptions"
              label="父级区域"
              option-label="name"
              option-value="id"
              :rules="[val => !!val || '请选择父级区域']"
              outlined
              dense
            />

            <!-- 区域名称国际化输入 -->
            <div class="translations-section">
              <div class="text-subtitle2 q-mb-sm">区域名称</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.internationalized.zh"
                    label="中文名称"
                    :rules="[val => !!val || '请输入中文名称']"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.internationalized.en"
                    label="English Name"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.internationalized.zhTw"
                    label="繁體中文名稱"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.internationalized.ja"
                    label="日本語名称"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.internationalized.ko"
                    label="한국어 이름"
                    outlined
                    dense
                  />
                </div>
              </div>
            </div>

            <!-- 区域代码 -->
            <q-input
              v-model="formData.code"
              label="区域代码"
              :rules="[val => !!val || '请输入区域代码']"
              outlined
              dense
            />

            <!-- 邮政编码 -->
            <q-input
              v-model="formData.postCode"
              label="邮政编码"
              outlined
              dense
            />

            <!-- 状态 -->
            <q-toggle
              v-model="formData.status"
              :false-value="0"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
const $q = useQuasar()

// 区域接口定义
interface Area {
  id: number | null
  parentId: number | null
  name: string
  code: string
  level: number
  status: boolean
  postCode: string | null
  internationalized: {
    zh: string
    en: string
    zhTw: string
    ja: string
    ko: string
  }
}

// 层级选项
const levelOptions = [
  { label: '国家', value: 1 },
  { label: '省份', value: 2 },
  { label: '城市', value: 3 }
]

// 状态选项
const statusOptions = [
  { label: '全部', value: null },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

// 表格列定义
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'name', label: '区域名称', field: 'name', sortable: true },
  { name: 'code', label: '区域代码', field: 'code' },
  { name: 'level', label: '层级', field: 'level' },
  { name: 'parentId', label: '父级ID', field: 'parentId' },
  { name: 'postCode', label: '邮政编码', field: 'postCode' },
  { name: 'status', label: '状态', field: 'status' },
  { name: 'actions', label: '操作', field: 'actions' }
]

// 状态变量
const areas = ref<Area[]>([])
const loading = ref(false)
const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formData = ref<Area>({
  id: null,
  parentId: null,
  name: '',
  code: '',
  level: 1,
  status: true,
  postCode: null,
  internationalized: {
    zh: '',
    en: '',
    zhTw: '',
    ja: '',
    ko: ''
  }
})

// 筛选条件
const filters = ref({
  level: null as number | null,
  parentId: null as number | null,
  status: null as number | null
})

// 父级选项
const parentOptions = ref<Area[]>([])
const formParentOptions = ref<Area[]>([])

// 分页设置
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 获取层级标签和颜色
const getLevelLabel = (level: number) => {
  const option = levelOptions.find(opt => opt.value === level)
  return option ? option.label : '未知'
}

const getLevelColor = (level: number) => {
  switch (level) {
    case 1: return 'primary'
    case 2: return 'secondary'
    case 3: return 'accent'
    default: return 'grey'
  }
}

// 加载区域列表
const loadAreas = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sort: pagination.value.sortBy,
      order: pagination.value.descending ? 'desc' : 'asc',
      ...filters.value
    }

    const response = await api.get('/admin/areas/list', { params })
    const { code, data, total } = response.data

    if (code === 200) {
      areas.value = data.map((area: Area) => ({
        ...area,
        internationalized: area.internationalized ? JSON.parse(area.internationalized) : {
          zh: area.name,
          en: '',
          zhTw: '',
          ja: '',
          ko: ''
        }
      }))
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载区域列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载区域列表失败'
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
  await loadAreas()
}

// 层级变更处理
const onLevelChange = async (level: number) => {
  filters.value.parentId = null
  if (level > 1) {
    // 加载父级选项
    try {
      const response = await api.get('/admin/areas/list', {
        params: { level: level - 1, status: 1 }
      })
      if (response.data.code === 200) {
        parentOptions.value = response.data.data
      }
    } catch (error) {
      console.error('加载父级区域失败:', error)
    }
  }
}

// 表单层级变更处理
const onFormLevelChange = async (level: number) => {
  formData.value.parentId = null
  if (level > 1) {
    try {
      const response = await api.get('/admin/areas/list', {
        params: { level: level - 1, status: 1 }
      })
      if (response.data.code === 200) {
        formParentOptions.value = response.data.data
      }
    } catch (error) {
      console.error('加载父级区域失败:', error)
    }
  }
}

// 显示区域编辑对话框
const showAreaDialog = (mode: 'add' | 'edit', area?: Area) => {
  dialogMode.value = mode
  if (mode === 'edit' && area) {
    formData.value = {
      ...area,
      internationalized: area.internationalized || {
        zh: area.name,
        en: '',
        zhTw: '',
        ja: '',
        ko: ''
      }
    }
    // 加载父级选项
    if (area.level > 1) {
      onFormLevelChange(area.level)
    }
  } else {
    formData.value = {
      id: null,
      parentId: null,
      name: '',
      code: '',
      level: 1,
      status: true,
      postCode: null,
      internationalized: {
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
    const url = dialogMode.value === 'add' ? '/admin/areas/add' : '/admin/areas/update'

    const submitData = {
      ...formData.value,
      name: formData.value.internationalized.zh,
      internationalized: JSON.stringify(formData.value.internationalized)
    }

    const response = await api.post(url, submitData)

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: dialogMode.value === 'add' ? '创建成功' : '更新成功'
      })
      showDialog.value = false
      loadAreas()
    } else {
      throw new Error(msg || '保存失败')
    }
  } catch (error) {
    console.error('保存区域失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  }
}

// 切换状态
const toggleStatus = async (area: Area) => {
  try {
    const response = await api.post('/admin/areas/status', {
      id: area.id,
      status: !area.status
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: area.status ? '已禁用' : '已启用'
      })
      loadAreas()
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
const confirmDelete = (area: Area) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除区域 "${area.name}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/areas/${area.id}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadAreas()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除区域失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 初始化
onMounted(() => {
  loadAreas()
})
</script>

<style lang="scss" scoped>
.areas-management {
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
