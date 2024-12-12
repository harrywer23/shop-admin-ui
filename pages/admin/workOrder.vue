<template>
  <div class="work-order-container">
    <a-card title="工单管理">
      <a-form layout="inline" :model="queryParams" class="query-form">
        <a-form-item label="工单状态">
          <a-select
            v-model:value="queryParams.status"
            style="width: 120px"
            allowClear
            placeholder="请选择状态"
          >
            <a-select-option :value="1">待处理</a-select-option>
            <a-select-option :value="2">处理中</a-select-option>
            <a-select-option :value="3">处理完成</a-select-option>
            <a-select-option :value="4">已拒绝</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="工单类型">
          <a-select
            v-model:value="queryParams.workType"
            style="width: 120px"
            allowClear
            placeholder="请选择类型"
          >
            <a-select-option :value="1">故障/Bug</a-select-option>
            <a-select-option :value="2">投诉</a-select-option>
            <a-select-option :value="3">建议</a-select-option>
            <a-select-option :value="0">其他</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="提交时间">
          <a-range-picker
            v-model:value="dateRange"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="onDateRangeChange"
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleQuery">查询</a-button>
            <a-button @click="resetQuery">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        :columns="columns"
        :data-source="workOrders"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-if="column.key === 'imgUrls'">
            <template v-if="!record.imgUrls">-</template>
            <template v-else>
              <div class="image-preview-container">
                <a-button
                  type="link"
                  size="small"
                  @click="toggleImageExpand(record.id)"
                >
                  {{ getUrlsCount(record.imgUrls) }}张图片
                  <template #icon>
                    <down-outlined v-if="expandedImageRecord !== record.id" />
                    <up-outlined v-else />
                  </template>
                </a-button>

                <div v-show="expandedImageRecord === record.id" class="image-expand-container">
                  <a-image-preview-group>
                    <div class="image-grid">
                      <a-image
                        v-for="(url, index) in record.imgUrls.split(',')"
                        :key="index"
                        :src="getImageUrl(url)"
                        :width="80"
                        class="grid-image"
                      />
                    </div>
                  </a-image-preview-group>
                </div>
              </div>
            </template>
          </template>

          <template v-if="column.key === 'action'">
            <a-space>
              <template v-if="record.status === 1">
                <a-button
                  type="primary"
                  size="small"
                  @click="startProcess(record)"
                >
                  开始处理
                </a-button>
              </template>
              <template v-if="record.status === 2">
                <a-button
                  type="primary"
                  size="small"
                  @click="showReplyModal(record)"
                >
                  完成处理
                </a-button>
              </template>
              <a-button
                type="primary"
                danger
                size="small"
                @click="showRejectModal(record)"
                :disabled="record.status === 2 || record.status === 3 || record.status === 4"
              >
                拒绝
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="replyModalVisible"
      title="处理工单"
      @ok="handleReply"
      @cancel="closeReplyModal"
    >
      <a-form :model="replyForm">
        <a-form-item label="回复内容">
          <a-textarea
            v-model:value="replyForm.reply"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="rejectModalVisible"
      title="拒绝工单"
      @ok="handleReject"
      @cancel="closeRejectModal"
    >
      <a-form :model="rejectForm">
        <a-form-item label="拒绝理由">
          <a-textarea
            v-model:value="rejectForm.reply"
            :rows="4"
            placeholder="请输入拒绝理由"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
import { ref, onMounted } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'

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
  {
    title: '工单编号',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '说明',
    dataIndex: 'explanation',
    key: 'explanation',
  },
  {
    title: '图片',
    dataIndex: 'imgUrls',
    key: 'imgUrls',
    width: 200,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '提交时间',
    dataIndex: 'create_time',
    key: 'create_time',
  },
  {
    title: '用户名',
    dataIndex: 'user_name',
    key: 'user_name',
  },
  {
    title: '工单类型',
    dataIndex: 'workType',
    key: 'workType',
    customRender: ({ text }: { text: number }) => {
      const typeMap: Record<number, string> = {
        1: '故障/Bug',
        2: '投诉',
        3: '建议',
        0: '其他',
      }
      return typeMap[text] || '未知类型'
    }
  },
  {
    title: '回复内容',
    dataIndex: 'reply',
    key: 'reply',
    customRender: ({ text, record }: { text: string, record: WorkOrder }) => {
      if (record.status === 1) {
        return '待处理'
      }
      if (!text) {
        return '-'
      }
      return text
    }
  },
  {
    title: '处理时间',
    dataIndex: 'update_time',
    key: 'update_time',
    customRender: ({ text, record }: { text: string, record: WorkOrder }) => {
      if (record.status === 1) {
        return '-'
      }
      return text || '-'
    }
  },
  {
    title: '操作',
    key: 'action',
  },
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

const dateRange = ref<[Dayjs, Dayjs] | null>(null)

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

<style scoped>
.work-order-container {
  padding: 24px;
}

.query-form {
  margin-bottom: 24px;
}

.image-list {
  display: flex;
  gap: 8px;
  align-items: center;
}

.preview-image {
  object-fit: cover;
  border-radius: 4px;
}

.more-images {
  width: 60px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.image-preview-container {
  position: relative;
}

.image-expand-container {
  position: absolute;
  left: 0;
  top: 100%;
  background: white;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
  margin-top: 4px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-width: 400px;
}

.grid-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

/* 适配移动端 */
@media screen and (max-width: 768px) {
  .query-form {
    .ant-form-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .image-list {
    gap: 4px;
  }

  .preview-image,
  .more-images {
    width: 50px;
    height: 50px;
  }

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    max-width: 300px;
  }

  .grid-image {
    height: 60px;
  }
}
</style>
