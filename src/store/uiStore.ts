import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeLectureId: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveLecture: (id: string | null) => void;
}

const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  activeLectureId: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveLecture: (id) => set({ activeLectureId: id }),
}));

export default useUIStore;
