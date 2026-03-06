import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RepetitionItem } from '../types'

// SM-2 algorithm implementation
function sm2(item: RepetitionItem, quality: number): RepetitionItem {
  // quality: 0-5 (0-2 = fail, 3-5 = pass)
  const q = Math.max(0, Math.min(5, quality))
  let { easiness, interval, repetitions } = item

  if (q >= 3) {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easiness)
    repetitions += 1
  } else {
    repetitions = 0
    interval = 1
  }

  easiness = Math.max(1.3, easiness + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return {
    ...item,
    easiness,
    interval,
    repetitions,
    lastQuality: q,
    nextReviewDate: nextReviewDate.toISOString().slice(0, 10),
  }
}

interface RepetitionState {
  items: Record<string, RepetitionItem>

  initItem: (id: string, type: RepetitionItem['type']) => void
  reviewItem: (id: string, quality: number) => void
  getDueItems: () => RepetitionItem[]
  getItemsDueCount: () => number
}

export const useRepetitionStore = create<RepetitionState>()(
  persist(
    (set, get) => ({
      items: {},

      initItem: (id, type) => {
        if (get().items[id]) return
        set(state => ({
          items: {
            ...state.items,
            [id]: {
              id,
              type,
              easiness: 2.5,
              interval: 1,
              repetitions: 0,
              nextReviewDate: new Date().toISOString().slice(0, 10),
              lastQuality: 0,
            },
          },
        }))
      },

      reviewItem: (id, quality) => {
        set(state => {
          const item = state.items[id]
          if (!item) return state
          return { items: { ...state.items, [id]: sm2(item, quality) } }
        })
      },

      getDueItems: () => {
        const today = new Date().toISOString().slice(0, 10)
        return Object.values(get().items).filter(item => item.nextReviewDate <= today)
      },

      getItemsDueCount: () => get().getDueItems().length,
    }),
    { name: 'signal-static-repetition' }
  )
)
