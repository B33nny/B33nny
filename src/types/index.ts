// ─── Patterns ────────────────────────────────────────────────────────────────

export type PatternCategory = 'manipulation' | 'control' | 'avoidance' | 'attack' | 'cycle'
export type PatternRarity = 'common' | 'uncommon' | 'rare'

export interface ToxicPattern {
  id: number
  slug: string
  name: string
  category: PatternCategory
  description: string
  feelsLike: string
  triggers: string[]
  counterMove: string
  neuroscience?: string
  rarity: PatternRarity
  relatedPatterns: number[]
}

// ─── Levels ──────────────────────────────────────────────────────────────────

export type MechanicType =
  | 'drag-drop'
  | 'flashcard-sort'
  | 'side-by-side'
  | 'multiple-choice'
  | 'fill-in-blank'
  | 'evidence-flagging'
  | 'ai-conversation'
  | 'svg-maze'
  | 'impulse-meter'
  | 'script-builder'
  | 'timeline'
  | 'nvc-constructor'
  | 'rapid-fire'
  | 'connection-map'
  | 'format-navigator'
  | 'multi-character'
  | 'compound-battle'
  | 'role-reversal'

export interface GameLevel {
  id: number
  title: string
  tier: 1 | 2 | 3 | 4
  skill: string
  patterns: string[]
  mechanic: MechanicType
  aiPowered: boolean
  unlockRequirement: number | null
  xpReward: number
  estimatedMinutes: number
  description: string
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface LevelResult {
  levelId: number
  completedAt: string
  score: number
  maxScore: number
  timeSeconds: number
  patternsEncountered: string[]
}

export interface PerformanceEntry {
  patternSlug: string
  correct: boolean
  timestamp: string
  levelId: number
}

// ─── Spaced Repetition ────────────────────────────────────────────────────────

export interface RepetitionItem {
  id: string
  type: 'pattern' | 'phrase' | 'technique'
  easiness: number
  interval: number
  repetitions: number
  nextReviewDate: string
  lastQuality: number
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  patternTag?: string
}

export interface ReplayEntry {
  messageId: string
  patternUsed?: string
  playerTechnique?: string
  outcome: 'bait-taken' | 'held-ground' | 'escalated' | 'de-escalated' | 'neutral'
  alternativeResponse?: string
}

export interface Scenario {
  id: string
  levelId: number
  persona: string
  context: string
  objectives: string[]
  fallbackDialogue?: DialogueBranch[]
}

export interface DialogueBranch {
  id: string
  text: string
  patternTag?: string
  options: DialogueOption[]
}

export interface DialogueOption {
  text: string
  nextBranchId?: string
  outcome: 'correct' | 'incorrect' | 'neutral'
  feedback: string
  regulationDelta: number
}

// ─── Techniques ───────────────────────────────────────────────────────────────

export interface TechniqueStep {
  label: string
  description: string
  example?: string
}

export interface Technique {
  slug: string
  name: string
  origin: string
  summary: string
  steps: TechniqueStep[]
  useCases: string[]
  avoidWhen?: string[]
  phrases?: PhraseSubstitution[]
}

export interface PhraseSubstitution {
  bad: string
  good: string
  why?: string
}

// ─── Personas ─────────────────────────────────────────────────────────────────

export interface Persona {
  slug: string
  name: string
  role: string
  description: string
  avatar: string
  primaryPatterns: string[]
  difficulty: 1 | 2 | 3
}

// ─── Emotions ─────────────────────────────────────────────────────────────────

export interface Emotion {
  label: string
  category: 'anger' | 'sadness' | 'fear' | 'shame' | 'joy' | 'disgust' | 'surprise' | 'trust'
  intensity: 1 | 2 | 3
  relatedEmotions: string[]
  description: string
}
