<template>
  <div class="topic-detail-page">
    <!-- 主题内容 -->
    <q-card flat bordered class="topic-card q-mb-lg">
      <q-card-section>
        <!-- 主题标题 -->
        <div class="topic-header">
          <h1 class="text-h5">
            <q-chip
              v-if="topic.isTop"
              color="primary"
              text-color="white"
              dense
              class="q-mr-sm"
            >
              置顶
            </q-chip>
            <q-chip
              v-if="topic.isEssence"
              color="purple"
              text-color="white"
              dense
              class="q-mr-sm"
            >
              精华
            </q-chip>
            {{ topic.title }}
          </h1>
          <div class="topic-meta text-grey">
            <q-avatar size="28px">
              <img :src="topic.userAvatar">
            </q-avatar>
            <span class="username q-ml-sm">{{ topic.userName }}</span>
            <span class="q-mx-sm">•</span>
            <span>{{ formatDateTime(topic.createdAt) }}</span>
            <span class="q-mx-sm">•</span>
            <span>{{ topic.views }} 次浏览</span>
          </div>
        </div>

        <!-- 主题内容 -->
        <div class="topic-content q-mt-lg" v-html="topic.content"></div>

        <!-- 附件列表 -->
        <div v-if="topic.attachments?.length" class="attachments q-mt-lg">
          <div class="text-subtitle2 q-mb-sm">附件：</div>
          <div class="row q-col-gutter-md">
            <div
              v-for="file in topic.attachments"
              :key="file.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card flat bordered class="attachment-card">
                <q-item>
                  <q-item-section avatar>
                    <q-icon :name="getFileIcon(file.fileType)" size="40px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ file.fileName }}</q-item-label>
                    <q-item-label caption>
                      {{ formatFileSize(file.fileSize) }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="download"
                      @click="downloadFile(file)"
                    >
                      <q-tooltip>下载</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-card>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="topic-actions q-mt-lg">
          <q-btn
            :color="topic.isLiked ? 'primary' : 'grey'"
            :icon="topic.isLiked ? 'thumb_up' : 'thumb_up_off_alt'"
            :label="topic.likes"
            flat
            @click="handleLike"
          />
          <q-btn
            color="grey"
            icon="comment"
            :label="topic.comments"
            flat
            @click="scrollToComments"
          />
          <q-space />
          <q-btn
            v-if="isAuthor"
            color="primary"
            icon="edit"
            label="编辑"
            flat
            @click="editTopic"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- 评论区 -->
    <div ref="commentsSection" class="comments-section">
      <div class="text-h6 q-mb-md">
        评论 ({{ topic.comments }})
      </div>

      <!-- 评论输入框 -->
      <q-card v-if="isLoggedIn" flat bordered class="comment-editor q-mb-lg">
        <q-card-section>
          <q-input
            v-model="commentContent"
            type="textarea"
            label="写下你的评论"
            :rules="[val => !!val || '请输入评论内容']"
            outlined
            autogrow
          />
          <div class="row justify-end q-mt-md">
            <q-btn
              color="primary"
              :label="replyTo ? '回复' : '发表评论'"
              :loading="submitting"
              @click="submitComment"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- 评论列表 -->
      <div class="comments-list">
        <template v-if="comments.length">
          <q-card
            v-for="comment in comments"
            :key="comment.id"
            flat
            bordered
            class="comment-card q-mb-md"
          >
            <q-card-section>
              <!-- 评论头部 -->
              <div class="row items-center">
                <q-avatar size="28px">
                  <img :src="comment.userAvatar">
                </q-avatar>
                <div class="column q-ml-sm">
                  <div class="text-subtitle2">{{ comment.userName }}</div>
                  <div class="text-caption text-grey">
                    {{ formatDateTime(comment.createdAt) }}
                  </div>
                </div>
              </div>

              <!-- 评论内容 -->
              <div class="comment-content q-mt-md">
                <div v-if="comment.parentId" class="reply-info q-mb-sm">
                  回复 <span class="text-primary">@{{ comment.replyToUser }}</span>：
                </div>
                {{ comment.content }}
              </div>

              <!-- 评论操作 -->
              <div class="row items-center q-mt-md">
                <q-btn
                  :color="comment.isLiked ? 'primary' : 'grey'"
                  :icon="comment.isLiked ? 'thumb_up' : 'thumb_up_off_alt'"
                  :label="comment.likes"
                  flat
                  dense
                  @click="handleCommentLike(comment)"
                />
                <q-btn
                  color="grey"
                  icon="reply"
                  label="回复"
                  flat
                  dense
                  @click="toggleReplyBox(comment)"
                />
                <q-space />
                <q-btn
                  v-if="comment.userId === currentUser?.id"
                  color="negative"
                  icon="delete"
                  flat
                  dense
                  @click="deleteComment(comment)"
                >
                  <q-tooltip>删除</q-tooltip>
                </q-btn>
              </div>

              <!-- 回复输入框 -->
              <div
                v-if="replyTo?.id === comment.id"
                class="reply-box q-mt-md"
              >
                <q-input
                  v-model="commentContent"
                  type="textarea"
                  :label="`回复 @${comment.userName}`"
                  :rules="[val => !!val || '请输入回复内容']"
                  outlined
                  autogrow
                  dense
                  class="q-mb-sm"
                  @keydown.enter.prevent="submitComment"
                />
                <div class="row justify-end q-gutter-sm">
                  <q-btn
                    flat
                    label="取消"
                    color="grey"
                    @click="cancelReply"
                  />
                  <q-btn
                    color="primary"
                    label="回复"
                    :loading="submitting"
                    @click="submitComment"
                  />
                </div>
              </div>

              <!-- 子评论列表 -->
              <div
                v-if="comment.children?.length"
                class="sub-comments q-mt-md q-ml-lg"
              >
                <q-card
                  v-for="subComment in comment.children"
                  :key="subComment.id"
                  flat
                  bordered
                  class="sub-comment-card q-mb-sm"
                >
                  <!-- 子评论内容（结构类似父评论） -->
                  <q-card-section>
                    <!-- ... 子评论的内容结构 ... -->
                  </q-card-section>
                </q-card>
              </div>
            </q-card-section>
          </q-card>
        </template>
        <div v-else class="text-center text-grey q-pa-lg">
          暂无评论，快来抢沙发吧！
        </div>
      </div>

      <!-- 分页器 -->
      <div v-if="totalPages > 1" class="flex justify-center q-mt-lg">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="6"
          boundary-numbers
          direction-links
          @update:model-value="loadComments"
        />
      </div>
    </div>

    <!-- 登录提示 -->
    <q-dialog v-model="showLoginDialog">
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">提示</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          请先登录后再进行操作
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn label="去登录" color="primary" @click="goToLogin" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { api } from '~/utils/axios'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// 状态变量
const topic = ref<any>({})
const comments = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const commentContent = ref('')
const submitting = ref(false)
const showLoginDialog = ref(false)
const replyTo = ref<any>(null)
const commentsSection = ref(null)
const isLoggedIn = ref(false)
const currentUser = ref<any>(null)

// 计算属性
const isAuthor = computed(() => {
  return currentUser.value?.id === topic.value.userId
})

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取文件图标
const getFileIcon = (fileType: string) => {
  const typeMap: { [key: string]: string } = {
    'image': 'image',
    'pdf': 'picture_as_pdf',
    'word': 'description',
    'excel': 'table_chart',
    'zip': 'folder_zip'
  }
  return typeMap[fileType] || 'insert_drive_file'
}

// 加载主题详情
const loadTopic = async () => {
  try {
    const response = await api.get(`/forum/topic/detail/${route.params.id}`)
    const { code, data } = response.data
    if (code === 200) {
      topic.value = data
      loadComments()
    }
  } catch (error) {
    console.error('加载主题详情失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载主题详情失败'
    })
  }
}

// 加载评论列表
const loadComments = async () => {
  try {
    const params = {
      topicId: route.params.id,
      page: currentPage.value,
      limit: 10
    }
    const response = await api.get('/forum/comments', { params })
    const { code, data, total } = response.data
    if (code === 200) {
      comments.value = data
      totalPages.value = Math.ceil(total / 10)
    }
  } catch (error) {
    console.error('加载评论列表失败:', error)
  }
}

// 切换回复框显示状态
const toggleReplyBox = (comment: Comment) => {
  if (!isLoggedIn.value) {
    showLoginDialog.value = true
    return
  }

  if (replyTo.value?.id === comment.id) {
    cancelReply()
  } else {
    replyTo.value = comment
    commentContent.value = ''
  }
}

// 取消回复
const cancelReply = () => {
  replyTo.value = null
  commentContent.value = ''
}

// 提交评论
const submitComment = async () => {
  if (!isLoggedIn.value) {
    showLoginDialog.value = true
    return
  }

  if (!commentContent.value.trim()) {
    $q.notify({
      type: 'warning',
      message: '请输入评论内容'
    })
    return
  }

  if (submitting.value) return
  submitting.value = true

  try {
    const data = {
      topicId: topic.value.id,
      content: commentContent.value,
      parentId: replyTo.value?.id
    }
    const response = await api.post('/admin/forum/comment', data)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '评论成功'
      })
      commentContent.value = ''
      replyTo.value = null
      loadComments()
      topic.value.comments++
    }
  } catch (error) {
    console.error('提交评论失败:', error)
    $q.notify({
      type: 'negative',
      message: '评论失败'
    })
  } finally {
    submitting.value = false
  }
}

// 点赞主题
const handleLike = async () => {
  if (!isLoggedIn.value) {
    showLoginDialog.value = true
    return
  }

  try {
    const response = await api.post(`/admin/forum/topic/like/${topic.value.id}`)
    if (response.data.code === 200) {
      topic.value.isLiked = !topic.value.isLiked
      topic.value.likes += topic.value.isLiked ? 1 : -1
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 点赞评论
const handleCommentLike = async (comment: any) => {
  if (!isLoggedIn.value) {
    showLoginDialog.value = true
    return
  }

  try {
    const response = await api.post(`/admin/forum/comment/like/${comment.id}`)
    if (response.data.code === 200) {
      comment.isLiked = !comment.isLiked
      comment.likes += comment.isLiked ? 1 : -1
    }
  } catch (error) {
    console.error('点赞评论失败:', error)
  }
}

// 删除评论
const deleteComment = async (comment: any) => {
  try {
    const response = await api.delete(`/admin/forum/comment/${comment.id}`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '删除成功'
      })
      loadComments()
      topic.value.comments--
    }
  } catch (error) {
    console.error('删除评论失败:', error)
    $q.notify({
      type: 'negative',
      message: '删除失败'
    })
  }
}

// 下载附件
const downloadFile = (file: any) => {
  window.open(`${API_CONSTANTS.BASE_URL}/forum/attachment/download/${file.id}`)
}

// 编辑主题
const editTopic = () => {
  router.push(`/forum/topic/edit/${topic.value.id}`)
}

// 滚动到评论区
const scrollToComments = () => {
  commentsSection.value?.scrollIntoView({ behavior: 'smooth' })
}

// 跳转到登录页
const goToLogin = () => {
  showLoginDialog.value = false
  router.push('/login')
}

// 检查登录状态
const checkLoginStatus = () => {
  const token = useCookie('token')
  const userInfo = useCookie('userInfo')
  isLoggedIn.value = !!token
  currentUser.value = userInfo ? userInfo.value : null
}

// 初始化
onMounted(() => {
  checkLoginStatus()
  loadTopic()
})
</script>

<style lang="scss" scoped>
.topic-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;

  .topic-card {
    .topic-header {
      .topic-meta {
        margin-top: 12px;
        font-size: 0.9em;
      }
    }

    .topic-content {
      font-size: 1.1em;
      line-height: 1.6;
    }

    .attachments {
      .attachment-card {
        transition: transform 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }
      }
    }
  }

  .comments-section {
    .comment-card {
      .comment-content {
        font-size: 1em;
        line-height: 1.5;
      }

      .reply-info {
        font-size: 0.9em;
        color: #666;
      }

      .reply-box {
        background: rgba(0, 0, 0, 0.02);
        border-radius: 4px;
        padding: 12px;
      }

      .sub-comments {
        border-left: 2px solid var(--q-primary);
        padding-left: 16px;

        .sub-comment-card {
          background: rgba(0, 0, 0, 0.01);
        }
      }
    }
  }
}

// 添加评论卡片的悬停效果
.comment-card {
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
}

// 添加子评论卡片的悬停效果
.sub-comment-card {
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
}
</style>
