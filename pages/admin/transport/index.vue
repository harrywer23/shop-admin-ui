<template>
  <div class="transport-page q-pa-md">
    <div class="header-section q-mb-md">
      <div class="row items-center justify-between">
        <div class="text-h6">运费模板管理</div>
        <q-btn
          color="primary"
          icon="add"
          label="新增模板"
          @click="openEditDialog()"
        />
      </div>
    </div>

    <q-table
      :rows="transportList"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <!-- 状态列自定义 -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.status === 1 ? 'positive' : 'grey'"
            text-color="white"
            dense
          >
            {{ props.row.status === 1 ? '启用' : '禁用' }}
          </q-chip>
        </q-td>
      </template>

      <!-- 计算方式列自定义 -->
      <template v-slot:body-cell-calcType="props">
        <q-td :props="props">
          {{ getCalcTypeLabel(props.row.calcType) }}
        </q-td>
      </template>

      <!-- 免运费方式列自定义 -->
      <template v-slot:body-cell-freeType="props">
        <q-td :props="props">
          {{ getFreeTypeLabel(props.row.freeType) }}
        </q-td>
      </template>

      <!-- 操作列自定义 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              color="info"
              icon="rule"
              size="sm"
              @click="viewRules(props.row)"
            >
              <q-tooltip>查看规则</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              size="sm"
              @click="openEditDialog(props.row)"
            >
              <q-tooltip>编辑</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>删除</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              :color="props.row.status === 1 ? 'negative' : 'positive'"
              :icon="props.row.status === 1 ? 'block' : 'check_circle'"
              size="sm"
              @click="toggleStatus(props.row)"
            >
              <q-tooltip>{{ props.row.status === 1 ? '禁用' : '启用' }}</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- 编辑对话框 -->
    <q-dialog v-model="editDialog.show" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editDialog.isEdit ? '编辑' : '新增' }}运费模板</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <q-input
              v-model="editDialog.form.name"
              label="模板名称"
              :rules="[val => !!val || '请输入模板名称']"
              outlined
              dense
            />
            <q-input
              v-model="editDialog.form.code"
              label="模板代码"
              :rules="[val => !!val || '请输入模板代码']"
              outlined
              dense
            />
            <q-input
              v-model="editDialog.form.description"
              label="描述"
              type="textarea"
              outlined
              dense
            />
            <q-select
              v-model="editDialog.form.calcType"
              :options="calcTypeOptions"
              label="计算方式"
              outlined
              dense
              emit-value
              map-options
            />
            <q-select
              v-model="editDialog.form.freeType"
              :options="freeTypeOptions"
              label="免运费方式"
              outlined
              dense
              emit-value
              map-options
            />
            <q-input
              v-if="editDialog.form.freeType === 1"
              v-model.number="editDialog.form.freeCondition"
              label="免运费条件"
              type="number"
              suffix="美元"
              outlined
              dense
            />
            <q-input
              v-model.number="editDialog.form.sortOrder"
              label="排序"
              type="number"
              outlined
              dense
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey" v-close-popup />
          <q-btn
            flat
            label="确定"
            color="primary"
            @click="handleSubmit"
            :loading="editDialog.loading"
          />
        </q-card-actions>
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
import { useRouter } from 'vue-router'
import { api } from '~/utils/axios'

const $q = useQuasar()
const router = useRouter()

// 表格列定义
const columns = [
  { name: 'name', label: '模板名称', field: 'name', align: 'left' as const },
  { name: 'code', label: '模板代码', field: 'code', align: 'left' as const },
  { name: 'description', label: '描述', field: 'description', align: 'left' as const },
  { name: 'calcType', label: '计算方式', field: 'calcType', align: 'center' as const },
  { name: 'freeType', label: '免运费方式', field: 'freeType', align: 'center' as const },
  {
    name: 'freeCondition',
    label: '免运费条件',
    field: 'freeCondition',
    align: 'right' as const,
    format: (val: number) => `${val} 美元`
  },
  { name: 'status', label: '状态', field: 'status', align: 'center' as const },
  {
    name: 'sortOrder',
    label: '排序',
    field: 'sortOrder',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'createdAt',
    label: '创建时间',
    field: 'createdAt',
    align: 'center' as const,
    sortable: true
  },
  { name: 'actions', label: '操作', align: 'center' as const }
]

// 计算方式选项
const calcTypeOptions = [
  { label: '按重量计算', value: 1 },
  { label: '按件数计算', value: 2 }
]

// 免运费方式选项
const freeTypeOptions = [
  { label: '订单满额免运费', value: 1 },
  { label: '无免运费', value: 0 }
]

// 获取计算方式标签
const getCalcTypeLabel = (type: number) => {
  return calcTypeOptions.find(option => option.value === type)?.label || '未知'
}

// 获取免运费方式标签
const getFreeTypeLabel = (type: number) => {
  return freeTypeOptions.find(option => option.value === type)?.label || '未知'
}

// 状态数据
const loading = ref(false)
const transportList = ref([])

// 编辑对话框状态
const editDialog = ref({
  show: false,
  isEdit: false,
  loading: false,
  form: {
    id: '',
    name: '',
    code: '',
    description: '',
    calcType: 1,
    freeType: 1,
    freeCondition: 0,
    sortOrder: 1,
    status: 1
  }
})

// 加载运费模板列表
const loadTransportList = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/transport/list')
    if (response.data.code === 200) {
      transportList.value = response.data.data
    }
  } catch (error) {
    console.error('加载运费模板失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载运费模板失败'
    })
  } finally {
    loading.value = false
  }
}

// 打开编辑对话框
const openEditDialog = (row?: any) => {
  editDialog.value.isEdit = !!row
  editDialog.value.form = row
    ? { ...row }
    : {
        id: '',
        name: '',
        code: '',
        description: '',
        calcType: 1,
        freeType: 1,
        freeCondition: 0,
        sortOrder: 1,
        status: 1
      }
  editDialog.value.show = true
}

// 提交表单
const handleSubmit = async () => {
  editDialog.value.loading = true
  try {
    const url = editDialog.value.isEdit
      ? `/admin/transport/update`
      : '/admin/transport/add'
    const response = await api.post(url, editDialog.value.form)

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: `${editDialog.value.isEdit ? '更新' : '添加'}成功`
      })
      editDialog.value.show = false
      loadTransportList()
    }
  } catch (error) {
    console.error('提交运费模板失败:', error)
    $q.notify({
      type: 'negative',
      message: `${editDialog.value.isEdit ? '更新' : '添加'}失败`
    })
  } finally {
    editDialog.value.loading = false
  }
}

// 确认删除
const confirmDelete = (row: any) => {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除该运费模板吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/transport/delete/${row.id}`)
      if (response.data.code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadTransportList()
      }
    } catch (error) {
      console.error('删除运费模板失败:', error)
      $q.notify({
        type: 'negative',
        message: '删除失败'
      })
    }
  })
}

// 切换状态
const toggleStatus = async (row: any) => {
  try {
    const response = await api.post(`/admin/transport/status/${row.id}`, {
      status: row.status === 1 ? 0 : 1
    })
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '状态更新成功'
      })
      loadTransportList()
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    $q.notify({
      type: 'negative',
      message: '状态更新失败'
    })
  }
}

// 查看运费规则
const viewRules = (row: any) => {
  router.push({
    path: '/admin/transport/rules',
    query: {
      id: row.id,
      name: row.name,
      code: row.code
    }
  })
}

// 初始化
onMounted(() => {
  loadTransportList()
})
</script>

<style lang="scss" scoped>
.transport-page {
  .q-table {
    background: white;
  }

  // 添加按钮样式
  .q-btn {
    margin: 0 4px;

    &:hover {
      opacity: 0.8;
    }
  }

  // 添加工具提示样式
  .q-tooltip {
    font-size: 12px;
  }
}
</style>
