import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CodexState {
  unlockedPatterns: string[]
  viewedPatterns: string[]

  unlockPattern: (slug: string) => boolean  // returns true if newly unlocked
  markViewed: (slug: string) => void
  isUnlocked: (slug: string) => boolean
  hasNewEntries: () => boolean
}

export const useCodexStore = create<CodexState>()(
  persist(
    (set, get) => ({
      unlockedPatterns: [],
      viewedPatterns: [],

      unlockPattern: (slug) => {
        const { unlockedPatterns } = get()
        if (unlockedPatterns.includes(slug)) return false
        set(state => ({ unlockedPatterns: [...state.unlockedPatterns, slug] }))
        return true
      },

      markViewed: (slug) => {
        set(state => ({
          viewedPatterns: state.viewedPatterns.includes(slug)
            ? state.viewedPatterns
            : [...state.viewedPatterns, slug],
        }))
      },

      isUnlocked: (slug) => get().unlockedPatterns.includes(slug),

      hasNewEntries: () => {
        const { unlockedPatterns, viewedPatterns } = get()
        return unlockedPatterns.some(slug => !viewedPatterns.includes(slug))
      },
    }),
    { name: 'signal-static-codex' }
  )
)
