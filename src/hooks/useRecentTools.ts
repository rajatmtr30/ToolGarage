import { useUIStore } from '@/store/uiStore'
import { TOOLS } from '@/routes'

export function useRecentTools() {
  const { recentTools, addRecentTool } = useUIStore()
  const recent = recentTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean)

  return { recent, addRecentTool }
}
