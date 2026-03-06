import { useState } from 'react'
import { motion } from 'framer-motion'
import { patterns } from '../data/patterns'
import { useStreakStore } from '../store/streakStore'
import { useProgressStore } from '../store/progressStore'
import { useCodexStore } from '../store/codexStore'
import { useRepetitionStore } from '../store/repetitionStore'
import { Card } from '../components/ui/Card'
import { XPToast, useXPToast } from '../components/game/XPToast'
import { Badge } from '../components/ui/Badge'

const DAILY_XP = 50

// Build a daily scenario from pattern data
function buildScenario(pattern: typeof patterns[0]) {
  return {
    pattern,
    message: `"${pattern.feelsLike.replace(/\.$/, '')}. You can\'t do anything right."`,
    question: 'Which toxic pattern does this most clearly demonstrate?',
    options: [pattern, ...patterns.filter(p => p.id !== pattern.id).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5),
    correctId: pattern.id,
  }
}

export function DailyPractice() {
  const { recordPractice, addDailyXP, getDailyXP, isStreakAlive, currentStreak } = useStreakStore()
  const { weakPatterns } = useProgressStore()
  const { unlockedPatterns, unlockPattern } = useCodexStore()
  const { reviewItem, initItem } = useRepetitionStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const dailyDone = getDailyXP() > 0

  // Choose today's pattern: prefer weak patterns if any are unlocked
  const [scenario] = useState(() => {
    const available = unlockedPatterns.length > 0
      ? patterns.filter(p => unlockedPatterns.includes(p.slug))
      : patterns.slice(0, 4)

    const weakAvailable = available.filter(p => weakPatterns.includes(p.slug))
    const pool = weakAvailable.length > 0 ? weakAvailable : available
    const chosen = pool[Math.floor(Math.random() * pool.length)]
    return buildScenario(chosen)
  })

  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (id: number) => {
    if (revealed) return
    setSelected(id)
    setRevealed(true)
    const correct = id === scenario.correctId

    // Record in spaced repetition
    initItem(scenario.pattern.slug, 'pattern')
    reviewItem(scenario.pattern.slug, correct ? 4 : 1)

    // Unlock pattern in codex
    unlockPattern(scenario.pattern.slug)

    if (correct && !dailyDone) {
      recordPractice()
      addDailyXP(DAILY_XP)
      showToast(DAILY_XP)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Daily Practice</h1>
        <p className="text-[#8892b0] text-sm mt-1">2 minutes a day keeps your skills sharp.</p>
      </div>

      {/* Streak */}
      <Card padding="sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isStreakAlive() ? '🔥' : '💤'}</span>
            <div>
              <p className="font-bold text-white">{currentStreak}-day streak</p>
              <p className="text-xs text-[#8892b0]">{isStreakAlive() ? 'Keep it going!' : 'Start a new streak today'}</p>
            </div>
          </div>
          {dailyDone && (
            <Badge variant="tier4">Done today ✓</Badge>
          )}
        </div>
      </Card>

      {/* Scenario card */}
      <Card>
        <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-3">Identify the pattern</p>

        {/* The message */}
        <div className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-xl p-4 mb-5">
          <p className="text-sm text-[#b0b8cc] italic leading-relaxed">{scenario.message}</p>
        </div>

        <p className="text-sm text-white mb-4">{scenario.question}</p>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {scenario.options.map(option => {
            const isCorrect = option.id === scenario.correctId
            const isSelected = selected === option.id
            const showResult = revealed

            return (
              <motion.button
                key={option.id}
                whileTap={{ scale: revealed ? 1 : 0.98 }}
                onClick={() => handleSelect(option.id)}
                className={`
                  w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all
                  ${!showResult ? 'bg-[#16213e] border-[#1e2a4a] text-white hover:border-[#00d4ff]/40 cursor-pointer' : ''}
                  ${showResult && isCorrect ? 'bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88]' : ''}
                  ${showResult && isSelected && !isCorrect ? 'bg-[#ff3366]/10 border-[#ff3366] text-[#ff3366]' : ''}
                  ${showResult && !isSelected && !isCorrect ? 'bg-[#16213e] border-[#1e2a4a] text-[#3a3a5e]' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{option.name}</span>
                  {showResult && isCorrect && <span>✓</span>}
                  {showResult && isSelected && !isCorrect && <span>✗</span>}
                </div>
              </motion.button>
            )
          })}
        </div>
      </Card>

      {/* Post-reveal */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-[#00ff88]/20">
            <p className="text-xs font-mono uppercase tracking-wider text-[#00ff88] mb-2">Counter-move</p>
            <p className="text-sm text-[#b0b8cc] leading-relaxed">{scenario.pattern.counterMove}</p>
          </Card>
        </motion.div>
      )}

      {revealed && !dailyDone && (
        <p className="text-center text-xs text-[#8892b0]">Come back tomorrow for another scenario.</p>
      )}
      {dailyDone && (
        <p className="text-center text-xs text-[#00ff88]">Daily practice complete. +{DAILY_XP} XP earned.</p>
      )}
    </div>
  )
}
