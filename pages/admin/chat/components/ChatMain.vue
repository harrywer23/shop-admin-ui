<template>
  <div class="chat-main">
    <div class="chat-header">
      <div class="contact-info">
        <div class="name">
          {{ currentContact?.name || t('chat.noContactSelected') }}
          <q-badge
            v-if="currentContact?.userType === UserType.SYSTEM"
            color="primary"
            label="客服"
            class="q-ml-sm"
          />
        </div>
        <div class="status" v-if="currentContact">
          <span
            class="status-dot"
            :class="{ 'online': currentContact.status === '在线' }"
          ></span>
          {{ currentContact.status }}
        </div>
        <div class="no-contact" v-else>
          {{ t('chat.pleaseSelectContact') }}
        </div>
      </div>
      <q-btn
        flat
        round
        icon="people"
        @click="showOnlineUsers = !showOnlineUsers"
      >
        <q-tooltip>{{ t('chat.onlineUsers') }}</q-tooltip>
      </q-btn>
    </div>

    <div class="chat-content">
      <ChatMessages
        ref="messagesRef"
        :messages="messages"
        :loading="loading"
        :has-more="hasMore"
        @load-more="loadMoreMessages"
      />

      <div
        class="online-users-sidebar"
        :class="{ 'is-visible': showOnlineUsers }"
      >
        <div class="sidebar-header">
          <div class="header-title">{{ t('chat.activeChats') }}</div>
        </div>

        <!-- 聊天房间列表 -->
        <div class="rooms-list">
          <q-inner-loading :showing="loadingRooms">
            <q-spinner-dots size="40px" color="primary" />
          </q-inner-loading>

          <div v-if="showEmptyRoomsTip" class="empty-rooms">
            <q-icon name="chat_bubble_outline" size="48px" color="grey-5" />
            <div class="empty-text">{{ t('chat.noActiveChats') }}</div>
          </div>

          <div
            v-for="room in chatRooms"
            :key="room.id"
            class="room-item"
            :class="{ 
              'active': currentContact?.id === String(room.id),
              'service-room': room.type === RoomType.SERVICE
            }"
            @click="selectRoom(room)"
          >
            <q-avatar size="40px">
              <img :src="room.avatar" :alt="room.name">
            </q-avatar>
            <div class="room-info">
              <div class="room-name">
                {{ room.name }}
                <q-badge
                  v-if="room.type === RoomType.SERVICE"
                  color="primary"
                  class="q-ml-sm"
                >
                  {{ t('chat.customerService') }}
                </q-badge>
              </div>
              <div class="room-announcement">{{ room.announcement }}</div>
            </div>
            <q-badge
              v-if="room.unreadCount > 0"
              color="red"
              floating
            >
              {{ room.unreadCount }}
            </q-badge>
          </div>
        </div>
      </div>
    </div>

    <ChatInput
      v-model="newMessage"
      :current-contact="currentContact"
      @send="sendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref, computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {useQuasar} from 'quasar'
import {useRoute, useRouter} from '#app'
import {API_CONSTANTS} from '~/utils/constants'
import {socketManager} from '~/utils/socket'
import ChatMessages from './ChatMessages.vue'
import ChatInput from './ChatInput.vue'
import {ApiResponse, ChatMessageData, ChatRoom, ContentType, RoomType, UserType} from '~/utils/types'

const { t } = useI18n()
const $q = useQuasar()
const messages = ref<Array<ChatMessageData & { type: 'sent' | 'received' }>>([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 20
const newMessage = ref<string>('')
const messagesRef = ref<any>(null)
const currentContact = ref<Contact | null>(null)
const showOnlineUsers = ref<boolean>(false)

// 获取token
const token = useCookie<string>('token')
const userId = useCookie<string>('id')
const userName = useCookie<string>('userName')

// 用户信息
const currentUser = ref<{
  id: string
  name: string
  type: UserType
}>({
  id: userId.value || '',  // 从 cookie 获取
  name: userName.value || '', // 从 cookie 获取
  type: UserType.USER
})

// logWithDetails 函数
const logWithDetails = (level: 'info' | 'warn' | 'error', message: string, details?: Record<string, any>) => {
  const logData = {
    message,
    socketId: socketManager.getSocket()?.url,
    connectionState: socketManager.getSocket()?.readyState,
    timestamp: new Date().toISOString(),
    ...details
  }

  switch (level) {
    case 'info':
      console.log(`[WebSocket] ${message}:`, logData)
      break
    case 'warn':
      console.warn(`[WebSocket] ${message}:`, logData)
      break
    case 'error':
      console.error(`[WebSocket] ${message}:`, logData)
      break
  }
}

// 添加重连相关的状态
const isReconnecting = ref(false)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5
const reconnectDelay = 1000 // 初始重连延迟（毫秒）

// 添加重连方法
const reconnect = () => {
  if (isReconnecting.value || reconnectAttempts.value >= maxReconnectAttempts) {
    return
  }

  isReconnecting.value = true
  reconnectAttempts.value++

  const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts.value - 1), 10000)
  logWithDetails('warn', '准备重新连接', {
    attempt: reconnectAttempts.value,
    maxAttempts: maxReconnectAttempts,
    delay,
    nextAttemptAt: new Date(Date.now() + delay).toISOString()
  })

  setTimeout(() => {
    logWithDetails('info', '执行重连', {
      attempt: reconnectAttempts.value
    })

    socketManager.initialize(token.value)
    isReconnecting.value = false
  }, delay)
}

// 设置socket事件监听器
const setupSocketListeners = () => {
  socketManager.on('connect', () => {
    logWithDetails('info', 'Socket连接成功', {
      socketId: socketManager.getSocket()?.id
    })

    // 重置重连数
    reconnectAttempts.value = 0
    isReconnecting.value = false

    // 发送认证数据
    const authData = {
      token: token.value,
      userId: currentUser.value.id
    }

    logWithDetails('info', '发送认证数据', {
      userId: authData.userId,
      hasToken: !!authData.token
    })

    socketManager.emit('authenticate', authData)
  })

  // 修改错误处理逻辑
  socketManager.on('connect_error', (error) => {
    logWithDetails('error', 'Socket连接错误', {
      error: error.message,
      type: error.type,
      description: error.description,
      stack: error.stack,
      url: API_CONSTANTS.CHAT_SOCKET_URL,
      token: token.value ? 'present' : 'missing',
      socketId: socketManager.getSocket()?.id
    })

    // 不要立即断开连接，而是尝试重连
    handleConnectionError(error)
  })

  socketManager.on('disconnect', (reason) => {
    logWithDetails('warn', 'Socket断开连接', {
      reason,
      wasConnected: socketManager.getSocket()?.connected,
      socketId: socketManager.getSocket()?.id,
      reconnectAttempt: reconnectAttempts.value + 1
    })

    // 根据断开原因决定是否显示通知
    if (!['transport close', 'io client disconnect'].includes(reason)) {
      $q.notify({
        type: 'warning',
        message: `${t('chat.disconnected')} (${reason})`,
        timeout: 3000
      })
    }

    // 处理断开连接
    handleDisconnect(reason)
  })

  socketManager.on('message', (msg: String) => {
    console.log("收到信息：",msg)
  })
  socketManager.on('authenticated', () => {
    console.log('Socket authenticated successfully:', {
      socketId: socketManager.getSocket()?.id,
      timestamp: new Date().toISOString()
    })
  })

  socketManager.on('unauthorized', (error) => {
    console.error('Socket authentication failed:', {
      error,
      socketId: socketManager.getSocket()?.id,
      timestamp: new Date().toISOString()
    })
    $q.notify({
      type: 'negative',
      message: t('chat.authenticationFailed'),
      timeout: 5000
    })
  })

  // 监听在线用户更新
  socketManager.on('users', (users) => {
    // 直接使用接收到的用户列表,不需要添加客服
    onlineUsers.value = users
  })

  // 用户加入
  socketManager.on('userJoined', (user) => {
    // 直接添加新用户
    if (!onlineUsers.value.find(u => u.id === user.id)) {
      onlineUsers.value.push(user)
    }
  })

  // 用户离开
  socketManager.on('userLeft', (userId) => {
    // 直接移除离开的用户
    onlineUsers.value = onlineUsers.value.filter(u => u.id !== userId)
  })

  // 监听聊天消息
  socketManager.on('new_message', (message) => {
    logWithDetails('info', '收到新消息', {
      message,
      currentContact: currentContact.value ? {
        id: currentContact.value.id,
        name: currentContact.value.name
      } : null,
      currentUserId: userId.value
    })

    try {
      // 检查消息格式是否正确
      if (!message || typeof message !== 'object') {
        throw new Error('Invalid message format')
      }
      console.log("-----------显示消息的类型----------------",message,message.type ,(message.type === "act"))
      // 如果是消息确认（ack），不需要显示
      if(message.type === "ack"){
        return;
      }
      console.log(currentContact.value)
      // 如果消息属于当前聊天窗口，则添加到息列表
      if (currentContact.value) {
        console.log("-----------9----------------",message)

        const formattedMessage = {
          id: message.messageId,
          content: message.content,
          senderId: String(message.senderId),
          senderName: message.senderName || currentContact.value.name,
          senderAvatar: message.senderAvatar,
          receiverName: message.receiverName,
          receiverAvatar: message.receiverAvatar,
          roomId: String(currentContact.value.id),
          roomType: currentContact.value.type,
          contentType: message.contentType || ContentType.TEXT,
          sendTime: new Date(message.time),
          type: message.senderId === Number(userId.value) ? 'sent' : 'received',
          status: message.status || 1
        }

        // 打印格式化后的消息
        logWithDetails('info', '格式化后的消息', {
          formattedMessage,
          willAddToChat: true
        })

        messages.value.push(formattedMessage)

        // 滚动到最新消息
        nextTick(() => {
          messagesRef.value?.scrollToBottom()
        })
      }
    } catch (error) {
      logWithDetails('error', '处理消息出错', {
        error,
        message,
        stack: error.stack
      })
    }
  })

  // 监听用户状态变更
  socketManager.on('userStatus', (status) => {
    logWithDetails('info', '用户状态变更', { status })

    // 更新在线用户列表中的状态
    const userIndex = onlineUsers.value.findIndex(u => u.id === status.userId)
    if (userIndex !== -1) {
      onlineUsers.value[userIndex].status = status.status
    }

    // 如果是当前联系人，更新其状态
    if (currentContact.value?.id === status.userId) {
      currentContact.value.status = status.status
    }

    // 触发��定义事件
    window.dispatchEvent(new CustomEvent('onFriendStatus', { detail: status }))
  })

  // 监听系统通知
  socketManager.on('systemNotice', (notice) => {
    logWithDetails('info', '收到系统通知', { notice })

    // 显示系统通知
    $q.notify({
      type: notice.type || 'info',
      message: notice.message,
      timeout: notice.timeout || 5000,
      position: notice.position || 'top'
    })

    // 如果通知涉及到当前聊天，添加到消息列表
    if (notice.roomId && currentContact.value?.id === notice.roomId) {
      messages.value.push({
        id: notice.id,
        content: notice.content,
        senderId: String(notice.senderId),
        senderName: notice.senderName,
        sendUserType: notice.senderUserType,
        roomId: String(notice.roomId),
        roomType: notice.roomType,
        contentType: notice.contentType,
        sendTime: new Date(notice.sendTime),
        status: notice.status
      })
      // 滚动到最新消息
      // 滚动到最新消息
      nextTick(() => {
        messagesRef.value?.scrollToBottom()
      })
    }

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('onSystemNotice', { detail: notice }))
  })

  // 监听未读消息更新
  socketManager.on('unreadCount', (data) => {
    logWithDetails('info', '未读消息更新', { data })

    // 更新联系人表中的未读消息数
    const contact = chatRooms.value.find(room => room.id === Number(data.roomId))
    if (contact) {
      contact.unreadCount = data.count
    }
  })

  // 监听在线状态更新
  socketManager.on('onlineStatus', (data) => {
    logWithDetails('info', '在线状态更新', { data })

    // 更新联系人列表中的在线状态
    const contact = chatRooms.value.find(room => room.id === Number(data.userId))
    if (contact) {
      contact.online = data.online
    }
  })
}

// 添加连接错误处理方法
const handleConnectionError = (error: any) => {
  const errorMessage = error.message === 'xhr poll error'
    ? t('chat.connectionError')
    : error.message

  $q.notify({
    type: 'negative',
    message: errorMessage,
    timeout: 5000
  })

  // 如果不是主动断开，尝试重连
  if (!socketManager.getSocket()?.disconnected) {
    reconnect()
  }
}

// 添加断开连接处理方法
const handleDisconnect = (reason: string) => {
  const shouldReconnect = [
    'transport close',
    'transport error',
    'ping timeout',
    'io server disconnect'
  ].includes(reason)

  if (shouldReconnect && !isReconnecting.value) {
    // 使用延迟重连，避免立即重连可能导致的问题
    setTimeout(() => {
      reconnect()
    }, 1000)
  }
}

// 添加 fetchMessages 函数
const fetchMessages = async ({ page, pageSize }: { page: number, pageSize: number }) => {
  if (!currentContact.value) {
    throw new Error('No contact selected')
  }

  const response = await fetch(
    `${API_CONSTANTS.CHAT_URL}/chat/message/history/${currentContact.value.id}?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    }
  )

  const data: ApiResponse<ChatMessageData[]> = await response.json()

  if (!data.succ) {
    throw new Error(data.msg || '加载历史消息失败')
  }

  // 转换消息格式
  return {
    data: data.data.map((msg: ChatMessageData) => ({
      id: msg.id,
      content: msg.content,
      senderId: String(msg.senderId),
      senderName: msg.senderName,
      sendUserType: msg.senderUserType,
      roomId: String(msg.roomId),
      roomType: msg.roomType,
      contentType: msg.contentType,
      sendTime: new Date(msg.sendTime),
      status: msg.status
    }))
  }
}

// 修改 loadMoreMessages 函数
const loadMoreMessages = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const response = await fetchMessages({
      page: currentPage.value,
      pageSize
    })

    if (response.data.length < pageSize) {
      hasMore.value = false
    }

    // 确保消息不重复
    const newMessages = response.data.filter(newMsg =>
      !messages.value.some(existingMsg => existingMsg.id === newMsg.id)
    )

    if (newMessages.length > 0) {
      // 使用 nextTick 确保 DOM 更新后再调整滚动位置
      await nextTick()
      messages.value = [...newMessages, ...messages.value]
      currentPage.value++
    } else {
      hasMore.value = false
    }

  } catch (error) {
    logWithDetails('error', '加载历史消息失败', { error })
    $q.notify({
      type: 'negative',
      message: t('chat.loadHistoryFailed'),
      timeout: 3000
    })
    hasMore.value = false  // 出错时也设置为没有更多
  } finally {
    loading.value = false
  }
}

// 添加房间列表相关的状态
const chatRooms = ref<ChatRoom[]>([])
const loadingRooms = ref(false)

// 添加聊天室类型枚举
const ChatRoomTypeEnum = {
  PRIVATE: 1,
  GROUP: 2,
  SERVICE: 3
} as const
const UserTypeEnum = {
  system: 1,
  user: 2
} as const

// 修改加载聊天房间列表的方法
const loadChatRooms = async () => {
  loadingRooms.value = true
  try {
    const response = await fetch(`${API_CONSTANTS.CHAT_URL}/chat/room/system/list`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    const data: ApiResponse<ChatRoom[]> = await response.json()

    logWithDetails('info', '加载聊天房间列表', {
      success: data.succ,
      total: data.total,
      roomCount: data.data?.length
    })

    if (data.succ) {
      // 过滤出正在聊天的房间
      chatRooms.value = (data.data || []).filter(room => {
        // 根据房间状态过滤
        return room.status === 1 || // 活跃状态
               room.lastMessageTime || // 有最后消息时间
               room.unreadCount > 0 || // 有未读消息
               room.type === RoomType.SERVICE // 客服房间始终显示
      }).sort((a, b) => {
        // 优先显示客服房间
        if (a.type === RoomType.SERVICE && b.type !== RoomType.SERVICE) return -1
        if (a.type !== RoomType.SERVICE && b.type === RoomType.SERVICE) return 1
        // 然后按最后消息时间排序
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
        return timeB - timeA
      })

      // 如果有房间且没有选中的联系人，自动选择第一个房间
      if (chatRooms.value.length > 0 && !currentContact.value) {
        const firstRoom = chatRooms.value[0]
        selectRoom(firstRoom)

        logWithDetails('info', '自动选择第一个房间', {
          roomId: firstRoom.id,
          roomName: firstRoom.name,
          roomType: firstRoom.type
        })
      }
    } else {
      throw new Error(data.msg || '加载聊天房间失败')
    }
  } catch (error) {
    logWithDetails('error', '加载聊天房间列表失败', { error })
    $q.notify({
      type: 'negative',
      message: t('chat.loadRoomsFailed'),
      timeout: 3000
    })
  } finally {
    loadingRooms.value = false
  }
}

// 添加房间列表为空时的提示
const showEmptyRoomsTip = computed(() => {
  return chatRooms.value.length === 0 && !loadingRooms.value
})

// 修改历史消息加载方法
const loadHistoryMessages = async () => {
  if (!currentContact.value) {
    messages.value = []
    return
  }

  loading.value = true
  try {
    // 重置分页状态
    currentPage.value = 2
    messages.value = [] // 清空现有消息
    messagesRef.value?.resetInitialLoad()

    const response = await fetchMessages({
      page: 1,
      pageSize
    })

    // 设置消息列表
    messages.value = response.data

    // 如果第一页的数据少于pageSize，说明没有更多数据了
    if (response.data.length < pageSize) {
      hasMore.value = false
    }

    // 滚动到最新消息，不使用平滑效果
    nextTick(() => {
      messagesRef.value?.scrollToBottom(false)
    })

  } catch (error) {
    logWithDetails('error', '加载历史消息失败', {
      error,
      roomId: currentContact.value.id
    })

    $q.notify({
      type: 'negative',
      message: t('chat.loadHistoryFailed'),
      timeout: 3000
    })

    // 清空消息列表
    messages.value = []
    hasMore.value = false  // 出错时也设置为没有更多
  } finally {
    loading.value = false
  }
}

// 连接Socket服务器并发送认证信息
onMounted(async () => {
  // 验证用户信息是否存在
  if (!userId.value || !userName.value) {
    logWithDetails('error', '用户信息不完整', {
      userId: userId.value,
      userName: userName.value
    })

    $q.notify({
      type: 'negative',
      message: t('chat.userInfoMissing'),
      timeout: 3000
    })
    return
  }

  logWithDetails('info', '组件挂载，用户信息', {
    userId: userId.value,
    userName: userName.value
  })

  // 先加载房间列表，这样可以自动选择第一个房间
  await loadChatRooms()

  // 初始化 socket 连接
  socketManager.initialize(token.value)
  setupSocketListeners()

  // 添加网络状态监听
  window.addEventListener('online', () => {
    logWithDetails('info', '网络恢复连接')
    if (!socketManager.isConnected()) {
      reconnect()
    }
  })

  window.addEventListener('offline', () => {
    logWithDetails('warn', '网络开连接')
    $q.notify({
      type: 'warning',
      message: t('chat.networkOffline'),
      timeout: 3000
    })
  })

  // 处理 URL 参数
  const route = useRoute()
  const roomId = route.query?.roomId
  const type = route.query?.type

  if (roomId && type === 'service') {
    // 等待房间列表加载完成
    await loadChatRooms()
    // 查找并选择客服聊天房间
    const serviceRoom = chatRooms.value.find(
      room => room.id === Number(roomId) && room.type === RoomType.SERVICE
    )

    if (serviceRoom) {
      selectRoom(serviceRoom)
    }
  }
})

// 断开连接
onUnmounted(() => {
  logWithDetails('info', '组件卸载')
  // 移除网络状态监听
  window.removeEventListener('online', () => {})
  window.removeEventListener('offline', () => {})
  // 置重连状态
  isReconnecting.value = false
  reconnectAttempts.value = 0
  // 断开连接
  socketManager.disconnect()
})

// 修改发送消息方法
const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  // 检查是否选择了联系人
  if (!currentContact.value) {
    $q.notify({
      type: 'warning',
      message: t('chat.selectContactFirst'),
      timeout: 3000
    })
    return
  }

  if (!socketManager.isConnected()) {
    logWithDetails('error', '无法发送消息 - 连接未建立')
    $q.notify({
      type: 'negative',
      message: t('chat.connectionError')
    })
    socketManager.initialize(token.value)
    return
  }

  try {
    // 准备消息数据
    const messageData = {
      content: newMessage.value,
      senderId: Number(userId.value),
      senderName: userName.value || '',
      roomId: Number(currentContact.value.id),
      roomType: currentContact.value.type,
      contentType: ContentType.TEXT,
      receiverId: Number(currentContact.value.id),
      receiverName: currentContact.value.name
    }

    // 添加日志记录
    logWithDetails('info', '准备发送消息', {
      messageData,
      userId: userId.value,
      userName: userName.value,
      socketId: socketManager.getSocket()?.id
    })

    // 直接发送消息
    const success = socketManager.emit('chatMessage', messageData)
    console.log("success :",success)
    if (success) {
      // 直接添加消息到本地列表
      messages.value.push({
        id: Date.now(), // 使用临时ID
        content: messageData.content,
        senderId: String(messageData.senderId),
        senderName: messageData.senderName,
        senderUserType: UserType.USER,
        roomId: String(messageData.roomId),
        roomType: messageData.roomType,
        contentType: messageData.contentType,
        sendTime: new Date(),
        type: 'sent',
        status: 1
      })

      // 清空输入框并滚动到底部
      newMessage.value = ''
      messagesRef.value?.scrollToBottom()
    } else {
      throw new Error(t('chat.sendFailed'))
    }
  } catch (error) {
    logWithDetails('error', '发送消息过程出错', { error })

    // 检查连接状态
    if (!socketManager.isConnected()) {
      logWithDetails('warn', '发送消息时连接已断开，尝���重连')
      socketManager.initialize(token.value)
    }

    $q.notify({
      type: 'negative',
      message: error.message || t('chat.sendFailed'),
      timeout: 3000,
      actions: [
        {
          label: t('chat.retry'),
          color: 'white',
          handler: () => {
            sendMessage()
          }
        }
      ]
    })
  }
}

// 添加选择房间的方法
const selectRoom = async (room: ChatRoom) => {
  logWithDetails('info', '选择聊天房间', { room })
  const userType=ref(0);
  console.log("当前房间------------：",(room.creatorId != userId.value));
  if(Number(room.creatorType) == UserType.USER && room.creatorId == userId.value){
     userType.value=room.targetType;
  }
  if(Number(room.creatorType )== UserType.SYSTEM && room.creatorId == userId.value){
    userType.value=room.creatorType;
  }
  currentContact.value = {
    id: String(room.id),
    name: room.name,
    type: room.type,
    userType:userType.value,
    status: room.status === 1,
    avatar: room.avatar
  }
  console.log("当前房间------------：",currentContact)

  // 加载与该联系人的历史消息
  await loadHistoryMessages()

  showOnlineUsers.value = false
  newMessage.value = ''

  // 滚动到最新消息
  nextTick(() => {
    messagesRef.value?.scrollToBottom()
  })
}

defineExpose({
  setCurrentContact(contact) {
    currentContact.value = contact
  }
})
</script>

<style lang="scss" scoped>
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;

  .chat-header {
    padding: 10px 20px;
    border-bottom: 1px solid #ddd;
    background: white;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .contact-info {
      .name {
        font-size: 16px;
        font-weight: 500;
        display: flex;
        align-items: center;
      }

      .status {
        font-size: 12px;
        color: #666;
        display: flex;
        align-items: center;
        margin-top: 4px;

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          margin-right: 6px;

          &.online {
            background: #4caf50;
          }
        }
      }

      .no-contact {
        font-size: 12px;
        color: #999;
        font-style: italic;
        margin-top: 4px;
      }
    }
  }

  .chat-content {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;

    .online-users-sidebar {
      position: absolute;
      right: -300px;
      top: 0;
      bottom: 0;
      width: 300px;
      background: white;
      border-left: 1px solid #ddd;
      transition: right 0.3s ease;
      display: flex;
      flex-direction: column;

      &.is-visible {
        right: 0;
      }

      .sidebar-header {
        padding: 15px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;

        .header-title {
          font-size: 16px;
          color: #333;
        }
      }

      .rooms-list {
        flex: 1;
        overflow-y: auto;
        padding: 10px;

        .room-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;

          &:hover {
            background: #f5f5f5;
          }

          &.active {
            background: #e3f2fd;
          }

          &.service-room {
            background-color: rgba(var(--q-primary), 0.05);
            border-left: 3px solid var(--q-primary);

            .room-name {
              color: var(--q-primary);
            }

            &:hover {
              background-color: rgba(var(--q-primary), 0.1);
            }
          }

          .room-info {
            margin-left: 12px;
            flex: 1;

            .room-name {
              font-weight: 500;
              font-size: 14px;
            }

            .room-announcement {
              font-size: 12px;
              color: #666;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
  }
}

.rooms-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;

  .empty-rooms {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;
    color: #999;

    .empty-text {
      margin-top: 12px;
      font-size: 14px;
    }
  }
  position: relative;

  .room-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background: #f5f5f5;
    }

    &.active {
      background: #e3f2fd;
    }

    &.service-room {
      background-color: rgba(var(--q-primary), 0.05);
      border-left: 3px solid var(--q-primary);

      .room-name {
        color: var(--q-primary);
      }

      &:hover {
        background-color: rgba(var(--q-primary), 0.1);
      }
    }

    .room-info {
      margin-left: 12px;
      flex: 1;

      .room-name {
        font-weight: 500;
        font-size: 14px;
      }

      .room-announcement {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
