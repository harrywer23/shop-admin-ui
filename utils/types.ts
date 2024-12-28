// 聊天室类型
export enum ChatRoomType {
  PRIVATE = 'private',   // 私聊
  GROUP = 'group',       // 群聊
  SYSTEM = 'system'      // 系统消息
}

// 用户类型
export enum UserType {
  USER = 0,    // 普通用户
  SYSTEM = 1 // 系统用户
}

// 添加消息内容类型枚举
export enum ContentType {
  TEXT = 0,    // 文本
  IMAGE = 1,   // 图片
  FILE = 2,    // 文件
  VOICE = 3    // 语音
}

// 添加房间类型枚举
export enum RoomType {
  PRIVATE = 1,  // 私聊
  GROUP = 2,    // 群聊
  SERVICE = 3   // 客服
}

// 修改发送者类型枚举值
export enum SenderType {
  USER = 'user',    // 普通用户
  SYSTEM = 'system' // 系统用户
}

// 消息数据接口
export interface ChatMessageData {
  id: number;          // 消息内容
  content: string;          // 消息内容
  senderId: string;      // 发送者ID
  senderName: string;    // 发送者名称
  senderUserType: UserType;    // 发送者类型
  receiverId?: string;   // 接收者ID（私聊时必填）
  receiverName?: string; // 接收者名称（私聊时必填）
  receiverUserType?: UserType; // 接收者用户类型
  roomId: string;        // 聊天室ID
  roomType: number;      // 聊天室类型
  contentType: number;   // 内容类型
  sendTime: Date;           // 发送时间
  status: number;
}

export interface User {
  id: string
  name: string
  avatar?: string
  userType?: UserType
  status?: string
}

export interface Contact extends User {
  status: string
  type: RoomType     // 房间类型
  userType: UserType // 用户类型
}

// 添加聊天房间相关的类型定义
export interface ChatRoom {
  id: number;
  name: string;
  type: number;
  creatorId: string;
  status: number;
  creatorName: string;
  creatorType: UserType;
  updateTime: string;
  avatar: string;
  announcement: string;
  targetType: UserType;
  targetId:String;
  joinType: number;
  muteAll: number;
  muteEndTime: string;
}

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  total: number;
  succ: boolean;
  fail: boolean;
}

