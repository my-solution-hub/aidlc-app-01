import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  sidebarOpen: boolean;
  darkMode: boolean;
  language: string;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      darkMode: false,
      language: '',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setLanguage: (lang: string) => set({ language: lang }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ darkMode: state.darkMode, language: state.language }),
    },
  ),
);
