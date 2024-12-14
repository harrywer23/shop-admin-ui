// 商品类型枚举
export enum ProductType {
  NORMAL = 1,    // 普通商品
  PRESELL = 2,   // 预售商品
  GROUP = 3,     // 团购商品
  SECKILL = 4    // 秒杀商品
}

// 商品类型选项
export const PRODUCT_TYPE_OPTIONS = [
  { label: '普通商品', value: ProductType.NORMAL },
  { label: '预售商品', value: ProductType.PRESELL },
  { label: '团购商品', value: ProductType.GROUP },
  { label: '秒杀商品', value: ProductType.SECKILL }
]

// 商品状态
export enum ProductStatus {
  DRAFT = 0,     // 草稿
  PUBLISHED = 1, // 已发布
  OFFLINE = 2    // 已下架
}

// 商品状态选项
export const PRODUCT_STATUS_OPTIONS = [
  { label: '草稿', value: ProductStatus.DRAFT },
  { label: '已发布', value: ProductStatus.PUBLISHED },
  { label: '已下架', value: ProductStatus.OFFLINE }
]

// SKU状态
export enum SkuStatus {
  DISABLED = 0,  // 禁用
  ENABLED = 1    // 启用
}

// SKU状态选项
export const SKU_STATUS_OPTIONS = [
  { label: '禁用', value: SkuStatus.DISABLED },
  { label: '启用', value: SkuStatus.ENABLED }
]

// 订单状态
export enum OrderStatus {
  UNPAID = 1,      // 待付款
  PAID = 2,        // 已付款
  SHIPPED = 3,     // 已发货/待收货
  COMPLETED = 4,   // 已完成
  CANCELLED = 5,   // 已取消
  REFUNDING = 6,   // 退款中
  REFUNDED = 7 , // 已退款
  COMM =8    // 已退款
}

// 状态选项
export const orderStatusOptions = [
  { label: '待付款', value: OrderStatus.UNPAID },
  { label: '待发货', value: OrderStatus.PAID },
  { label: '待收货', value: OrderStatus.SHIPPED },
  { label: '已完成', value: OrderStatus.COMPLETED },
  { label: '已取消', value: OrderStatus.CANCELLED },
  { label: '退款中', value: OrderStatus.REFUNDING },
  { label: '已退款', value: OrderStatus.REFUNDED },
  { label: '已评论', value: OrderStatus.COMM }

]

export const getStatusLabel = (status: number) => {
  switch (status) {
    case OrderStatus.UNPAID: return '待付款'
    case OrderStatus.PAID: return '已付款'
    case OrderStatus.SHIPPED: return '已发货'
    case OrderStatus.COMPLETED: return '已完成'
    case OrderStatus.CANCELLED: return '已取消'
    case OrderStatus.REFUNDING: return '退款中'
    case OrderStatus.REFUNDED: return '已退款'
    case OrderStatus.COMM: return '已评论'
    default: return '未知状态'
  }
}

// 订单状态选项
export const ORDER_STATUS_OPTIONS = [
  { label: '待付款', value: OrderStatus.UNPAID },
  { label: '已付款', value: OrderStatus.PAID },
  { label: '已发货', value: OrderStatus.SHIPPED },
  { label: '已完成', value: OrderStatus.COMPLETED },
  { label: '已取消', value: OrderStatus.CANCELLED },
  { label: '退款中', value: OrderStatus.REFUNDING },
  { label: '已退款', value: OrderStatus.REFUNDED },
  { label: '已评论', value: OrderStatus.COMM }

]



// 支付方式
export enum PaymentMethod {
  BALANCE = 'balance',    // 余额支付
  ALIPAY = 'alipay',     // 支付宝
  WECHAT = 'wechat',     // 微信支付
  PAYPAL = 'paypal'      // PayPal
}

// 支付方式选项
export const PAYMENT_METHOD_OPTIONS = [
  { label: '余额支付', value: PaymentMethod.BALANCE },
  { label: '支付宝', value: PaymentMethod.ALIPAY },
  { label: '微信支付', value: PaymentMethod.WECHAT },
  { label: 'PayPal', value: PaymentMethod.PAYPAL }
]

// API 相关常量
export const API_CONSTANTS = {
  BASE_URL: 'http://127.0.0.1:8098',
  // BASE_URL: 'https://admin.51x.uk',
  IMAGE_BASE_URL: 'https://image.aiavr.uk/xinshijie',
  TIMEOUT: 30000,
  MAX_RETRIES: 3
}

// 验证规则
export const VALIDATION_RULES = {
  username: [
    (val: string) => !!val || '请输入用户名',
    (val: string) => /^[a-zA-Z0-9]+$/.test(val) || '用户名只能包含字母和数字',
    (val: string) => val.length >= 5 && val.length <= 20 || '用户名长度必须在5-20个字符之间'
  ],
  password: [
    (val: string) => !!val || '请输入密码',
    (val: string) => val.length >= 5 && val.length <= 20 || '密码长度必须在5-20个字符之间'
  ],
  email: [
    (val: string) => !!val || '请输入邮箱',
    (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || '请输入正确的邮箱格式'
  ],
  phone: [
    (val: string) => !!val || '请输入手机号',
    (val: string) => /^[0-9-+]{5,20}$/.test(val) || '请输入正确的手机号格式'
  ],
  postCode: [
    (val: string) => !!val || '请输入邮政编码',
    (val: string) => /^[0-9a-zA-Z-]{3,10}$/.test(val) || '请输入正确的邮政编码格式'
  ]
}

// Cookie 相关常量
export const COOKIE_CONSTANTS = {
  TOKEN: {
    name: 'token',
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  },
  USER_INFO: {
    name: 'userInfo',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  },
  LANGUAGE: {
    name: 'user-language',
    maxAge: 60 * 60 * 24 * 365, // 1年
    path: '/'
  }
}

// 本地化相关常量
export const LOCALE_CONSTANTS = {
  DEFAULT: 'zh-CN',
  SUPPORTED: ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'],
  OPTIONS: [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
  ]
}

// 退款申请类型
export enum RefundApplyType {
  REFUND_ONLY = 1,    // 仅退款
  REFUND_WITH_RETURN = 2  // 退款退货
}

// 退款申请类型选项
export const REFUND_APPLY_TYPE_OPTIONS = [
  { label: '仅退款', value: RefundApplyType.REFUND_ONLY },
  { label: '退款退货', value: RefundApplyType.REFUND_WITH_RETURN }
]

// 退款状态
export enum RefundStatus {
  PENDING = 1,    // 待审核
  APPROVED = 2,   // 已同意
  REJECTED = 3    // 已拒绝
}

// 退款状态选项
export const REFUND_STATUS_OPTIONS = [
  { label: '待审核', value: RefundStatus.PENDING },
  { label: '已同意', value: RefundStatus.APPROVED },
  { label: '已拒绝', value: RefundStatus.REJECTED }
]

// 退款处理状态
export enum RefundMoneyStatus {
  PROCESSING = 0,   // 退款处理中
  SUCCESS = 1,      // 退款成功
  FAILED = -1       // 退款失败
}

// 退款处理状态选项
export const REFUND_MONEY_STATUS_OPTIONS = [
  { label: '退款处理中', value: RefundMoneyStatus.PROCESSING },
  { label: '退款成功', value: RefundMoneyStatus.SUCCESS },
  { label: '退款失败', value: RefundMoneyStatus.FAILED }
]

