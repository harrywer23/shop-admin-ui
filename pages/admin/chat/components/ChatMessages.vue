<template>
  <div class="chat-messages q-pa-md" ref="messageContainer" @scroll="handleScroll">
    <div v-if="!loading" class="pull-down-tip">
      <q-spinner-dots v-if="isLoadingMore" color="primary" size="1em" />
      <template v-if="hasMore">
        {{ isLoadingMore ? t('chat.loading') : t('chat.pullDownToLoadMore') }}
      </template>
      <template v-else>
        <q-icon name="info" size="1em" color="grey-6" class="q-mr-xs" />
        {{ t('chat.noMoreMessages') }}
      </template>
    </div>
    <div v-if="loading" class="loading-history">
      <q-spinner color="primary" size="2em" />
      <span>{{ t('chat.loadingHistory') }}</span>
    </div>

    <template v-for="(msg, index) in messages" :key="index">
      <q-chat-message
          v-if="msg.senderId == currentUserId"
          :name="msg.senderName"
          :avatar="getImageUrl(msg.senderAvatar)"
          :text="formatMessageText(msg.content)"
          :stamp="formatTime(msg.sendTime)"
          sent
          bg-color="amber-7"
      />
      <q-chat-message
          v-else
          :name="msg.receiverName"
          :avatar="getImageUrl(msg.receiverAvatar)"
          :text="formatMessageText(msg.content)"
          :stamp="formatTime(msg.sendTime)"
          text-color="white"
          bg-color="primary"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCookie } from '#app'
import type { ChatMessageData } from '~/utils/types'
import  { getImageUrl } from '~/utils/tools'

const { t } = useI18n()
const messageContainer = ref<HTMLElement | null>(null)

// 使用 computed 获取当前用户ID
const currentUserId = computed(() => {
  const cookie = useCookie<string>('id')
  return cookie.value || ''
})

const emit = defineEmits(['loadMore'])

const props = defineProps({
  messages: {
    type: Array as PropType<Array<ChatMessageData & { type: 'sent' | 'received' }>>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: true
  }
})

// 判断是否是发送的消息
const isSentMessage = (msg: ChatMessageData & { type: 'sent' | 'received' }) => {
  return String(msg.senderId) === currentUserId.value
}

// 格式化消息文本，支持行和链接
const formatMessageText = (text: string | undefined) => {
  if (!text) return ['']
  const formattedText = text
    .replace(/\n/g, '<br>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
  return [formattedText]
}

// 获取用户名首字母作为头像
const getInitials = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : '?'
}

// 根据用户ID生成固定的头像颜色
const getAvatarColor = (msg: ChatMessageData & { type: 'sent' | 'received' }) => {
  const colors = ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning']
  const index = Math.abs(hashCode(msg.senderId)) % colors.length
  return colors[index]
}

// 简单的字符串哈希函数
const hashCode = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return hash
}

// 获取默认头像
const defaultAvatar = (msg: ChatMessageData & { type: 'sent' | 'received' }) => {
  return msg.isSystem ? '/images/system-avatar.png' : undefined
}

const formatTime = (date: Date | string | undefined): string => {
  if (!date) return ''
  
  const messageDate = new Date(date)
  const now = new Date()
  
  // 检查是否是今天
  const isToday = messageDate.toDateString() === now.toDateString()
  
  // 检查是否是昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = messageDate.toDateString() === yesterday.toDateString()
  
  // 检查是否是今年
  const isThisYear = messageDate.getFullYear() === now.getFullYear()
  
  if (isToday) {
    // 今天只显示时间
    return messageDate.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (isYesterday) {
    // 昨天显示"昨天 HH:mm"
    return `昨天 ${messageDate.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  } else if (isThisYear) {
    // 今年显示"MM-DD HH:mm"
    return messageDate.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace('/', '-')
  } else {
    // 其他时间显示完整日期"YYYY-MM-DD HH:mm"
    return messageDate.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace('/', '-').replace('/', '-')
  }
}

const getBgColor = (msg: ChatMessageData & { type: 'sent' | 'received' }) => {
  if (msg.isSystem) return 'grey-3'
  return isSentMessage(msg) ? 'primary' : 'grey-2'
}

const getTextColor = (msg: ChatMessageData & { type: 'sent' | 'received' }) => {
  if (msg.isSystem) return 'grey-8'
  return isSentMessage(msg) ? 'white' : 'black'
}

const isLoadingMore = ref(false)
const scrollThreshold = 100
const isInitialLoad = ref(true)

const handleScroll = async (event: Event) => {
  const target = event.target as HTMLElement

  if (isInitialLoad.value) {
    isInitialLoad.value = false
    return
  }

  if (props.loading || target.scrollTop > scrollThreshold) {
    return
  }

  if (!isLoadingMore.value && props.hasMore) {
    isLoadingMore.value = true

    try {
      const oldScrollHeight = target.scrollHeight
      const oldScrollTop = target.scrollTop

      await emit('loadMore')

      await nextTick()

      const newScrollHeight = target.scrollHeight
      const scrollDiff = newScrollHeight - oldScrollHeight

      target.style.scrollBehavior = 'smooth'
      target.scrollTop = oldScrollTop + scrollDiff

      setTimeout(() => {
        target.style.scrollBehavior = 'auto'
      }, 300)

    } catch (error) {
      console.error('Error in handleScroll:', error)
    } finally {
      setTimeout(() => {
        isLoadingMore.value = false
      }, 200)
    }
  }
}

const scrollToBottom = (smooth = true) => {
  nextTick(() => {
    if (messageContainer.value) {
      isInitialLoad.value = true
      messageContainer.value.style.scrollBehavior = smooth ? 'smooth' : 'auto'
      messageContainer.value.scrollTo({
        top: messageContainer.value.scrollHeight,
      })
      setTimeout(() => {
        messageContainer.value!.style.scrollBehavior = 'auto'
      }, 300)
    }
  })
}

watch(() => props.messages.length, (newLength, oldLength) => {
  if (newLength > oldLength && !props.loading && !isInitialLoad.value) {
    scrollToBottom(true)
  }
})

defineExpose({
  scrollToBottom,
  resetInitialLoad: () => {
    isInitialLoad.value = true
  }
})
</script>

<style lang="scss" scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 180px); // 减去头部和输入框的高度
  background: #f5f5f5;

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }

  // Firefox滚动条样式
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

  .loading-history {
    position: sticky;
    top: 0;
    z-index: 3;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    gap: 10px;
    color: #666;
    border-bottom: 1px solid #eee;
  }

  .pull-down-tip {
    position: sticky;
    top: 0;
    z-index: 2;
    background: rgba(255, 255, 255, 0.9);
    text-align: center;
    padding: 10px;
    color: #666;
    font-size: 12px;
    border-bottom: 1px solid #eee;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.3s ease;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }

    // 没有更多数据时的样式
    &:not(.has-more) {
      background: #f5f5f5;
      color: #999;
      font-style: italic;
    }
  }

  // 消息间距
  :deep(.q-message) {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  scroll-behavior: auto;
}

// 系统消息样式
.system-name {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 12px;
}
</style>
