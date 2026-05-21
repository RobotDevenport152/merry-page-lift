import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  activeModal: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>(set => ({
  sidebarOpen: false,
  modalOpen: false,
  activeModal: null,
  setSidebarOpen: open => set({ sidebarOpen: open }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: id => set({ modalOpen: true, activeModal: id }),
  closeModal: () => set({ modalOpen: false, activeModal: null }),
}));
