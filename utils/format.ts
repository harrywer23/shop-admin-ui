/**
 * 格式化日期
 * @param date 日期字符串
 * @param format 格式化模板，默认 YYYY-MM-DD HH:mm:ss
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}
// 添加日期格式化函数
export function formatToDateTime(date: string | null): string {
  if (!date) return ''

  const d = new Date(date)

  // 格式化年月日
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  // 格式化时分秒
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化金额
 * @param amount 金额
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的金额字符串
 */
export function formatAmount(amount: number | string, decimals: number = 2): string {
  const num = Number(amount)
  if (isNaN(num)) return '0.00'
  return num.toFixed(decimals)
}

/**
 * 格式化优惠券金额
 * @param coupon 优惠券对象
 * @returns 格式化后的优惠券金额描述
 */
export function formatCouponAmount(coupon: { couponType: number; discount: number }): string {
  if (coupon.couponType === 1) {
    // 满减券
    return `¥${formatAmount(coupon.discount)}`
  } else {
    // 折扣券
    return `${(coupon.discount * 10).toFixed(1)}折`
  }
}

/**
 * 格式化优惠券使用条件
 * @param coupon 优惠券对象
 * @returns 格式化后的使用条件描述
 */
export function formatCouponCondition(coupon: { minAmount: number }): string {
  if (coupon.minAmount > 0) {
    return `满${formatAmount(coupon.minAmount)}可用`
  }
  return '无门槛'
}

/**
 * 将上海时间（UTC+8）转换为本地时间
 * @param shanghaiTime 上海时间字符串 (格式: YYYY-MM-DD HH:mm:ss)
 * @returns 本地时间字符串 (格式: YYYY-MM-DD HH:mm:ss)
 */
export function shanghaiToLocal(shanghaiTime: string): string {
  if (!shanghaiTime) return ''
  
  // 解析上海时间字符串
  const [datePart, timePart] = shanghaiTime.split(' ')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute, second] = timePart.split(':').map(Number)
  
  // 创建上海时间的Date对象 (UTC+8)
  const shanghaiDate = new Date(Date.UTC(year, month - 1, day, hour - 8, minute, second))
  
  // 转换为本地时间
  const localYear = shanghaiDate.getFullYear()
  const localMonth = String(shanghaiDate.getMonth() + 1).padStart(2, '0')
  const localDay = String(shanghaiDate.getDate()).padStart(2, '0')
  const localHour = String(shanghaiDate.getHours()).padStart(2, '0')
  const localMinute = String(shanghaiDate.getMinutes()).padStart(2, '0')
  const localSecond = String(shanghaiDate.getSeconds()).padStart(2, '0')
  
  return `${localYear}-${localMonth}-${localDay} ${localHour}:${localMinute}:${localSecond}`
}

/**
 * 将本地时间转换为上海时间（UTC+8）
 * @param localTime 本地时间字符串 (格式: YYYY-MM-DD HH:mm:ss)
 * @returns 上海时间字符串 (格式: YYYY-MM-DD HH:mm:ss)
 */
export function localToShanghai(localTime: string): string {
  if (!localTime) return ''
  
  // 解析本地时间字符串
  const [datePart, timePart] = localTime.split(' ')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute, second] = timePart.split(':').map(Number)
  
  // 创建本地时间的Date对象
  const localDate = new Date(year, month - 1, day, hour, minute, second)
  
  // 获取与UTC的时差（分钟）
  const timezoneOffset = localDate.getTimezoneOffset()
  
  // 调整到上海时间 (UTC+8)
  const shanghaiDate = new Date(localDate.getTime() + (timezoneOffset + 480) * 60000)
  
  // 格式化上海时间
  const shanghaiYear = shanghaiDate.getFullYear()
  const shanghaiMonth = String(shanghaiDate.getMonth() + 1).padStart(2, '0')
  const shanghaiDay = String(shanghaiDate.getDate()).padStart(2, '0')
  const shanghaiHour = String(shanghaiDate.getHours()).padStart(2, '0')
  const shanghaiMinute = String(shanghaiDate.getMinutes()).padStart(2, '0')
  const shanghaiSecond = String(shanghaiDate.getSeconds()).padStart(2, '0')
  
  return `${shanghaiYear}-${shanghaiMonth}-${shanghaiDay} ${shanghaiHour}:${shanghaiMinute}:${shanghaiSecond}`
}
