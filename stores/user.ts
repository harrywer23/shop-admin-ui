import { defineStore } from 'pinia'

interface UserState {
  someState: string
}

export const useUserStore = defineStore({
  id: 'user',
  state: (): UserState => ({
    someState: ''
  }),
  
  persist: process.client ? {
    storage: localStorage,
    paths: ['someState']
  } : undefined
}) 