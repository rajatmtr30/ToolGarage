import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UIStore } from '@/types'

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      recentTools: [],
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      addRecentTool: (toolId) =>
        set((s) => ({
          recentTools: [toolId, ...s.recentTools.filter((t) => t !== toolId)].slice(0, 8),
        })),
    }),
    {
      name: 'toolgarage-ui',
      partialize: (s) => ({
        theme: s.theme,
        sidebarCollapsed: s.sidebarCollapsed,
        recentTools: s.recentTools,
      }),
    }
  )
)
