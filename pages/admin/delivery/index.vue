<template>
  <div class="delivery-management">
    <div class="page-header">
      <h1 class="text-h5">物流公司管理</h1>
      <q-btn
        color="primary"
        icon="add"
        label="新增物流公司"
        @click="showDeliveryDialog('add')"
      />
    </div>

    <!-- 物流公司列表 -->
    <q-table
      :rows="deliveries"
      :columns="columns"
      row-key="dvyId"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- 操作列 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              @click="showDeliveryDialog('edit', props.row)"
            >
              <q-tooltip>编辑</q-tooltip>
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

    <!-- 物流公司编辑对话框 -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ dialogMode === 'add' ? '新增物流公司' : '编辑物流公司' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <!-- 物流公司名称 -->
            <q-input
              v-model="formData.dvyName"
              label="物流公司名称"
              :rules="[val => !!val || '请输入物流公司名称']"
              outlined
              dense
            />

            <!-- 公司主页 -->
            <q-input
              v-model="formData.companyHomeUrl"
              label="公司主页"
              outlined
              dense
            />

            <!-- 物流查询接口 -->
            <q-input
              v-model="formData.queryUrl"
              label="物流查询接口"
              :rules="[val => !!val || '请输入物流查询接口']"
              outlined
              dense
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

// 物流公司接口定义
interface Delivery {
  dvyId: number | null
  dvyName: string
  companyHomeUrl: string | null
  queryUrl: string
  recTime: string
  modifyTime: string
}

// 表格列定义
const columns = [
  { name: 'dvyId', label: 'ID', field: 'dvyId', sortable: true },
  { name: 'dvyName', label: '物流公司名称', field: 'dvyName', sortable: true },
  { name: 'companyHomeUrl', label: '公司主页', field: 'companyHomeUrl' },
  { name: 'queryUrl', label: '查询接口', field: 'queryUrl' },
  { name: 'recTime', label: '创建时间', field: 'recTime', sortable: true },
  { name: 'modifyTime', label: '修改时间', field: 'modifyTime', sortable: true },
  { name: 'actions', label: '操作', field: 'actions' }
]

// 状态变量
const deliveries = ref<Delivery[]>([])
const loading = ref(false)
const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formData = ref<Delivery>({
  dvyId: null,
  dvyName: '',
  companyHomeUrl: null,
  queryUrl: '',
  recTime: '',
  modifyTime: ''
})
const pagination = ref({
  sortBy: 'recTime',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 加载物流公司列表
const loadDeliveries = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sort: pagination.value.sortBy,
      order: pagination.value.descending ? 'desc' : 'asc'
    }

    const response = await api.get('/admin/delivery/list', { params })
    const { code, data, total } = response.data

    if (code === 200) {
      deliveries.value = data
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载物流公司列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载物流公司列表失败'
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
  await loadDeliveries()
}

// 显示物流公司编辑对话框
const showDeliveryDialog = (mode: 'add' | 'edit', delivery?: Delivery) => {
  dialogMode.value = mode
  if (mode === 'edit' && delivery) {
    formData.value = { ...delivery }
  } else {
    formData.value = {
      dvyId: null,
      dvyName: '',
      companyHomeUrl: null,
      queryUrl: '',
      recTime: '',
      modifyTime: ''
    }
  }
  showDialog.value = true
}

// 提交表单
const handleSubmit = async () => {
  try {
    const url = dialogMode.value === 'add' ? '/admin/delivery/add' : '/admin/delivery/update'
    const response = await api.post(url, formData.value)

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: dialogMode.value === 'add' ? '创建成功' : '更新成功'
      })
      showDialog.value = false
      loadDeliveries()
    } else {
      throw new Error(msg || '保存失败')
    }
  } catch (error) {
    console.error('保存物流公司失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  }
}

// 确认删除
const confirmDelete = (delivery: Delivery) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除物流公司 "${delivery.dvyName}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/delivery/delete/${delivery.dvyId}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadDeliveries()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除物流公司失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 初始化
onMounted(() => {
  loadDeliveries()
})
</script>

<style lang="scss" scoped>
.delivery-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
}
</style>
