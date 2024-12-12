// 地区选择值接口
export interface AreaSelectValue {
  addrId: number | string
  name: string
  code?: string
}

// 地址接口
export interface Address {
  addrId: number
  receiver: string
  mobile: string
  email: string
  countryId: number
  country: string
  provinceId: number
  province: string
  cityId: number
  city: string
  postCode: string
  addr: string
  addr2?: string
  commonAddr: number // 是否默认地址 1:是 0:否
  createTime: string
  updateTime: string
  isDefault: number
}

// 地址表单数据接口
export interface AddressFormData {
  addrId: number
  receiver: string
  mobile: string
  email: string
  country: AreaSelectValue | null
  province: AreaSelectValue | null
  city: AreaSelectValue | null
  postCode: string
  addr: string
  addr2?: string
  isDefault: number
}

// 地址提交数据接口
export interface AddressSubmitData {
  addrId: string | number
  receiver: string
  countryId: number
  provinceId: number
  cityId: number
  country: string
  province: string
  city: string
  areaId: number
  area: string
  postCode: string
  addr: string
  addr2?: string
  mobile: string
  email: string
  status: number
  isDefault: number
  createTime?: string
  version?: number
  updateTime?: string
}

// 地址API响应接口
export interface AddressResponse {
  code: number
  msg: string
  data: Address
}

// 地址列表API响应接口
export interface AddressListResponse {
  code: number
  msg: string
  data: Address[]
}
