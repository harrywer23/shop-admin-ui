<template>
  <div class="work-order-container">
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">工单管理</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- 状态筛选 -->
          <div class="col-12 col-sm-3">
            <q-select
              v-model="queryParams.status"
              :options="statusOptions"
              label="工单状态"
              clearable
              outlined
              dense
              emit-value
              map-options
            />
          </div>

          <!-- 类型筛选 -->
          <div class="col-12 col-sm-3">
            <q-select
              v-model="queryParams.workType"
              :options="typeOptions"
              label="工单类型"
              clearable
              outlined
              dense
              emit-value
              map-options
            />
          </div>

          <!-- 时间范围 -->
          <div class="col-12 col-sm-4">
            <q-input
              v-model="dateRange"
              outlined
              dense
              label="提交时间"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="dateRange"
                      range
                      mask="YYYY-MM-DD HH:mm:ss"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="关闭" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!-- 操作按钮 -->
          <div class="col-12 col-sm-2">
            <div class="row q-gutter-sm">
              <q-btn color="primary" icon="search" label="查询" @click="handleQuery" />
              <q-btn outline color="primary" icon="refresh" label="重置" @click="resetQuery" />
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- 工单列表 -->
      <q-card-section>
        <q-table
          :rows="workOrders"
          :columns="columns"
          :pagination.sync="pagination"
          :loading="loading"
          row-key="id"
          @request="onRequest"
          binary-state-sort
        >
          <!-- 状态列 -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.row.status)"
                text-color="white"
                size="sm"
              >
                {{ getStatusText(props.row.status) }}
              </q-chip>
            </q-td>
          </template>

          <!-- 图片列 -->
          <template v-slot:body-cell-imgUrls="props">
            <q-td :props="props">
              <template v-if="!props.row.imgUrls">-</template>
              <template v-else>
                <q-btn
                  flat
                  dense
                  :label="`${getUrlsCount(props.row.imgUrls)}张图片`"
                  :icon-right="expandedImageRecord === props.row.id ? 'expand_less' : 'expand_more'"
                  @click="toggleImageExpand(props.row.id)"
                />
                
                <q-slide-transition>
                  <div v-show="expandedImageRecord === props.row.id" class="q-mt-sm">
                    <div class="row q-col-gutter-sm">
                      <div
                        v-for="(url, index) in props.row.imgUrls.split(',')"
                        :key="index"
                        class="col-auto"
                      >
                        <q-img
                          :src="getImageUrl(url)"
                          :ratio="1"
                          width="80px"
                          class="rounded-borders cursor-pointer"
                          @click="previewImage(url)"
                        />
                      </div>
                    </div>
                  </div>
                </q-slide-transition>
              </template>
            </q-td>
          </template>

          <!-- 操作列 -->
          <template v-slot:body-cell-action="props">
            <q-td :props="props">
              <div class="row q-gutter-xs">
                <q-btn
                  v-if="props.row.status === 1"
                  color="primary"
                  label="开始处理"
                  size="sm"
                  @click="startProcess(props.row)"
                />
                <q-btn
                  v-if="props.row.status === 2"
                  color="positive"
                  label="完成处理"
                  size="sm"
                  @click="showReplyModal(props.row)"
                />
                <q-btn
                  color="negative"
                  label="拒绝"
                  size="sm"
                  @click="showRejectModal(props.row)"
                  :disable="props.row.status === 2 || props.row.status === 3 || props.row.status === 4"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 回复对话框 -->
    <q-dialog v-model="replyModalVisible" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">处理工单</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="replyForm.reply"
            type="textarea"
            label="回复内容"
            :rules="[val => !!val.trim() || '请输入回复内容']"
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确定" color="primary" @click="handleReply" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 拒绝对话框 -->
    <q-dialog v-model="rejectModalVisible" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">拒绝工单</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="rejectForm.reply"
            type="textarea"
            label="拒绝理由"
            :rules="[val => !!val.trim() || '请输入拒绝理由']"
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确定" color="negative" @click="handleReject" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 图片预览 -->
    <q-dialog v-model="previewDialog">
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center">
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-none">
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

interface WorkOrder {
  id: number;
  title: string;
  explanation: string;
  imgUrls?: string;
  status: number;
  createTime: string;
  updateTime: string;
  userName: string;
  reply?: string;
  workType: number;
}

interface ReplyForm {
  reply: string;
  workOrderId: number | null;
}

interface RejectForm {
  id: number | null;
  reply: string;
}

interface QueryParams {
  status?: number;
  workType?: number;
  startTime?: string;
  endTime?: string;
  pageNum: number;
  pageSize: number;
}

const columns = [
  { name: 'id', label: '工单编号', field: 'id', sortable: true },
  { name: 'title', label: '标题', field: 'title', sortable: true },
  { name: 'explanation', label: '说明', field: 'explanation' },
  { name: 'imgUrls', label: '图片', field: 'imgUrls' },
  { name: 'status', label: '状态', field: 'status', sortable: true },
  { name: 'workType', label: '工单类型', field: 'workType', sortable: true,
    format: (val: number) => typeOptions.find(opt => opt.value === val)?.label || '未知类型'
  },
  { name: 'userName', label: '用户名', field: 'userName', sortable: true },
  { name: 'createTime', label: '提交时间', field: 'createTime', sortable: true },
  { name: 'reply', label: '回复内容', field: 'reply' },
  { name: 'updateTime', label: '处理时间', field: 'updateTime', sortable: true },
  { name: 'action', label: '操作', field: 'action' }
]

const workOrders = ref<WorkOrder[]>([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

const replyModalVisible = ref(false)
const replyForm = ref<ReplyForm>({
  reply: '',
  workOrderId: null,
})

const rejectModalVisible = ref(false)
const rejectForm = ref<RejectForm>({
  id: null,
  reply: '',
})

const queryParams = ref<QueryParams>({
  pageNum: 1,
  pageSize: 10,
})


const expandedImageRecord = ref<number | null>(null)

const getStatusColor = (status: number): string => {
  const colors: Record<number, string> = {
    1: 'orange',
    2: 'processing',
    3: 'green',
    4: 'red',
  }
  return colors[status] || ''
}

const getStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    1: '待处理',
    2: '处理中',
    3: '处理完成',
    4: '已拒绝',
  }
  return statusMap[status] || ''
}

const fetchWorkOrders = async () => {
  try {
    const params = {
      ...queryParams.value,
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
    }

    const response = await api.get('/sys/workOrder/list', {
      params,
      headers: {
        'Authorization': `Bearer ${useCookie('token').value}`
      }
    })
    const data = await response.data
    if (data.code === 200) {
      workOrders.value = data.data
      pagination.value.total = data.total
    } else {
      message.error(data.msg || '获取工单列表失败')
    }
  } catch (error) {
    message.error('获取工单列表失败')
  }
}

const handleQuery = () => {
  pagination.value.current = 1
  fetchWorkOrders()
}

const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
  }
  dateRange.value = null
  pagination.value.current = 1
  fetchWorkOrders()
}

const onDateRangeChange = (_: [Dayjs, Dayjs] | null, dateStrings: [string, string]) => {
  if (dateStrings[0] && dateStrings[1]) {
    queryParams.value.startTime = dateStrings[0]
    queryParams.value.endTime = dateStrings[1]
  } else {
    queryParams.value.startTime = undefined
    queryParams.value.endTime = undefined
  }
}

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value.current = pag.current || 1
  pagination.value.pageSize = pag.pageSize || 10
  queryParams.value.pageNum = pagination.value.current
  queryParams.value.pageSize = pagination.value.pageSize
  fetchWorkOrders()
}

const showReplyModal = (record: WorkOrder) => {
  replyForm.value.workOrderId = record.id
  replyForm.value.reply = ''
  replyModalVisible.value = true
}

const closeReplyModal = () => {
  replyModalVisible.value = false
  replyForm.value = {
    reply: '',
    workOrderId: null,
  }
}

const handleReply = async () => {
  if (!replyForm.value.reply.trim()) {
    message.warning('请输入回复内容')
    return
  }

  try {
    await api.post(`/sys/workOrder/reply`, {
      id: replyForm.value.workOrderId,
      reply: replyForm.value.reply,
      status: 3,
    })
    message.success('处理完成')
    closeReplyModal()
    fetchWorkOrders()
  } catch (error) {
    message.error('处理失败')
  }
}

const showRejectModal = (record: WorkOrder) => {
  rejectForm.value.id = record.id
  rejectForm.value.reply = ''
  rejectModalVisible.value = true
}

const closeRejectModal = () => {
  rejectModalVisible.value = false
  rejectForm.value = {
    id: null,
    reply: '',
  }
}

const handleReject = async () => {
  if (!rejectForm.value.reply.trim()) {
    message.warning('请输入拒绝理由')
    return
  }

  try {
    await api.post(`/sys/workOrder/reject`, {
      id: rejectForm.value.id,
      reply: rejectForm.value.reply,
      status: 4,
    })
    message.success('已拒绝该工单')
    closeRejectModal()
    fetchWorkOrders()
  } catch (error) {
    message.error('操作失败')
  }
}

const startProcess = async (record: WorkOrder) => {
  try {
    await api.get(`/sys/workOrder/start?id=${record.id}`)
    message.success('已开始处理')
    fetchWorkOrders()
  } catch (error) {
    message.error('操作失败')
  }
}

const getUrlsCount = (imgUrls: string) => {
  if (!imgUrls) return 0
  return imgUrls.split(',').filter(url => url).length
}

const toggleImageExpand = (id: number) => {
  expandedImageRecord.value = expandedImageRecord.value === id ? null : id
}

onMounted(() => {
  fetchWorkOrders()
})
</script>

<style lang="scss" scoped>
.work-order-container {
  padding: 20px;

  .q-table {
    background: white;
  }

  .image-preview {
    max-width: 80px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>
