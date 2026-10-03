'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type ColorMode = 'dark' | 'light' | 'amoled' | 'system'
export type AccentKey = 'violet' | 'indigo' | 'cyan' | 'emerald' | 'rose' | 'amber'
export type FontScale = 'compact' | 'normal' | 'large'

export interface AccentColorConfig {
  name: string
  primary: string
  container: string
  onPrimary: string
  ring: string
}

export const ACCENT_PALETTES: Record<AccentKey, AccentColorConfig> = {
  violet: {
    name: 'Electric Violet',
    primary: '#d0bcff',
    container: '#a078ff',
    onPrimary: '#3c0091',
    ring: '#a078ff',
  },
  indigo: {
    name: 'Indigo Aurora',
    primary: '#a5b4fc',
    container: '#6366f1',
    onPrimary: '#1e1b4b',
    ring: '#6366f1',
  },
  cyan: {
    name: 'Cyan Glaze',
    primary: '#67e8f9',
    container: '#06b6d4',
    onPrimary: '#083344',
    ring: '#06b6d4',
  },
  emerald: {
    name: 'Emerald Pulse',
    primary: '#6ee7b7',
    container: '#10b981',
    onPrimary: '#022c22',
    ring: '#10b981',
  },
  rose: {
    name: 'Rose Bloom',
    primary: '#fda4af',
    container: '#f43f5e',
    onPrimary: '#4c0519',
    ring: '#f43f5e',
  },
  amber: {
    name: 'Amber Spark',
    primary: '#fcd34d',
    container: '#f59e0b',
    onPrimary: '#451a03',
    ring: '#f59e0b',
  },
}

interface ThemePreferences {
  mode: ColorMode
  accent: AccentKey
  fontScale: FontScale
  autoHideControls: boolean
  highContrastScrub: boolean
  reduceTimelineMotion: boolean
  compactLibraryView: boolean
}

const DEFAULT_PREFERENCES: ThemePreferences = {
  mode: 'dark',
  accent: 'violet',
  fontScale: 'normal',
  autoHideControls: true,
  highContrastScrub: true,
  reduceTimelineMotion: false,
  compactLibraryView: false,
}

interface ThemeContextType {
  prefs: ThemePreferences
  resolvedMode: 'dark' | 'light' | 'amoled'
  setMode: (mode: ColorMode) => void
  setAccent: (accent: AccentKey) => void
  setFontScale: (scale: FontScale) => void
  updatePreference: <K extends keyof ThemePreferences>(key: K, value: ThemePreferences[K]) => void
  resetToDefaults: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const STORAGE_KEY = 'yt_organizer_theme_prefs'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<ThemePreferences>(DEFAULT_PREFERENCES)
  const [mounted, setMounted] = useState(false)
  const [systemIsDark, setSystemIsDark] = useState(true)

  // Initialize from localStorage and system preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setPrefs((prev) => ({ ...prev, ...JSON.parse(saved) }))
      }
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      setSystemIsDark(mql.matches)
      const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches)
      mql.addEventListener('change', handler)
      setMounted(true)
      return () => mql.removeEventListener('change', handler)
    }
    setMounted(true)
  }, [])

  // Save to localStorage when changed
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // ignore
    }
  }, [prefs, mounted])

  const resolvedMode: 'dark' | 'light' | 'amoled' =
    prefs.mode === 'system' ? (systemIsDark ? 'dark' : 'light') : prefs.mode

  // Apply classes and CSS variables to documentElement
  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return
    const root = document.documentElement

    // Manage color scheme class & attribute
    root.classList.remove('dark', 'light', 'amoled')
    root.classList.add(resolvedMode)
    root.setAttribute('data-theme', resolvedMode)
    root.setAttribute('data-font-scale', prefs.fontScale)

    // Apply accent variables
    const accentObj = ACCENT_PALETTES[prefs.accent] || ACCENT_PALETTES.violet
    root.style.setProperty('--primary-accent', accentObj.primary)
    root.style.setProperty('--primary-accent-container', accentObj.container)
    root.style.setProperty('--primary-accent-on', accentObj.onPrimary)
    root.style.setProperty('--primary-accent-ring', accentObj.ring)
  }, [resolvedMode, prefs.accent, prefs.fontScale, mounted])

  const setMode = (mode: ColorMode) => {
    setPrefs((prev) => ({ ...prev, mode }))
  }

  const setAccent = (accent: AccentKey) => {
    setPrefs((prev) => ({ ...prev, accent }))
  }

  const setFontScale = (fontScale: FontScale) => {
    setPrefs((prev) => ({ ...prev, fontScale }))
  }

  const updatePreference = <K extends keyof ThemePreferences>(key: K, value: ThemePreferences[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }

  const resetToDefaults = () => {
    setPrefs(DEFAULT_PREFERENCES)
  }

  return (
    <ThemeContext.Provider
      value={{
        prefs,
        resolvedMode,
        setMode,
        setAccent,
        setFontScale,
        updatePreference,
        resetToDefaults,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
