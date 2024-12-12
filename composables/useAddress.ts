import { ref } from 'vue'
import type { Address, AddressSubmitData, AddressResponse, AddressListResponse } from '~/types/address'

export function useAddress() {
  const token = useCookie('token');
  const addresses = ref<Address[]>([])
  const selectedAddressId = ref<number | null>(null)
  const selectedAddress = ref<Address | null>(null)
  const loading = ref(false)

  // 加载地址列表
  async function loadAddresses() {
    loading.value = true
    try {
      const response = await api.get('/admin/userAddr/list');
      const data = await response.data as AddressListResponse

      if (data.code === 200) {
        addresses.value = data.data

        // 如果有默认地址,自动选中
        const defaultAddr = data.data.find((addr: Address) => addr.commonAddr === 1)
        if (defaultAddr) {
          selectedAddressId.value = defaultAddr.addrId
          selectedAddress.value = defaultAddr
        }
      } else {
        throw new Error(data.msg || '加载地址列表失败')
      }
    } catch (error) {
      console.error('加载地址列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 添加地址
  async function addAddress(addressData: AddressSubmitData) {
    try {
      console.log('添加地址前的数据:', addressData) // 添加调试日志

      // 确保所有必要的字段都存在
      const submitData = {
        ...addressData,
        // 确保地区名称字段存在
        country: addressData.country || '',
        province: addressData.province || '',
        city: addressData.city || '',
        // 确保ID字段为数字类型
        countryId: Number(addressData.countryId),
        provinceId: Number(addressData.provinceId),
        cityId: Number(addressData.cityId),
        // 其他必要字段
        status: 1,
        isDefault: addressData.isDefault || 0
      }

      console.log('准备提交的地址数据:', submitData) // 添加调试日志

      const response = await api.post('/admin/userAddr/add', submitData)
      const { code, msg, data } = response.data

      if (code === 200) {
        // 添加成功后刷新地址列表
        await loadAddresses()
        return data
      } else {
        throw new Error(msg || '保存地址失败')
      }
    } catch (error) {
      console.error('添加地址失败:', error)
      throw error
    }
  }

  // 更新地址
  async function updateAddress(addressData: AddressSubmitData) {
    try {
      console.log('更新地址前的数据:', addressData) // 添加调试日志

      // 确保所有必要的字段都存在
      const submitData = {
        ...addressData,
        // 确保地区名称字段存在
        country: addressData.country || '',
        province: addressData.province || '',
        city: addressData.city || '',
        // 确保ID字段为数字类型
        countryId: Number(addressData.countryId),
        provinceId: Number(addressData.provinceId),
        cityId: Number(addressData.cityId),
        // 其他必要字段
        status: 1,
        isDefault: addressData.isDefault || 0
      }

      console.log('准备更新的地址数据:', submitData) // 添加调试日志

      const response = await api.post('/admin/userAddr/update', submitData)
      const { code, msg, data } = response.data

      if (code === 200) {
        // 更新成功后刷新地址列表
        await loadAddresses()
        return data
      } else {
        throw new Error(msg || '更新地址失败')
      }
    } catch (error) {
      console.error('更新地址失败:', error)
      throw error
    }
  }

  // 删除地址
  async function deleteAddress(addrId: number): Promise<void> {
    try {
      const response = await api.get(`/admin/userAddr/delete/${addrId}`)

      const data = await response.data
      if (data.code !== 200) {
        throw new Error(data.msg || '删除地址失败')
      }

      await loadAddresses()
    } catch (error) {
      console.error('删除地址失败:', error)
      throw error
    }
  }

  // 设置默认地址
  async function setDefaultAddress(addrId: number): Promise<void> {
    try {
      const response = await api.get(`/admin/userAddr/default/${addrId}`)

      const data = await response.data
      if (data.code !== 200) {
        throw new Error(data.msg || '设置默认地址失败')
      }

      await loadAddresses()
    } catch (error) {
      console.error('设置默认地址失败:', error)
      throw error
    }
  }

  // 选择地址
  function selectAddress(address: Address) {
    //console.log('useAddress - 开始设置选择的地址:', address)
    //console.log('useAddress - 设置前 selectedAddressId:', selectedAddressId.value)
    //console.log('useAddress - 设置前 selectedAddress:', selectedAddress.value)

    selectedAddressId.value = address.addrId
    selectedAddress.value = address

    //console.log('useAddress - 设置后 selectedAddressId:', selectedAddressId.value)
    //console.log('useAddress - 设置后 selectedAddress:', selectedAddress.value)
  }

  return {
    addresses,
    selectedAddressId,
    selectedAddress,
    loading,
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    selectAddress
  }
}
