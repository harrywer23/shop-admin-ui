import { ProductType } from '~/utils/constants'
import type {Address} from "~/types/address";

// 商品相关接口
export interface CheckoutProduct {
  prodId: number
  prodName: string
  price: number
  pic: string
  skuNum: number
  prodType: ProductType
  isVirtual: number
  presellStatus?: number
  presellPrice?: number
  presellDeposit?: number
  groupPrice?: number
  groupMinNum?: number
  seckillPrice?: number
  categoryId?: number
}

// SKU相关接口
export interface CheckoutSku {
  skuId: number
  prodId: number
  skuName: string
  price: number
  pic: string
  properties: string
  prodType: ProductType
  isVirtual: number
  presellStatus?: number
  presellPrice?: number
  presellDeposit?: number
  groupPrice?: number
  groupMinNum?: number
  seckillPrice?: number
}

// 结算项接口
export interface CheckoutItem {
  prodId: string | number
  skuId?: string | number
  prodName: string
  translations:String
  price: number
  quantity: number
  pic: string
  properties?: string
  presellStatus?: number
  presellPrice?: number
  presellDeposit?: number
  prodType: ProductType
  groupPrice?: number
  groupMinNum?: number
  seckillPrice?: number
  isVirtual?: number
  categoryId?: number
  basketCount?: number
}

// 优惠券接口
export interface Coupon {
  couponId: number
  title: string
  couponType: number // 1:满减 2:折扣
  discount: number
  minAmount: number
  maxDiscount?: number
  startTime: string
  endTime: string
  status: number
}

// 订单金额接口
export interface OrderAmount {
  subtotal: number
  shippingFee: number
  discount: number
  couponDiscount: number
}

// 订单提交数据接口
export interface OrderSubmitData {
  items: CheckoutItem[]
  address: Address | null
  paymentMethod: string
  isPresell: boolean
  totalAmount: string
  remark: string
  isVirtual: boolean
  from: string
}
