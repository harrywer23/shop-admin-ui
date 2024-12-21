<template>
  <div class="prop-management q-pa-md">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">规格参数管理</div>
        <q-space />
        <q-btn color="primary" icon="add" label="添加规格" @click="openPropDialog()" />
      </q-card-section>

      <q-card-section>
        <!-- 搜索栏 -->
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-12 col-sm-3">
            <q-input
              v-model="searchForm.propName"
              label="规格名称"
              dense
              outlined
              clearable
              @keyup.enter="loadProps"
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="searchForm.rule"
              :options="ruleOptions"
              label="规格类型"
              dense
              outlined
              clearable
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn color="primary" icon="search" label="搜索" @click="loadProps" />
            <q-btn flat color="grey" class="q-ml-sm" icon="refresh" label="重置" @click="resetSearch" />
          </div>
        </div>

        <!-- 规格列表 -->
        <q-table
          :rows="props"
          :columns="columns"
          row-key="propId"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 规格类型列 -->
          <template v-slot:body-cell-rule="props">
            <q-td :props="props">
              <q-chip
                :color="props.value === 1 ? 'primary' : 'teal'"
                text-color="white"
                size="sm"
              >
                {{ props.value === 1 ? '销售属性' : '参数属性' }}
              </q-chip>
            </q-td>
          </template>

          <!-- 规格值列 -->
          <template v-slot:body-cell-values="props">
            <q-td :props="props">
              <q-chip
                v-for="value in props.row.values"
                :key="value.valueId"
                size="sm"
                class="q-ma-xs"
                removable
                @remove="confirmDeleteValue(value)"
              >
                {{ value.propValue }}
              </q-chip>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="add"
                @click="openValueDialog(props.row)"
              >
                <q-tooltip>添加规格值</q-tooltip>
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
                  @click="openPropDialog(props.row)"
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

    <!-- 规格编辑对话框 -->
    <q-dialog v-model="showPropDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingProp.propId ? '编辑规格' : '添加规格' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveProp" class="q-gutter-md">
            <q-input
              v-model="editingProp.propName"
              label="规格名称"
              :rules="[val => !!val || '请输入规格名称']"
              outlined
            />

            <q-select
              v-model="editingProp.rule"
              :options="ruleOptions"
              label="规格类型"
              :rules="[val => !!val || '请选择规格类型']"
              outlined
              emit-value
              map-options
            />

            <div class="row justify-end q-mt-md">
              <q-btn label="取消" flat v-close-popup />
              <q-btn label="保存" type="submit" color="primary" class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 规格值编辑对话框 -->
    <q-dialog v-model="showValueDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">添加规格值</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePropValue" class="q-gutter-md">
            <q-input
              v-model="editingValue.propValue"
              label="规格值"
              :rules="[val => !!val || '请输入规格值']"
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

// 规格类型选项
const ruleOptions = [
  { label: '销售属性', value: 1 },
  { label: '参数属性', value: 2 }
]

// 表格列定义
const columns = [
  { name: 'propId', label: 'ID', field: 'propId', align: 'left' },
  { name: 'propName', label: '规格名称', field: 'propName', align: 'left' },
  { name: 'rule', label: '规格类型', field: 'rule', align: 'center' },
  { 
    name: 'values', 
    label: '规格值', 
    align: 'left',
    field: row => row.values?.map(v => v.propValue).join(', ') || ''
  },
  { name: 'actions', label: '操作', align: 'center' }
]

// 响应式数据
const loading = ref(false)
const props = ref([])
const showPropDialog = ref(false)
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
  propName: '',
  rule: null
})

// 编辑的规格数据
const editingProp = reactive({
  propId: '',
  propName: '',
  rule: null
})

// 编辑的规格值数据
const editingValue = reactive({
  propId: '',
  propValue: ''
})

// 加载规格列表
async function loadProps(pagination_props) {
  loading.value = true
  try {
    const requestParams = {
      page: pagination_props?.pagination?.page || pagination.value.page,
      limit: pagination_props?.pagination?.rowsPerPage || pagination.value.rowsPerPage,
      propName: searchForm.propName,
      rule: searchForm.rule
    }

    const response = await api.get('/sys/prop/page', { params: requestParams })
    if (response.data.code === 200) {
      props.value = response.data.data || []
      pagination.value.rowsNumber = parseInt(response.data.total)
      pagination.value.page = requestParams.page
      pagination.value.rowsPerPage = requestParams.limit
    }
  } catch (error) {
    console.error('加载规格列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载规格列表失败'
    })
  } finally {
    loading.value = false
  }
}

// 打开规格编辑对话框
function openPropDialog(prop = null) {
  if (prop) {
    editingProp.propId = prop.propId
    editingProp.propName = prop.propName
    editingProp.rule = prop.rule
  } else {
    editingProp.propId = ''
    editingProp.propName = ''
    editingProp.rule = null
  }
  showPropDialog.value = true
}

// 打开规格值编辑对话框
function openValueDialog(prop) {
  editingValue.propId = prop.propId
  editingValue.propValue = ''
  showValueDialog.value = true
}

// 保存规格
async function saveProp() {
  try {
    const url = editingProp.propId ? '/sys/prop/update' : '/sys/prop/save'
    const method = editingProp.propId ? 'put' : 'post'
    const response = await api[method](url, editingProp)
    
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '保存成功'
      })
      showPropDialog.value = false
      loadProps()
    }
  } catch (error) {
    console.error('保存规格失败:', error)
    $q.notify({
      type: 'negative',
      message: '保存失败'
    })
  }
}

// 保存规格值
async function savePropValue() {
  try {
    const response = await api.post('/sys/prop/value/save', editingValue)
    
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '保存成功'
      })
      showValueDialog.value = false
      loadProps()
    }
  } catch (error) {
    console.error('保存规格值失败:', error)
    $q.notify({
      type: 'negative',
      message: '保存失败'
    })
  }
}

// 确认删除规格
function confirmDelete(prop) {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除这个规格吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/sys/prop/delete/${prop.propId}`)
      
      if (response.data.code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadProps()
      }
    } catch (error) {
      console.error('删除规格失败:', error)
      $q.notify({
        type: 'negative',
        message: '删除失败'
      })
    }
  })
}

// 确认删除规格值
function confirmDeleteValue(value) {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除这个规格值吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/sys/prop/value/delete/${value.valueId}`)
      
      if (response.data.code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadProps()
      }
    } catch (error) {
      console.error('删除规格值失败:', error)
      $q.notify({
        type: 'negative',
        message: '删除失败'
      })
    }
  })
}

// 初始加载
onMounted(() => {
  loadProps()
})

// 添加分页请求处理
function onRequest(pagination_props) {
  loadProps(pagination_props)
}

// 添加重置搜索条件方法
function resetSearch() {
  searchForm.propName = ''
  searchForm.rule = null
  loadProps()
}
</script>

<style lang="scss" scoped>
.prop-management {
  .q-table {
    background: white;
  }
}
</style>
