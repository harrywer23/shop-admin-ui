import { API_CONSTANTS } from './constants'
import type { Process } from '@nuxt/types'
import type { ChatMessageData } from './types'

declare const process: Process

// 统一消息格式接口
interface WebSocketMessage<T = any> {
  event: string   // 事件类型
  data: T         // 消息内容
}

// 定义消息数据接口
interface MessageData {
  content?: string
  senderId?: number | string
  senderName?: string
  roomId?: number | string
  roomType?: number
  contentType?: number
  receiverId?: number | string
  receiverName?: string
  callbackPath?: string
  type?: string
  [key: string]: any
}

// Socket响应接口
interface SocketResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

class SocketManager {
  private static instance: SocketManager
  private socket: WebSocket | null = null
  private initialized = false
  private listeners: Map<string, Function[]> = new Map()
  private maxReconnectAttempts = 5
  private reconnectAttempts = 0
  private pingInterval: NodeJS.Timeout | null = null
  private pingTimeout = 60000
  private connectionId: string = '' // 添加连接ID
  private errorMessages: Record<string, string> = {
    'transport error': '传输协议错误',
    'transport close': '传输连接关闭',
    'ping timeout': '心跳超时',
    'connection error': '连接错误',
    'connection timeout': '连接超时',
    'connection refused': '连接被拒绝'
  }
  private token: string | null = null

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  // 生成唯一的连接ID
  private generateConnectionId(): string {
    return 'ws-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }

  initialize(token?: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.logWithDetails('info', '跳过WebSocket初始化 - 连接已存在且处于开启状态')
      return
    }

    if (typeof window !== 'undefined') {
      this.token = token || null
      // 生成新的连接ID
      this.connectionId = this.generateConnectionId()

      try {
        // 创建 WebSocket URL 并添加参数
        const wsUrl = new URL(API_CONSTANTS.CHAT_SOCKET_URL)
        
        // 添加 token 和 connectionId 到 URL 参数
        if (this.token) {
          wsUrl.searchParams.append('token', this.token)
        }
        wsUrl.searchParams.append('connectionId', this.connectionId)

        this.logWithDetails('info', '开始初始化WebSocket', {
          url: wsUrl.toString(),
          hasToken: !!this.token,
          connectionId: this.connectionId
        })

        // 创建新的 WebSocket 连接
        this.socket = new WebSocket(wsUrl)

        // 设置连接超时
        const connectionTimeout = setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            this.logWithDetails('error', '连接超时')
            this.socket?.close()
            this.reconnect()
          }
        }, 10000)

        // 设置事件监听器
        this.setupEventListeners()

        // 连接成功后清除超时
        this.socket.onopen = () => {
          clearTimeout(connectionTimeout)
          this.logWithDetails('info', '连接成功', {
            protocol: this.socket?.protocol,
            extensions: this.socket?.extensions,
            connectionId: this.connectionId
          })
          this.reconnectAttempts = 0
          this.initialized = true
          this.startPingInterval()
        }

      } catch (error) {
        this.logWithDetails('error', '初始化WebSocket失败', {
          error,
          hasToken: !!this.token,
          connectionId: this.connectionId
        })
        this.reconnect()
      }
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.onopen = () => {
      this.logWithDetails('info', '连接成功', {
        protocol: this.socket?.protocol,
        extensions: this.socket?.extensions
      })
      this.reconnectAttempts = 0

      // 连接成功后发送认证消息
      if (this.token) {
        this.emit('authenticate', {
          authorization: `Bearer ${this.token}`
        })
      }
    }

    this.socket.onclose = (event) => {
      this.logWithDetails('warn', '连接断开', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        reconnectAttempt: this.reconnectAttempts + 1
      })
      this.stopPingInterval()
      this.reconnect()
    }

    this.socket.onerror = (error) => {
      this.logWithDetails('error', '连接错误', {
        error,
        readyState: this.socket?.readyState,
        bufferedAmount: this.socket?.bufferedAmount
      })
    }

    this.socket.onmessage = (event) => {
      this.handleMessage(event)
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      this.logWithDetails('info', '收到原始消息', {
        data: event.data,
        connectionId: this.connectionId
      })

      let message: WebSocketMessage<MessageData>
      
      try {
        const parsedData = JSON.parse(event.data)
        
        if (parsedData.event && 'data' in parsedData) {
          message = parsedData
        } else {
          message = {
            event: 'message',
            data: parsedData
          }
        }
      } catch (parseError) {
        message = {
          event: 'message',
          data: {
            content: event.data,
            type: 'raw'
          }
        }
      }

      this.logWithDetails('info', '处理标准格式消息', {
        event: message.event,
        data: message.data,
        connectionId: this.connectionId
      })

      // 触发事件监听器
      const listeners = this.listeners.get(message.event)
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(message.data)
          } catch (error) {
            this.logWithDetails('error', '消息处理回调执行失败', {
              error,
              event: message.event,
              data: message.data
            })
          }
        })
      }
    } catch (error) {
      this.logWithDetails('error', '消息处理失败', {
        error,
        rawData: event.data,
        connectionId: this.connectionId
      })
    }
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.emit('ping', { timestamp: Date.now() })
      }
    }, this.pingTimeout)
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 5000)

      this.logWithDetails('warn', '准备重新连接', {
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        delay,
        hasToken: !!this.token,
        nextAttemptAt: new Date(Date.now() + delay).toISOString()
      })

      // 确保在重连前清理旧的连接
      if (this.socket) {
        this.socket.onclose = null // 防止触发原有的 onclose 处理
        this.socket.onerror = null
        this.socket.close()
        this.socket = null
      }

      setTimeout(() => {
        this.logWithDetails('info', '执行重连', {
          attempt: this.reconnectAttempts,
          hasToken: !!this.token
        })

        // 重置初始化状态
        this.initialized = false

        // 重新初始化连接
        this.initialize(this.token || undefined)

        // 添加重连成功检查
        const checkConnection = setInterval(() => {
          if (this.isConnected()) {
            this.logWithDetails('info', '重连成功', {
              attempt: this.reconnectAttempts,
              socketId: this.socket?.url
            })
            clearInterval(checkConnection)
            this.reconnectAttempts = 0 // 重置重连计数
          }
        }, 1000)

        // 60秒后如果还没连接成功，清除检查
        setTimeout(() => {
          if (!this.isConnected()) {
            clearInterval(checkConnection)
            this.logWithDetails('error', '重连检查超时', {
              attempt: this.reconnectAttempts
            })
            this.reconnect() // 尝试下一次重连
          }
        }, 60000)

      }, delay)
    } else {
      this.logWithDetails('error', '达到最大重连次数', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        hasToken: !!this.token
      })

      // 重置重连次数，允许用户手动重试
      setTimeout(() => {
        this.reconnectAttempts = 0
      }, 60000) // 1分钟后重置
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)
  }

  emit(event: string, data: MessageData): boolean {
    if (!this.isConnected()) {
      this.logWithDetails('error', '无法发送消息 - 连接未建立')
      return false
    }

    try {
      const message: WebSocketMessage<MessageData> = {
        event,
        data: {
          ...data,
          timestamp: Date.now()
        }
      }

      this.logWithDetails('info', '发送消息', {
        event,
        data: message.data,
        connectionId: this.connectionId,
        messageSize: JSON.stringify(message).length
      })

      this.socket?.send(JSON.stringify(message))
      return true
    } catch (error) {
      this.logWithDetails('error', '发送消息失败', {
        error,
        event,
        data,
        connectionId: this.connectionId
      })
      return false
    }
  }

  disconnect() {
    if (this.socket) {
      this.logWithDetails('info', '开始清理WebSocket连接', {
        hasToken: !!this.token
      })

      this.stopPingInterval()
      this.listeners.clear()
      this.token = null

      this.socket.close()
      this.socket = null
      this.initialized = false

      this.logWithDetails('info', 'WebSocket清理完成')
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  getSocket(): WebSocket | null {
    return this.socket
  }

  private logWithDetails(level: 'info' | 'warn' | 'error', message: string, details?: any) {
    const logData = {
      message,
      socketId: this.socket?.url,
      connectionState: this.socket?.readyState,
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
}

export const socketManager = SocketManager.getInstance()
