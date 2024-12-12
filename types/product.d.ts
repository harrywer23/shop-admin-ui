// 商品相关接口定义
export interface ProductIntro {
    prodId: string | number // 商品ID
    skuId: string | number // 商品ID
    prodName: string // 商品名称
    title: string //  名称
    stocks: number // 库存
    imgUrl: string // 商品主图
    oriPrice: number // 原价
    price: number // 现价
    prodType: number // 商品类型 1:普通商品 2:预售商品 3:团购商品 4:秒杀商品
    intro?: string // 简介
    status: number // 商品状态 0:下架 1:上架
    categoryId?: number // 分类ID
    deliveryTemplateId?: number // 运费模板ID
  }

// 商品相关接口定义
export interface Product {
  prodId: string | number // 商品ID
  prodName: string // 商品名称
  totalStocks: number // 总库存
  pic: string // 商品主图
  imgs?: string // 商品图片，以,分割
  oriPrice: number // 原价
  price: number // 现价
  prodType: number // 商品类型 1:普通商品 2:预售商品 3:团购商品 4:秒杀商品
  brief?: string // 商品简介
  content?: string // 商品详情
  status: number // 商品状态 0:下架 1:上架
  categoryId?: number // 分类ID
  soldNum?: number // 销量
  deliveryMode?: string // 配送方式
  deliveryTemplateId?: number // 运费模板ID

  // 预售相关
  presellStatus?: boolean // 是否预售
  presellPrice?: number // 预售价格
  presellDeposit?: number // 预售定金
  presellFinalPayment?: number // 预售尾款
  presellStartTime?: string // 预售开始时间
  presellEndTime?: string // 预售结束时间
  presellDeliveryTime?: string // 预售发货时间
  presellFinalStartTime?: string // 尾款支付开始时间
  presellFinalEndTime?: string // 尾款支付结束时间
  groupPrice?: number // 团购价格
  groupMinNum?: number // 最低成团人数
  groupJoinedNum?: number // 已参团人数
  seckillPrice?: number // 秒杀价格
  seckillStartTime?: string // 秒杀开始时间
  seckillEndTime?: string // 秒杀结束时间
  isVirtual?:number
  isSkuItem?: number
  weight?: number
  volume?: number
  translations:string
  prodCode?:string
}

// SKU相关接口定义
export interface Sku {
  skuId: string | number // SKU ID
  prodId: string | number // 商品ID
  prodType: number // 商品类型 1:普通商品 2:预售商品 3:团购商品 4:秒杀商品
  skuName: string // SKU名称
  properties: string // 规格属性组合
  oriPrice: number // 原价
  price: number // 现价
  stocks: number // 库存锁定数
  actualStocks: number // 实际库存
  pic?: string // SKU图片
  weight?: number // 重量
  volume?: number // 体积
  status: number // 状态 0:禁用 1:启用
  translations:Translations

  // 预售相关
  presellStatus?: number // 是否预售
  presellPrice?: number // 预售价格
  presellDeposit?: number // 预售定金
  presellFinalPayment?: number // 预售尾款
  groupPrice?: number // 团购价格
  groupMinNum?: number // 最低成团人数
  groupJoinedNum?: number // 已参团人数
  seckillPrice?: number // 秒杀价格
  isVirtual?: number
}

// 规格属性相关接口定义
export interface PropValue {
  valueId: string | number // 属性值ID
  propValue: string // 属性值
  propId: string | number // 属性ID
  translations:Translations
}

export interface Prop {
  propId: string | number // 属性ID
  translations:Translations
  propName: string // 属性名称
  values: PropValue[] // 属性值列表
}

// 商品详情接口定义
export interface ProductDetail extends Product {
  propList?: Prop[] // 规格列表
  skuList?: Sku[] // SKU列表
  tagList?: any[] // 标签列表
}

// 购物车项接口定义
export interface CartItem {
  skuId?: string | number // SKU ID
  prodId: string | number // 商品ID
  count: number // 数量
  price: number // 价格
  presellStatus?: boolean // 是否预售
  presellPrice?: number // 预售价格
  presellDeposit?: number // 预售定金
}

// 地区选项接口
export interface AreaOption {
  id: number | string
  name: string
  code: string
  level: number
  parentId: number | string
}
