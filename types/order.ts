export interface OrderItem {
    sku_id: number
    prodId: number
    prodName: string
    price: number
    quantity: number
    pic: string
    properties: Record<string, string>
    presellStatus?: number
    presellPrice?: number
    presellDeposit?: number
    presellFinalPayment?: number
}

export interface OrderInfo {
    items: OrderItem[]
    totalAmount: number
    depositAmount?: number
    finalAmount?: number
    isPresell: boolean
    deliveryTime?: string
}

// 订单取消申请状态
export enum CancelRequestStatus {
  PENDING = 1,   // 待审核
  APPROVED = 2, // 已批准
  REJECTED = 3  // 已拒绝
}

// 取消原因类型
export enum CancelReasonType {
  OUT_OF_STOCK = 'out_of_stock',     // 商品缺货
  PRICE_CHANGE = 'price_change',      // 价格变动
  DUPLICATE_ORDER = 'duplicate_order',// 重复下单
  OTHER = 'other'                     // 其他原因
}

// 订单取消申请
export interface OrderCancelRequest {
  id: string                     // 申请ID
  orderNumber: string            // 订单号
  orderId: string               // 订单ID
  userId: string                // 用户ID
  userName: string              // 用户名
  amount: number                // 订单金额
  reason: CancelReasonType      // 取消原因
  description: string           // 详细说明
  status: CancelRequestStatus   // 申请状态
  remark: string                // 审核备注
  createTime: string            // 申请时间
  updateTime: string            // 更新时间
  auditTime?: string           // 审核时间
  auditorId?: string           // 审核人ID
  auditorName?: string         // 审核人姓名
}

// 创建取消申请参数
export interface CreateCancelRequestParams {
  orderId: string              // 订单ID
  reason: CancelReasonType     // 取消原因
  description: string          // 详细说明
}

// 审核取消申请参数
export interface AuditCancelRequestParams {
  requestId: string           // 申请ID
  remark: string             // 审核备注
}
