import { ProductType } from '~/utils/constants'
import type {CheckoutItem, CheckoutProduct, CheckoutSku} from "~/types/checkout";
import type {Product, Sku} from "~/types/product";

/**
 * 从商品创建结算项
 */
function createCheckoutItemFromProduct(product: CheckoutProduct, quantity: number): CheckoutItem {
  return {
    prodId: product.prodId,
    prodName: product.prodName,
    price: calculatePrice(product),
    quantity,
    pic: product.pic,
    presellStatus: product.presellStatus,
    presellPrice: product.presellPrice,
    presellDeposit: product.presellDeposit,
    prodType: product.prodType,
    groupPrice: product.groupPrice,
    groupMinNum: product.groupMinNum,
    seckillPrice: product.seckillPrice,
    isVirtual: product.isVirtual
  }
}

/**
 * 从SKU创建结算项
 */
function createCheckoutItemFromSku(sku: Sku, product: Product, quantity: number): CheckoutItem {
  return {
    prodId: sku.prodId,
    skuId: sku.skuId,
    prodName: product.prodName,
    price: calculatePrice(sku),
    quantity,
    pic: sku.pic || product.pic,
    properties: sku.properties,
    presellStatus: sku.presellStatus,
    presellPrice: sku.presellPrice,
    presellDeposit: sku.presellDeposit,
    prodType: sku.prodType,
    groupPrice: sku.groupPrice,
    groupMinNum: sku.groupMinNum,
    seckillPrice: sku.seckillPrice,
    isVirtual: sku.isVirtual
  }
}


/**
 * 验证结算项
 * @param item 结算项
 * @returns 验证结果和错误信息
 */
export function validateCheckoutItem(item: CheckoutItem): { valid: boolean; message?: string } {
  // 验证基本信息
  if (!item.prodId || !item.prodName || !item.price || !item.quantity) {
    return { valid: false, message: '商品信息不完整' }
  }

  // 验证数量
  if (item.quantity < 1) {
    return { valid: false, message: '商品数量必须大于0' }
  }

  // 验证预售信息
  if (item.prodType === ProductType.PRESELL) {
    if (typeof item.presellStatus === 'undefined') {
      return { valid: false, message: '预售商品状态缺失' }
    }
    if (!item.presellPrice) {
      return { valid: false, message: '预售价格缺失' }
    }
  }

  // 验证团购信息
  if (item.prodType === ProductType.GROUP) {
    if (!item.groupPrice) {
      return { valid: false, message: '团购价格缺失' }
    }
    if (!item.groupMinNum || item.groupMinNum < 2) {
      return { valid: false, message: '最低成团人数必须大于等于2' }
    }
  }

  // 验证秒杀信息
  if (item.prodType === ProductType.SECKILL && !item.seckillPrice) {
    return { valid: false, message: '秒杀价格缺失' }
  }

  return { valid: true }
}

/**
 * 处理直接购买结账
 */
export async function handleDirectCheckout(
    prodId: string | number,
    skuId?: string | number,
    quantity: number = 1
): Promise<CheckoutItem[]> {
  try {
    // 获取商品信息
    const prodResponse = await fetch(`/api/prod/detail?id=${prodId}`)
    const prodData = await prodResponse.json()

    if (prodData.code !== 200) {
      throw new Error(prodData.msg || '获取商品信息失败')
    }

    const product = prodData.data as CheckoutProduct

    // 如果商品有SKU且提供了SKU ID
    if (product.skuNum > 0 && skuId) {
      const skuResponse = await fetch(`/api/sku/detail?id=${skuId}`)
      const skuData = await skuResponse.json()

      if (skuData.code !== 200) {
        throw new Error(skuData.msg || '获取SKU信息失败')
      }

      const sku = skuData.data as CheckoutSku

      return [{
        prodId: product.prodId,
        skuId: sku.skuId,
        prodName: product.prodName,
        price: calculatePrice(sku),
        quantity,
        pic: sku.pic || product.pic,
        properties: sku.properties,
        presellStatus: sku.presellStatus,
        presellPrice: sku.presellPrice,
        presellDeposit: sku.presellDeposit,
        prodType: sku.prodType,
        groupPrice: sku.groupPrice,
        groupMinNum: sku.groupMinNum,
        seckillPrice: sku.seckillPrice,
        isVirtual: sku.isVirtual,
        categoryId: product.categoryId
      }]
    }

    // 无SKU商品
    return [{
      prodId: product.prodId,
      prodName: product.prodName,
      price: calculatePrice(product),
      quantity,
      pic: product.pic,
      presellStatus: product.presellStatus,
      presellPrice: product.presellPrice,
      presellDeposit: product.presellDeposit,
      prodType: product.prodType,
      groupPrice: product.groupPrice,
      groupMinNum: product.groupMinNum,
      seckillPrice: product.seckillPrice,
      isVirtual: product.isVirtual,
      categoryId: product.categoryId
    }]
  } catch (error) {
    console.error('处理直接购买结账失败:', error)
    throw error
  }
}

/**
 * 处理购物车结账
 */
export async function handleCartCheckout(cartItems: any[]): Promise<CheckoutItem[]> {
  try {
    const checkoutItems = await Promise.all(cartItems.map(async (item) => {
      const prodResponse = await fetch(`/api/prod/detail?id=${item.prodId}`)
      const prodData = await prodResponse.json()

      if (prodData.code !== 200) {
        throw new Error(prodData.msg || '获取商品信息失败')
      }

      const product = prodData.data as CheckoutProduct

      if (product.skuNum > 0 && item.skuId) {
        const skuResponse = await fetch(`/api/sku/detail?id=${item.skuId}`)
        const skuData = await skuResponse.json()

        if (skuData.code !== 200) {
          throw new Error(skuData.msg || '获取SKU信息失败')
        }

        const sku = skuData.data as CheckoutSku

        return {
          prodId: product.prodId,
          skuId: sku.skuId,
          prodName: product.prodName,
          price: calculatePrice(sku),
          quantity: item.quantity,
          pic: sku.pic || product.pic,
          properties: sku.properties,
          presellStatus: sku.presellStatus,
          presellPrice: sku.presellPrice,
          presellDeposit: sku.presellDeposit,
          prodType: sku.prodType,
          groupPrice: sku.groupPrice,
          groupMinNum: sku.groupMinNum,
          seckillPrice: sku.seckillPrice,
          isVirtual: sku.isVirtual,
          categoryId: product.categoryId
        }
      }

      return {
        prodId: product.prodId,
        prodName: product.prodName,
        price: calculatePrice(product),
        quantity: item.quantity,
        pic: product.pic,
        presellStatus: product.presellStatus,
        presellPrice: product.presellPrice,
        presellDeposit: product.presellDeposit,
        prodType: product.prodType,
        groupPrice: product.groupPrice,
        groupMinNum: product.groupMinNum,
        seckillPrice: product.seckillPrice,
        isVirtual: product.isVirtual,
        categoryId: product.categoryId
      }
    }))

    return checkoutItems
  } catch (error) {
    console.error('处理购物车结账失败:', error)
    throw error
  }
}

/**
 * 根据商品类型计算价格
 */
function calculatePrice(item: CheckoutProduct | CheckoutSku): number {
  switch (item.prodType) {
    case ProductType.PRESELL:
      if (item.presellStatus === 1) {
        return item.presellDeposit || (item.presellPrice || 0) * 0.3
      }
      return item.presellPrice || item.price

    case ProductType.GROUP:
      return item.groupPrice || item.price

    case ProductType.SECKILL:
      return item.seckillPrice || item.price

    default:
      return item.price
  }
}

/**
 * 计算商品总价
 */
export function calculateItemTotal(item: CheckoutItem): string {
  return (item.price * item.quantity).toFixed(2)
}

/**
 * 计算订单总价
 */
export function calculateOrderTotal(items: CheckoutItem[]): string {
  const total = items.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)
  return total.toFixed(2)
}

/**
 * 判断是否为虚拟订单
 */
export function isVirtualOrder(items: CheckoutItem[]): boolean {
  return items.every(item => item.isVirtual === 1)
}
