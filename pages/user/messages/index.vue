<template>
  <div class="messages-page">
    <div class="page-header">
      <h1 class="text-h5">我的私信</h1>
    </div>

    <!-- 会话列表 -->
    <div class="session-list">
      <q-list bordered separator>
        <q-item
          v-for="session in sessions"
          :key="session.id"
          clickable
          v-ripple
          :active="currentSession?.id === session.id"
          @click="selectSession(session)"
        >
          <q-item-section avatar>
            <q-avatar>
              <img :src="session.targetUserAvatar">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ session.targetUserName }}</q-item-label>
            <q-item-label caption lines="1">
              {{ session.lastMessage }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="column items-end">
              <div class="text-caption text-grey">
                {{ formatTime(session.updatedAt) }}
              </div>
              <q-badge
                v-if="session.unreadCount"
                color="red"
                floating
              >
                {{ session.unreadCount }}
              </q-badge>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 聊天窗口 -->
    <div v-if="currentSession" class="chat-window">
      <div class="chat-header">
        <div class="text-h6">{{ currentSession.targetUserName }}</div>
      </div>

      <!-- 消息列表 -->
      <div ref="messageList" class="message-list" @scroll="onScroll">
        <div v-for="message in messages" :key="message.id" class="message-item">
          <div :class="['message-bubble', message.fromUserId === currentUser.id ? 'sent' : 'received']">
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.createdAt) }}</div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="message-input">
        <q-input
          v-model="newMessage"
          type="textarea"
          rows="3"
          outlined
          dense
          placeholder="输入消息..."
          @keypress.enter.prevent="sendMessage"
        >
          <template v-slot:after>
            <q-btn
              color="primary"
              round
              icon="send"
              :disable="!newMessage.trim()"
              @click="sendMessage"
            />
          </template>
        </q-input>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <q-icon name="chat" size="100px" color="grey-4" />
      <div class="text-h6 text-grey q-mt-md">选择一个会话开始聊天</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from '~/utils/axios'

const $q = useQuasar()
const currentUser = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
const sessions = ref([])
const currentSession = ref(null)
const messages = ref([])
const newMessage = ref('')
const messageList = ref(null)
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

// 加载会话列表
const loadSessions = async () => {
  try {
    const response = await api.get('/user/message/sessions')
    const { code, data } = response.data
    if (code === 200) {
      sessions.value = data
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
  }
}

// 加载消息历史
const loadMessages = async (init = false) => {
  if (!currentSession.value || loading.value || (!init && !hasMore.value)) return

  loading.value = true
  try {
    const params = {
      sessionId: currentSession.value.id,
      page: init ? 1 : page.value,
      limit: 20
    }

    const response = await api.get('/user/messages', { params })
    const { code, data, total } = response.data
    
    if (code === 200) {
      if (init) {
        messages.value = data.reverse()
        nextTick(() => {
          scrollToBottom()
        })
      } else {
        messages.value = [...data.reverse(), ...messages.value]
      }
      
      hasMore.value = messages.value.length < total
      if (!init) page.value++
    }
  } catch (error) {
    console.error('加载消息失败:', error)
  } finally {
    loading.value = false
  }
}

// 选择会话
const selectSession = async (session: any) => {
  currentSession.value = session
  page.value = 1
  hasMore.value = true
  messages.value = []
  await loadMessages(true)
  
  // 标记为已读
  if (session.unreadCount > 0) {
    try {
      await api.post(`/user/message/read/${session.id}`)
      session.unreadCount = 0
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
}

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentSession.value) return

  try {
    const response = await api.post('/user/message/send', {
      toUserId: currentSession.value.targetUserId,
      content: newMessage.value
    })

    const { code, data } = response.data
    if (code === 200) {
      messages.value.push(data)
      currentSession.value.lastMessage = newMessage.value
      currentSession.value.updatedAt = new Date().toISOString()
      newMessage.value = ''
      nextTick(() => {
        scrollToBottom()
      })
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    $q.notify({
      type: 'negative',
      message: '发送失败'
    })
  }
}

// 滚动到底部
const scrollToBottom = () => {
  const container = messageList.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// 监听滚动加载更多
const onScroll = async (event: any) => {
  const { scrollTop } = event.target
  if (scrollTop === 0 && !loading.value && hasMore.value) {
    await loadMessages()
  }
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const messageDate = new Date(time)
  const now = new Date()
  
  if (messageDate.toDateString() === now.toDateString()) {
    return date.formatDate(time, 'HH:mm')
  } else if (messageDate.getFullYear() === now.getFullYear()) {
    return date.formatDate(time, 'MM-DD HH:mm')
  }
  return date.formatDate(time, 'YYYY-MM-DD HH:mm')
}

// 初始化
onMounted(() => {
  loadSessions()
})
</script>

<style lang="scss" scoped>
.messages-page {
  display: flex;
  height: calc(100vh - 100px);
  padding: 20px;
  gap: 20px;

  .session-list {
    width: 300px;
    border-right: 1px solid #f0f0f0;
    overflow-y: auto;
  }

  .chat-window {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;

    .chat-header {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .message-list {
      flex: 1;
      padding: 20px;
      overflow-y: auto;

      .message-item {
        margin-bottom: 16px;

        .message-bubble {
          max-width: 70%;
          padding: 12px;
          border-radius: 8px;

          &.sent {
            margin-left: auto;
            background: #e3f2fd;

            .message-time {
              text-align: right;
            }
          }

          &.received {
            margin-right: auto;
            background: #f5f5f5;
          }

          .message-content {
            word-break: break-word;
          }

          .message-time {
            margin-top: 4px;
            font-size: 12px;
            color: #999;
          }
        }
      }
    }

    .message-input {
      padding: 16px;
      border-top: 1px solid #f0f0f0;
    }
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style> 