export default {
  title: '定制订单',
  detail: {
    title: '定制订单详情',
    orderInfo: '订单信息',
    orderNumber: '订单编号',
    createTime: '创建时间',
    status: '订单状态',
    category: '定制类别',
    requirements: '定制需求',
    progress: '进度追踪',
    designs: '设计图/样品图',
    estimate: '价格预估',
    materialCost: '材料费用',
    laborCost: '人工费用',
    otherCost: '其他费用',
    totalCost: '总费用',
    confirmEstimate: '确认预估价格',
    noEstimate: '暂无价格预估',
    contact: '联系客服',
    estimateConfirmed: '已确认预估价格',
    error: {
      loadFailed: '获取订单信息失败',
      confirmFailed: '确认预估失败'
    }
  },
  status: {
    pending: '待审核',
    approved: '已审核',
    rejected: '已拒绝',
    deposit: '待付定金',
    production: '生产中',
    final: '待付尾款',
    shipping: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    unknown: '未知状态'
  },
  apply: {
    title: '定制申请',
    formTitle: '申请信息',
    name: '申请人姓名',
    contact: '联系方式',
    type: '定制类型',
    requirements: '需求描述',
    budgetMin: '最低预算',
    budgetMax: '最高预算',
    deadline: '期望交付时间',
    attachments: '附件',
    remark: '备注',
    success: '申请提交成功',
    error: {
      nameRequired: '请输入申请人姓名',
      contactRequired: '请输入联系方式',
      typeRequired: '请选择定制类型',
      requirementsRequired: '请输入需求描述',
      invalidBudget: '请输入有效的预算金额',
      budgetRange: '最高预算不能小于最低预算',
      submitFailed: '提交申请失败',
      uploadFailed: '上传失败，请重试'
    },
    form: {
      title: '申请标题',
      titleRequired: '请输入申请标题',
      category: '定制类型',
      categoryRequired: '请选择定制类型',
      description: '需求描述',
      descriptionRequired: '请描述您的定制需求',
      descriptionPlaceholder: '请详细描述您的定制需求，包括尺寸、材质、风格等具体要求',
      budget: '预算范围',
      budgetRequired: '请输入预算范围',
      budgetPlaceholder: '请输入您的预期预算范围',
      deadline: '期望交付时间',
      deadlineRequired: '请选择期望交付时间',
      reference: '参考图片',
      referenceDescription: '上传参考图片或设计稿（最多6张）',
      contact: '联系方式',
      contactRequired: '请输入联系方式',
      contactPlaceholder: '请输入您的联系电话或其他联系方式',
      remark: '备注说明',
      remarkPlaceholder: '其他需要说明的事项',
      type: '定制类型',
      applicationType: '申请类型',
      personalApplication: '个人申请',
      crowdfundingApplication: '众筹申请',
      targetAmount: '目标金额',
      minSupportAmount: '最低支持金额',
      startTime: '开始时间',
      endTime: '结束时间',
      rewards: '回报设置',
      rewardTitle: '回报标题',
      rewardAmount: '回报金额',
      rewardDescription: '回报描述',
      addReward: '添加回报'
    },
    progress: {
      title: '申请进度',
      submitted: '已提交',
      reviewing: '审核中',
      accepted: '已接受',
      inProgress: '制作中',
      completed: '已完成',
      draft: '草稿',
      pending: '待审核',
      processing: '处理中',
      approved: '已批准'
    },
    additionalRequirements: '其他要求',
    imageNote: '支持 jpg、png、gif 格式，单张图片不超过 5MB',
    uploadImages: '上传图片',
    referenceImages: '参考图片',
    expectedDeliveryDate: '预期交付日期',
    buttons: {
      submit: '提交申请',
      save: '保存草稿',
      cancel: '取消',
      uploadAttachment: '上传附件',
      deleteAttachment: '删除附件'
    }
  },
  type: {
    clothing: '服装定制',
    jewelry: '珠宝首饰',
    furniture: '家具定制',
    artwork: '艺术作品',
    other: '其他定制'
  },
  list: {
    title: '我的定制申请',
    empty: '暂无定制申请',
    filter: {
      all: '全部',
      pending: '待审核',
      inProgress: '进行中',
      completed: '已完成'
    },
    sort: {
      latest: '最新创建',
      earliest: '最早创建',
      deadline: '交付时间'
    }
  },
  error: {
    invalidTargetAmount: '请输入有效的目标金额',
    minTargetAmount: '目标金额不能低于1000',
    invalidMinSupportAmount: '请输入有效的最低支持金额',
    exceedTargetAmount: '最低支持金额不能超过目标金额',
    startTimeRequired: '请选择开始时间',
    endTimeRequired: '请选择结束时间',
    invalidEndTime: '结束时间必须晚于开始时间',
    rewardTitleRequired: '请输入回报标题',
    invalidRewardAmount: '请输入有效的回报金额',
    rewardDescriptionRequired: '请输入回报描述'
  },
  orders: {
    title: '定制订单列表'
  }
} 