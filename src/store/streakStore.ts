import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StreakState {
  currentStreak: number
  longestStreak: number
  lastPracticeDate: string | null
  totalDaysPracticed: number
  dailyXPEarned: number
  lastXPResetDate: string | null

  recordPractice: () => void
  addDailyXP: (amount: number) => void
  getDailyXP: () => number
  isStreakAlive: () => boolean
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      totalDaysPracticed: 0,
      dailyXPEarned: 0,
      lastXPResetDate: null,

      recordPractice: () => {
        const today = todayStr()
        const { lastPracticeDate, currentStreak, longestStreak, totalDaysPracticed } = get()

        if (lastPracticeDate === today) return // already recorded today

        const isConsecutive = lastPracticeDate === yesterdayStr()
        const newStreak = isConsecutive ? currentStreak + 1 : 1

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastPracticeDate: today,
          totalDaysPracticed: totalDaysPracticed + 1,
        })
      },

      addDailyXP: (amount) => {
        const today = todayStr()
        const { lastXPResetDate } = get()
        set(state => ({
          dailyXPEarned: lastXPResetDate === today ? state.dailyXPEarned + amount : amount,
          lastXPResetDate: today,
        }))
      },

      getDailyXP: () => {
        const today = todayStr()
        const { lastXPResetDate, dailyXPEarned } = get()
        return lastXPResetDate === today ? dailyXPEarned : 0
      },

      isStreakAlive: () => {
        const { lastPracticeDate } = get()
        if (!lastPracticeDate) return false
        const today = todayStr()
        const yesterday = yesterdayStr()
        return lastPracticeDate === today || lastPracticeDate === yesterday
      },
    }),
    { name: 'signal-static-streak' }
  )
)
