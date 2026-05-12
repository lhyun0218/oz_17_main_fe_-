import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProfessorState {
  isProfessorAuthenticated: boolean
  professorToken: string | null
  professorName: string | null
  setProfessorAuth: (token: string, name: string) => void
  professorLogout: () => void
}

const useProfessorStore = create<ProfessorState>()(
  persist(
    (set) => ({
      isProfessorAuthenticated: false,
      professorToken: null,
      professorName: null,
      setProfessorAuth: (token, name) =>
        set({ professorToken: token, professorName: name, isProfessorAuthenticated: true }),
      professorLogout: () =>
        set({ professorToken: null, professorName: null, isProfessorAuthenticated: false }),
    }),
    {
      name: 'professor-storage',
      partialize: (state) => ({
        professorToken: state.professorToken,
        professorName: state.professorName,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.professorToken) {
          state.isProfessorAuthenticated = true
        }
      },
    }
  )
)

export default useProfessorStore
