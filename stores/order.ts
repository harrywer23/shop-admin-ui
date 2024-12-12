import { defineStore } from 'pinia'
import type {OrderInfo} from "~/types/order";

export const useOrderStore = defineStore('order', {
  state: () => ({
    currentOrder: null as OrderInfo | null,
    loading: false
  }),

  actions: {
    setCurrentOrder(orderInfo: OrderInfo) {
      this.currentOrder = orderInfo
    },

    clearCurrentOrder() {
      this.currentOrder = null
    },

    async createOrder(orderData: any) {
      this.loading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        // 这里应该调用实际的创建订单API
        //console.log('Creating order with data:', orderData)
        return {
          success: true,
          orderId: 'ORDER' + Date.now()
        }
      } catch (error) {
        console.error('创建订单失败:', error)
        return {
          success: false,
          error: '创建订单失败'
        }
      } finally {
        this.loading = false
      }
    }
  }
})
