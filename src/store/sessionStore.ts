import { create } from 'zustand'
import type { Message, ReplayEntry, Scenario } from '../types'

interface SessionState {
  regulationLevel: number
  isFlooded: boolean
  currentScenario: Scenario | null
  conversationHistory: Message[]
  replayData: ReplayEntry[]
  breathingRequired: boolean

  setRegulationLevel: (level: number) => void
  adjustRegulation: (delta: number) => void
  setFlooded: (flooded: boolean) => void
  setScenario: (scenario: Scenario | null) => void
  addMessage: (message: Message) => void
  addReplayEntry: (entry: ReplayEntry) => void
  resetSession: () => void
  completeBreathing: () => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  regulationLevel: 0,
  isFlooded: false,
  currentScenario: null,
  conversationHistory: [],
  replayData: [],
  breathingRequired: false,

  setRegulationLevel: (level) => {
    const clamped = Math.max(0, Math.min(100, level))
    set({ regulationLevel: clamped, isFlooded: clamped >= 100, breathingRequired: clamped >= 100 })
  },

  adjustRegulation: (delta) => {
    const { regulationLevel } = get()
    const next = Math.max(0, Math.min(100, regulationLevel + delta))
    set({ regulationLevel: next, isFlooded: next >= 100, breathingRequired: next >= 100 })
  },

  setFlooded: (flooded) => set({ isFlooded: flooded }),

  setScenario: (scenario) => set({ currentScenario: scenario }),

  addMessage: (message) => set(state => ({
    conversationHistory: [...state.conversationHistory, message],
  })),

  addReplayEntry: (entry) => set(state => ({
    replayData: [...state.replayData, entry],
  })),

  resetSession: () => set({
    regulationLevel: 0,
    isFlooded: false,
    currentScenario: null,
    conversationHistory: [],
    replayData: [],
    breathingRequired: false,
  }),

  completeBreathing: () => {
    set(state => ({
      breathingRequired: false,
      isFlooded: false,
      regulationLevel: Math.max(0, state.regulationLevel - 30),
    }))
  },
}))
