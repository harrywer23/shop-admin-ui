export interface AlipayFormData {
  [key: string]: string | number
}

export interface PaymentResponse {
  code: number
  msg: string
  data: {
    payUrl: string
    formData?: AlipayFormData
  }
} 