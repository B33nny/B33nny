import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LevelResult, PerformanceEntry } from '../types'

interface ProgressState {
  completedLevels: Record<number, LevelResult>
  totalXP: number
  weakPatterns: string[]
  performanceHistory: PerformanceEntry[]
  onboardingComplete: boolean
  onboardingContext: string | null

  completeLevel: (result: LevelResult) => void
  recordPerformance: (entry: PerformanceEntry) => void
  addXP: (amount: number) => void
  setOnboardingComplete: (context: string) => void
  getUnlockedTiers: () => number[]
  isLevelUnlocked: (levelId: number) => boolean
  getLevelScore: (levelId: number) => number
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLevels: {},
      totalXP: 0,
      weakPatterns: [],
      performanceHistory: [],
      onboardingComplete: false,
      onboardingContext: null,

      completeLevel: (result) => {
        set(state => ({
          completedLevels: { ...state.completedLevels, [result.levelId]: result },
          totalXP: state.totalXP + result.score,
        }))
      },

      recordPerformance: (entry) => {
        set(state => {
          const history = [...state.performanceHistory, entry]
          // Recalculate weak patterns: slugs with < 70% accuracy in last 20 entries per pattern
          const patternCounts: Record<string, { correct: number; total: number }> = {}
          history.slice(-100).forEach(e => {
            if (!patternCounts[e.patternSlug]) patternCounts[e.patternSlug] = { correct: 0, total: 0 }
            patternCounts[e.patternSlug].total++
            if (e.correct) patternCounts[e.patternSlug].correct++
          })
          const weakPatterns = Object.entries(patternCounts)
            .filter(([, v]) => v.total >= 3 && v.correct / v.total < 0.7)
            .map(([slug]) => slug)

          return { performanceHistory: history, weakPatterns }
        })
      },

      addXP: (amount) => {
        set(state => ({ totalXP: state.totalXP + amount }))
      },

      setOnboardingComplete: (context) => {
        set({ onboardingComplete: true, onboardingContext: context })
      },

      getUnlockedTiers: () => {
        const { completedLevels } = get()
        const completed = Object.keys(completedLevels).map(Number)
        const tiers = [1]
        if (completed.includes(5)) tiers.push(2)
        if (completed.includes(10)) tiers.push(3)
        if (completed.includes(15)) tiers.push(4)
        return tiers
      },

      isLevelUnlocked: (levelId) => {
        if (levelId === 1) return true
        const { completedLevels } = get()
        return Boolean(completedLevels[levelId - 1])
      },

      getLevelScore: (levelId) => {
        const result = get().completedLevels[levelId]
        if (!result) return 0
        return Math.round((result.score / result.maxScore) * 100)
      },
    }),
    { name: 'signal-static-progress' }
  )
)
