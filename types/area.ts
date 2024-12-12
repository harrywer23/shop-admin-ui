// 地区选项接口
export interface AreaOption {
  value: string | number
  label: string
  children?: AreaOption[]
}

export interface CountryData {
  code: string
  name: string
  provinces: ProvinceData[]
}

export interface ProvinceData {
  code: string
  name: string
  cities: CityData[]
}

export interface CityData {
  code: string
  name: string
} 