<template>
  <div class="param-management q-pa-md">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">商品参数管理</div>
        <q-space />
        <q-btn color="primary" icon="add" label="添加参数" @click="openParamDialog()" />
      </q-card-section>

      <q-card-section>
        <!-- 搜索栏 -->
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-12 col-sm-3">
            <q-input
              v-model="searchForm.paramKey"
              label="参数名称"
              dense
              outlined
              clearable
              @keyup.enter="loadParams"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn color="primary" icon="search" label="搜索" @click="loadParams" />
            <q-btn flat color="grey" class="q-ml-sm" icon="refresh" label="重置" @click="resetSearch" />
          </div>
        </div>

        <!-- 参数列表 -->
        <q-table
          :rows="params"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 参数值列 -->
          <template v-slot:body-cell-values="props">
            <q-td :props="props">
              <q-chip
                v-for="value in props.row.values"
                :key="value.id"
                size="sm"
                class="q-ma-xs"
                removable
                @remove="confirmDeleteValue(value)"
              >
                {{ value.paramValue }}
              </q-chip>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="add"
                @click="openValueDialog(props.row)"
              >
                <q-tooltip>添加参数值</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- 操作列 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn-group flat>
                <q-btn
                  flat
                  color="primary"
                  icon="edit"
                  @click="openParamDialog(props.row)"
                >
                  <q-tooltip>编辑</q-tooltip>
                </q-btn>
                <q-btn
                  flat
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
      </q-card-section>
    </q-card>

    <!-- 参数编辑对话框 -->
    <q-dialog v-model="showParamDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingParam.id ? '编辑参数' : '添加参数' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveParam" class="q-gutter-md">
            <q-input
              v-model="editingParam.paramKey"
              label="参数名称"
              :rules="[val => !!val || '请输入参数名称']"
              outlined
            />

            <div class="row justify-end q-mt-md">
              <q-btn label="取消" flat v-close-popup />
              <q-btn label="保存" type="submit" color="primary" class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 参数值编辑对话框 -->
    <q-dialog v-model="showValueDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">添加参数值</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveParamValue" class="q-gutter-md">
            <q-input
              v-model="editingValue.paramValue"
              label="参数值"
              :rules="[val => !!val || '请输入参数值']"
              outlined
            />

            <div class="row justify-end q-mt-md">
              <q-btn label="取消" flat v-close-popup />
              <q-btn label="保存" type="submit" color="primary" class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'

const $q = useQuasar()

// 表格列定义
const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'paramKey', label: '��数名称', field: 'paramKey', align: 'left' },
  { 
    name: 'values', 
    label: '参数值', 
    field: 'values',
    align: 'left',
    format: (val) => val?.length ? val.map(v => v.paramValue).join(', ') : '无'
  },
  { 
    name: 'createTime', 
    label: '创建时间', 
    field: 'createTime', 
    align: 'center',
    format: (val) => val || '-'
  },
  { 
    name: 'updateTime', 
    label: '更新时间', 
    field: 'updateTime', 
    align: 'center',
    format: (val) => val || '-'
  },
  { name: 'actions', label: '操作', align: 'center' }
]

// 响应式数据
const loading = ref(false)
const params = ref([])
const showParamDialog = ref(false)
const showValueDialog = ref(false)
const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 搜索表单
const searchForm = reactive({
  paramKey: ''
})

// 编辑的参数数据
const editingParam = reactive({
  id: '',
  paramKey: ''
})

// 编辑的参数值数据
const editingValue = reactive({
  paramId: '',
  paramValue: ''
})

// 加载参数列表
async function loadParams(props) {
  loading.value = true
  try {
    const requestParams = {
      page: props?.pagination?.page || pagination.value.page,
      limit: props?.pagination?.rowsPerPage || pagination.value.rowsPerPage,
      paramKey: searchForm.paramKey
    }

    const response = await api.get('/sys/param/page', { params: requestParams })
    const data = await response.data;
    if (data.code === 200) {
      params.value = data.data
      pagination.value.rowsNumber = parseInt(data.total)
      pagination.value.page = requestParams.page
      pagination.value.rowsPerPage = requestParams.limit
      
      // 调试日志
      console.log('Loaded params:', params.value)
      console.log('Pagination:', pagination.value)
    }
  } catch (error) {
    console.error('加载参数列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载参数列表失败'
    })
  } finally {
    loading.value = false
  }
}

// 表格分页请求
function onRequest(props) {
  const { page, rowsPerPage } = props.pagination
  loadParams({ pagination: { page, rowsPerPage } })
}

// 重置搜索
function resetSearch() {
  searchForm.paramKey = ''
  loadParams()
}

// 打开参数编辑对话框
function openParamDialog(param) {
  if (param) {
    Object.assign(editingParam, param)
  } else {
    Object.assign(editingParam, {
      id: '',
      paramKey: ''
    })
  }
  showParamDialog.value = true
}

// 打开参数值编辑对话框
function openValueDialog(param) {
  editingValue.paramId = param.id
  editingValue.paramValue = ''
  showValueDialog.value = true
}

// 保存参数
async function saveParam() {
  try {
    const url = editingParam.id
      ? `/sys/param/update`
      : `/sys/param/save`

    const response = await api[editingParam.id ? 'put' : 'post'](url, editingParam)

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: `${editingParam.id ? '更新' : '添加'}参数成功`
      })
      showParamDialog.value = false
      loadParams()
    }
  } catch (error) {
    console.error('保存参数失败:', error)
    $q.notify({
      type: 'negative',
      message: '保存参数失败'
    })
  }
}

// 保存参数值
async function saveParamValue() {
  try {
    const response = await api.post('/sys/param/value/save', editingValue)

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '添加参数值成功'
      })
      showValueDialog.value = false
      loadParams()
    }
  } catch (error) {
    console.error('保存参数值失败:', error)
    $q.notify({
      type: 'negative',
      message: '保存参数值失败'
    })
  }
}

// 确认删除
function confirmDelete(param) {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除该参数吗？相关的参数值也会被删除。',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/sys/param/delete/${param.id}`)
      if (response.data.code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除参数成功'
        })
        loadParams()
      }
    } catch (error) {
      console.error('删除参数失败:', error)
      $q.notify({
        type: 'negative',
        message: '删除参数失败'
      })
    }
  })
}

// 确认删除参数值
function confirmDeleteValue(value) {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除该参数值吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/sys/param/value/delete/${value.id}`)
      if (response.data.code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除参数值成功'
        })
        loadParams()
      }
    } catch (error) {
      console.error('删除参数值失败:', error)
      $q.notify({
        type: 'negative',
        message: '删除参数值失败'
      })
    }
  })
}

// 初始加载
onMounted(() => {
  loadParams()
})
</script>

<style lang="scss" scoped>
.param-management {
  .q-table {
    background: white;
  }
}
</style>
