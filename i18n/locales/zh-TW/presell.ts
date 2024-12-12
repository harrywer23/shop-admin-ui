export default {
  title: '預售訂單',
  payment: {
    title: '預售訂單付款',
    orderInfo: '訂單資訊',
    orderNumber: '訂單編號',
    productName: '商品名稱',
    quantity: '數量',
    totalAmount: '總金額',
    depositAmount: '訂金金額',
    finalAmount: '尾款金額',
    method: '付款方式',
    payDeposit: '支付訂金',
    payFinal: '支付尾款',
    notice: '付款說明',
    notices: {
      deposit: '支付訂金後訂單將進入生產階段',
      final: '支付尾款後商品將安排出貨',
      refund: '訂金支付後若取消訂單將扣除訂金作為違約金',
      support: '如有問題請聯繫客服'
    },
    error: {
      loadFailed: '取得訂單資訊失敗',
      payFailed: '付款失敗'
    }
  },
  status: {
    unpaidDeposit: '待付訂金',
    unpaidFinal: '待付尾款',
    paid: '已付款',
    shipped: '已出貨',
    completed: '已完成',
    cancelled: '已取消'
  },
  detail: {
    title: '預售訂單詳情',
    activityInfo: '預售活動資訊',
    activityName: '活動名稱',
    depositStartTime: '訂金付款開始時間',
    depositEndTime: '訂金付款結束時間',
    finalStartTime: '尾款付款開始時間',
    finalEndTime: '尾款付款結束時間',
    deliveryTime: '預計出貨時間',
    productInfo: '商品資訊',
    depositAmount: '訂金金額',
    finalAmount: '尾款金額',
    totalAmount: '總金額',
    orderInfo: '訂單資訊',
    orderNumber: '訂單編號',
    createTime: '建立時間',
    status: '訂單狀態',
    depositPayTime: '訂金付款時間',
    finalPayTime: '尾款付款時間',
    receiveTime: '收貨時間',
    deliveryInfo: '收貨資訊',
    receiver: '收貨人',
    mobile: '聯絡電話',
    address: '收貨地址',
    error: {
      loadFailed: '載入訂單資訊失敗'
    }
  },
  orders: {
    payDeposit: '支付訂金',
    payFinal: '支付尾款',
    detail: '訂單詳情',
    deleteConfirm: '刪除預售訂單',
    deleteMessage: '確定要刪除此預售訂單嗎？刪除後將無法復原。',
    deleteSuccess: '預售訂單刪除成功',
    deleteFailed: '刪除預售訂單失敗',
    title: '預售訂單列表'
  }
} 