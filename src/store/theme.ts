import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'simple', // 默认主题
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage', // localStorage 的 key
    }
  )
); 