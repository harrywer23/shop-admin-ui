<template>
  <div class="follows-page">
    <div class="page-header">
      <h1 class="text-h5">我的关注</h1>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 关键词搜索 -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model="filters.keyword"
                label="搜索用户名"
                dense
                outlined
                clearable
                @update:model-value="loadFollows"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <!-- 时间范围 -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model="filters.dateRange"
                label="关注时间"
                dense
                outlined
                readonly
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="filters.dateRange"
                        range
                        mask="YYYY-MM-DD"
                        @update:model-value="loadFollows"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 关注列表 -->
    <div class="follows-grid">
      <q-card v-for="user in follows" :key="user.id" flat bordered class="follow-card q-mb-md">
        <!-- 用户信息 -->
        <q-card-section>
          <div class="row items-center justify-between">
            <!-- 用户基本信息 -->
            <div class="user-info row items-center">
              <q-avatar size="50px" class="q-mr-md">
                <img :src="user.userAvatar">
              </q-avatar>
              <div>
                <div class="text-h6">{{ user.userName }}</div>
                <div class="text-caption text-grey">
                  关注时间: {{ formatDateTime(user.followTime) }}
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions">
              <q-btn
                color="primary"
                icon="chat"
                label="发消息"
                flat
                @click="sendMessage(user)"
              />
              <q-btn
                color="negative"
                icon="person_remove"
                label="取消关注"
                flat
                @click="confirmUnfollow(user)"
              />
            </div>
          </div>
        </q-card-section>

        <!-- 用户统计信息 -->
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-4 text-center">
              <div class="text-h6">{{ user.postsCount }}</div>
              <div class="text-caption">发帖数</div>
            </div>
            <div class="col-4 text-center">
              <div class="text-h6">{{ user.followersCount }}</div>
              <div class="text-caption">粉丝数</div>
            </div>
            <div class="col-4 text-center">
              <div class="text-h6">{{ user.followingCount }}</div>
              <div class="text-caption">关注数</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 分页器 -->
    <div class="pagination-section q-mt-lg flex justify-center">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        boundary-numbers
        direction-links
        @update:model-value="loadFollows"
      />
    </div>

    <!-- 取消关注确认对话框 -->
    <q-dialog v-model="unfollowDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">取消关注</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          确定要取消关注 {{ unfollowDialog.user?.userName }} 吗？
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确定" color="negative" @click="handleUnfollow" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { api } from '~/utils/axios'

const router = useRouter()
const $q = useQuasar()

// 状态变量
const follows = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const filters = ref({
  keyword: '',
  dateRange: null
})

// 取消关注对话框
const unfollowDialog = ref({
  show: false,
  user: null
})

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 加载关注列表
const loadFollows = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: 10,
      keyword: filters.value.keyword,
      startTime: filters.value.dateRange?.from,
      endTime: filters.value.dateRange?.to
    }

    const response = await api.get('/user/follows', { params })
    const { code, data, total } = response.data
    if (code === 200) {
      follows.value = data
      totalPages.value = Math.ceil(total / 10)
    }
  } catch (error) {
    console.error('加载关注列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载关注列表失败'
    })
  } finally {
    loading.value = false
  }
}

// 发送私信
const sendMessage = (user: any) => {
  router.push(`/user/messages?targetId=${user.userId}`)
}

// 显示取消关注确认框
const confirmUnfollow = (user: any) => {
  unfollowDialog.value.user = user
  unfollowDialog.value.show = true
}

// 处理取消关注
const handleUnfollow = async () => {
  if (!unfollowDialog.value.user) return

  try {
    const response = await api.post(`/user/unfollow/${unfollowDialog.value.user.userId}`)
    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '取消关注成功'
      })
      unfollowDialog.value.show = false
      loadFollows()
    } else {
      throw new Error(msg || '取消关注失败')
    }
  } catch (error) {
    console.error('取消关注失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '取消关注失败'
    })
  }
}

// 初始化
onMounted(() => {
  loadFollows()
})
</script>

<style lang="scss" scoped>
.follows-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
  }

  .follow-card {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .user-info {
      .text-h6 {
        margin: 0;
        line-height: 1.2;
      }
    }

    .actions {
      .q-btn {
        margin-left: 8px;
      }
    }
  }
}
</style> 