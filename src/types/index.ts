export interface ToolDefinition {
  id: string
  name: string
  description: string
  category: ToolCategory
  path: string
  icon: string
  keywords?: string[]
  isCrypto?: boolean
}

export type ToolCategory =
  | 'Formatters'
  | 'Viewers'
  | 'Encoders'
  | 'Crypto'
  | 'Generators'
  | 'Converters'
  | 'Testers'

export interface UIStore {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  recentTools: string[]
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleSidebar: () => void
  addRecentTool: (toolId: string) => void
}
