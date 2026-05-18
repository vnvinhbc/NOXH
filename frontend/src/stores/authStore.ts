import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserResponse } from '@/types'

interface AuthState {
  accessToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  hasHydrated: boolean
  setHasHydrated: (hasHydrated: boolean) => void
  setAuth: (accessToken: string, authInfo: { userId: string; fullName: string; email: string; role: string }) => void
  setUser: (user: UserResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setAuth: (accessToken, authInfo) =>
        set({
          accessToken,
          user: {
            id: authInfo.userId,
            fullName: authInfo.fullName,
            email: authInfo.email,
            role: authInfo.role,
            isVerified: false,
            kycStatus: 'PENDING',
            createdAt: new Date().toISOString(),
          } as UserResponse,
          isAuthenticated: true,
        }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'noxh-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
