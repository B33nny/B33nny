import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { patterns } from '../../data/patterns'
import { getLevelById } from '../../data/levels'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { useCodexStore } from '../../store/codexStore'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(2)!

const cards: Array<{ id: string; quote: string; patternSlug: string | null; isHealthy: boolean }> = [
  { id: 'c1', quote: '"You\'re too sensitive — it was just a joke."', patternSlug: 'minimizing', isHealthy: false },
  { id: 'c2', quote: '"I\'m frustrated because dinner plans changed again — can we talk about it?"', patternSlug: null, isHealthy: true },
  { id: 'c3', quote: '"See? You\'re the problem. You always overreact."', patternSlug: 'darvo', isHealthy: false },
  { id: 'c4', quote: '"I\'ll leave you alone for a bit. Let\'s talk when we\'ve both cooled down."', patternSlug: null, isHealthy: true },
  { id: 'c5', quote: '"I never said that. You\'re imagining things."', patternSlug: 'gaslighting', isHealthy: false },
  { id: 'c6', quote: '"That didn\'t happen the way you\'re describing it."', patternSlug: 'gaslighting', isHealthy: false },
  { id: 'c7', quote: '"After everything I\'ve done for you, this is how you repay me."', patternSlug: 'guilt-tripping', isHealthy: false },
  { id: 'c8', quote: '"I heard you were angry at the meeting — can I understand what happened?"', patternSlug: null, isHealthy: true },
  { id: 'c9', quote: '"What about when YOU did [unrelated thing] last month?"', patternSlug: 'whataboutism', isHealthy: false },
  { id: 'c10', quote: '"I\'m angry and I need to take responsibility for how I handled that."', patternSlug: null, isHealthy: true },
  { id: 'c11', quote: '[Reads your message. Does not respond for three days.]', patternSlug: 'silent-treatment', isHealthy: false },
  { id: 'c12', quote: '"I can see you\'re upset. I\'d like to understand what happened."', patternSlug: null, isHealthy: true },
]

const shuffled = [...cards].sort(() => Math.random() - 0.5)

export function L02_RedFlagBingo() {
  const navigate = useNavigate()
  const { completeLevel, recordPerformance } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { unlockPattern } = useCodexStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answered, setAnswered] = useState<'toxic' | 'healthy' | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const card = shuffled[currentIdx]

  const answer = (choice: 'toxic' | 'healthy') => {
    if (answered) return
    const correct = (choice === 'toxic') === !card.isHealthy
    setAnswered(choice)

    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    setBestStreak(s => Math.max(s, newStreak))
    if (correct) setScore(s => s + 1)

    if (card.patternSlug) {
      recordPerformance({ patternSlug: card.patternSlug, correct, timestamp: new Date().toISOString(), levelId: 2 })
      if (correct) unlockPattern(card.patternSlug)
    }
  }

  const next = () => {
    setAnswered(null)
    if (currentIdx + 1 >= shuffled.length) {
      completeLevel({ levelId: 2, completedAt: new Date().toISOString(), score, maxScore: shuffled.length, timeSeconds: 0, patternsEncountered: cards.filter(c => c.patternSlug).map(c => c.patternSlug!) })
      addDailyXP(level.xpReward)
      showToast(level.xpReward)
      setDone(true)
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  if (done) {
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#00d4ff]">{score}/{shuffled.length}</p>
            <p className="text-xs text-[#8892b0]">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#ff6b35]">🔥{bestStreak}</p>
            <p className="text-xs text-[#8892b0]">Best streak</p>
          </div>
        </div>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP earned</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  const correct = answered && ((answered === 'toxic') === !card.isHealthy)

  return (
    <div className="flex flex-col gap-5">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div className="flex items-center justify-between">
        <div>
          <Badge variant="tier1" size="sm">Level 2</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && <span className="text-sm font-bold text-[#ff6b35]">🔥{streak}</span>}
          <p className="text-sm text-[#8892b0]">{currentIdx + 1}/{shuffled.length}</p>
        </div>
      </div>

      <p className="text-sm text-[#8892b0]">Is this exchange <span className="text-[#ff3366]">toxic</span> or <span className="text-[#00ff88]">healthy</span>? If toxic — what pattern?</p>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className={`
            rounded-2xl p-6 border min-h-[140px] flex items-center justify-center text-center
            ${!answered ? 'bg-[#16213e] border-[#1e2a4a]' : correct ? 'bg-[#00ff88]/10 border-[#00ff88]/40' : 'bg-[#ff3366]/10 border-[#ff3366]/40'}
          `}
        >
          <p className="text-[#b0b8cc] text-base leading-relaxed italic">"{card.quote}"</p>
        </motion.div>
      </AnimatePresence>

      {/* Buttons */}
      {!answered && (
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => answer('toxic')} variant="danger" fullWidth>🚩 Toxic</Button>
          <Button onClick={() => answer('healthy')} variant="secondary" fullWidth>
            <span className="text-[#00ff88]">✓</span> Healthy
          </Button>
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 border ${correct ? 'bg-[#00ff88]/10 border-[#00ff88]/30' : 'bg-[#ff3366]/10 border-[#ff3366]/30'}`}
          >
            <p className={`font-semibold text-sm mb-1 ${correct ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
              {correct ? 'Correct' : 'Missed'}
            </p>
            {card.patternSlug && (
              <p className="text-xs text-[#8892b0]">
                Pattern: <span className="text-[#00d4ff]">{patterns.find(p => p.slug === card.patternSlug)?.name}</span>
              </p>
            )}
            {card.isHealthy && (
              <p className="text-xs text-[#8892b0]">This was a <span className="text-[#00ff88]">healthy</span> communication example.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {answered && (
        <Button onClick={next} fullWidth>
          {currentIdx + 1 >= shuffled.length ? 'Finish Level' : 'Next card →'}
        </Button>
      )}
    </div>
  )
}
