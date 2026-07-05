import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'finlo_settings'

export const defaults = {
  displayName: 'Fin User',
  role: 'Task Master',
  email: 'fin@finlo.app',
  accentColor: '#00d4ff',
  theme: 'dark',          // 'dark' | 'light'
  compactView: false,
  notifDueToday: true,
  notifOverdue: true,
  notifCompleted: true,
  finTips: true,
  autoArchive: false,     // hide completed tasks older than 7 days
  defaultPriority: 'medium',
  defaultCategory: 'Work',
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaults, ...JSON.parse(saved) } : { ...defaults }
    } catch {
      return { ...defaults }
    }
  })

  // Apply CSS variable changes whenever relevant settings change
  useEffect(() => {
    const root = document.documentElement

    // Accent color
    root.style.setProperty('--color-accent', settings.accentColor)
    root.style.setProperty('--color-neon-blue', settings.accentColor)
    root.style.setProperty('--color-sidebar-active', settings.accentColor)
    root.style.setProperty('--glow-blue', `0 0 10px ${settings.accentColor}66, 0 0 20px ${settings.accentColor}33`)

    // Theme
    if (settings.theme === 'light') {
      root.style.setProperty('--color-bg', '#f0f2f5')
      root.style.setProperty('--color-sidebar', '#ffffff')
      root.style.setProperty('--color-surface', '#ffffff')
      root.style.setProperty('--color-surface-2', '#f5f7fa')
      root.style.setProperty('--color-border', '#e2e8f0')
      root.style.setProperty('--color-text-primary', '#1a202c')
      root.style.setProperty('--color-text-secondary', '#64748b')
      root.style.setProperty('--color-sidebar-text', '#64748b')
    } else {
      root.style.setProperty('--color-bg', '#0a0f1e')
      root.style.setProperty('--color-sidebar', '#0d1117')
      root.style.setProperty('--color-surface', '#111827')
      root.style.setProperty('--color-surface-2', '#1a2235')
      root.style.setProperty('--color-border', '#1e2d45')
      root.style.setProperty('--color-text-primary', '#e2e8f0')
      root.style.setProperty('--color-text-secondary', '#8b95a9')
      root.style.setProperty('--color-sidebar-text', '#8b95a9')
    }

    // Compact view — task card padding
    root.style.setProperty('--task-card-padding', settings.compactView ? '10px 14px' : '16px')
  }, [settings.accentColor, settings.theme, settings.compactView])

  const save = useCallback((updates) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSettings({ ...defaults })
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, save, reset }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
