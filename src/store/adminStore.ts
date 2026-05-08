import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminState {
  isAdminAuthenticated: boolean
  adminToken: string | null
  setAdminToken: (token: string) => void
  adminLogout: () => void
}

const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdminAuthenticated: false,
      adminToken: null,
      setAdminToken: (token) => set({ adminToken: token, isAdminAuthenticated: true }),
      adminLogout: () => set({ adminToken: null, isAdminAuthenticated: false }),
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({ adminToken: state.adminToken }),
      onRehydrateStorage: () => (state) => {
        if (state?.adminToken) {
          state.isAdminAuthenticated = true
        }
      },
    }
  )
)

export default useAdminStore
