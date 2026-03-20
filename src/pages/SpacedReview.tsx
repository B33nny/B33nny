import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRepetitionStore } from '../store/repetitionStore'
import { useStreakStore } from '../store/streakStore'
import { getPatternBySlug } from '../data/patterns'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { XPToast, useXPToast } from '../components/game/XPToast'

const XP_PER_REVIEW = 5

type ReviewPhase = 'hub' | 'reviewing' | 'done'
type AnswerState = 'unanswered' | 'correct' | 'wrong'

export function SpacedReview() {
  const navigate = useNavigate()
  const { items, getDueItems, reviewItem } = useRepetitionStore()
  const { addDailyXP } = useStreakStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [phase, setPhase] = useState<ReviewPhase>('hub')
  const [cardIdx, setCardIdx] = useState(0)
  const [, setAnswerState] = useState<AnswerState>('unanswered')
  const [revealed, setRevealed] = useState(false)
  const [sessionScore, setSessionScore] = useState(0)
  const [totalReviewed, setTotalReviewed] = useState(0)

  const dueItems = useMemo(() => getDueItems(), [getDueItems])
  const allItems = Object.values(items)

  const currentItem = dueItems[cardIdx]
  const currentPattern = currentItem ? getPatternBySlug(currentItem.id) : null

  const startReview = () => {
    setCardIdx(0)
    setAnswerState('unanswered')
    setRevealed(false)
    setSessionScore(0)
    setTotalReviewed(0)
    setPhase('reviewing')
  }

  const revealAnswer = () => setRevealed(true)

  const rateAnswer = (quality: number) => {
    // quality: 5 = easy, 4 = good, 3 = hard, 1 = fail
    reviewItem(currentItem.id, quality)

    const correct = quality >= 3
    if (correct) {
      setSessionScore(s => s + 1)
      addDailyXP(XP_PER_REVIEW)
    }
    setTotalReviewed(t => t + 1)

    const next = cardIdx + 1
    if (next >= dueItems.length) {
      showToast(dueItems.filter((_, i) => i < next).length * XP_PER_REVIEW)
      setPhase('done')
    } else {
      setCardIdx(next)
      setAnswerState('unanswered')
      setRevealed(false)
    }
  }

  // Stats for hub
  const masteredCount = allItems.filter(i => i.repetitions >= 3).length
  const newCount = allItems.filter(i => i.repetitions === 0).length
  const dueCount = dueItems.length

  if (phase === 'done') {
    const pct = totalReviewed > 0 ? Math.round((sessionScore / totalReviewed) * 100) : 0
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">{pct >= 80 ? '🧠' : pct >= 60 ? '📈' : '🔁'}</div>
        <h2 className="text-2xl font-bold text-white">Review Complete</h2>
        <p className="text-[#00d4ff] text-sm">+{sessionScore * XP_PER_REVIEW} XP · {sessionScore}/{totalReviewed} correct</p>
        <div className="bg-[#16213e] border border-[#1e2a4a] rounded-2xl p-5 max-w-sm w-full text-left">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-[#8892b0]">Accuracy</span>
            <span className="font-bold" style={{ color: pct >= 80 ? '#00ff88' : pct >= 60 ? '#ffd700' : '#ff3366' }}>{pct}%</span>
          </div>
          <div className="w-full bg-[#1a1a2e] rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              className="h-2 rounded-full"
              style={{ backgroundColor: pct >= 80 ? '#00ff88' : pct >= 60 ? '#ffd700' : '#ff3366' }}
            />
          </div>
          <p className="text-xs text-[#8892b0] mt-3">
            {pct >= 80
              ? 'Strong recall. Intervals extended — these patterns are settling in.'
              : pct >= 60
              ? 'Good progress. The harder ones will resurface sooner for reinforcement.'
              : 'Difficult session. That\'s normal — struggling is how the memory forms.'}
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {dueItems.length > totalReviewed && (
            <Button onClick={startReview} fullWidth>Review remaining →</Button>
          )}
          <Button onClick={() => navigate('/')} variant="secondary" fullWidth>Back to home</Button>
        </div>
      </div>
    )
  }

  if (phase === 'reviewing' && currentItem) {
    const isPattern = currentItem.type === 'pattern'
    const isPhrase = currentItem.type === 'phrase'

    return (
      <div className="flex flex-col gap-5">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

        <div className="flex items-center justify-between">
          <div>
            <Badge variant="tier2" size="sm">Review</Badge>
            <h1 className="text-lg font-bold text-white mt-0.5">Spaced Repetition</h1>
          </div>
          <p className="text-sm font-mono text-[#8892b0]">{cardIdx + 1} / {dueItems.length}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#1a1a2e] rounded-full h-1.5">
          <motion.div
            animate={{ width: `${((cardIdx) / dueItems.length) * 100}%` }}
            className="h-1.5 rounded-full bg-[#00d4ff]"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col gap-4"
          >
            {/* Question card */}
            <div className="bg-[#16213e] border border-[#1e2a4a] rounded-2xl p-6">
              <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-3">
                {isPattern ? 'Pattern Recognition' : isPhrase ? 'Phrase Substitution' : 'Recall'}
              </p>

              {isPattern && currentPattern ? (
                <>
                  <p className="text-xs text-[#8892b0] mb-2">What does this pattern look like?</p>
                  <p className="text-2xl font-bold text-white mb-3">{currentPattern.name}</p>
                  <p className="text-sm text-[#8892b0] italic">"{currentPattern.feelsLike}"</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-[#8892b0] mb-2">Recall this item:</p>
                  <p className="text-base text-white font-mono">{currentItem.id}</p>
                </>
              )}
            </div>

            {/* Answer reveal */}
            {!revealed ? (
              <Button onClick={revealAnswer} fullWidth>Show answer</Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                {/* Answer content */}
                <div className="bg-[#0f0f1a] border border-[#00d4ff]/20 rounded-2xl p-5">
                  {isPattern && currentPattern ? (
                    <>
                      <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-2">Counter-move</p>
                      <p className="text-sm text-[#b0b8cc] leading-relaxed">{currentPattern.counterMove}</p>
                      {currentPattern.neuroscience && (
                        <div className="mt-3 pt-3 border-t border-[#1e2a4a]">
                          <p className="text-xs font-mono uppercase tracking-wider text-[#8b5cf6] mb-1">Why it works</p>
                          <p className="text-xs text-[#8892b0] leading-relaxed">{currentPattern.neuroscience}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-[#b0b8cc]">Review this item in your memory.</p>
                  )}
                </div>

                {/* Rating buttons */}
                <div>
                  <p className="text-xs text-[#8892b0] text-center mb-2 font-mono uppercase tracking-wider">How well did you recall this?</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { quality: 1, label: 'Blank', color: '#ff3366', bg: 'bg-[#ff3366]/10 border-[#ff3366]/30 hover:border-[#ff3366]' },
                      { quality: 3, label: 'Hard', color: '#ff6b35', bg: 'bg-[#ff6b35]/10 border-[#ff6b35]/30 hover:border-[#ff6b35]' },
                      { quality: 4, label: 'Good', color: '#ffd700', bg: 'bg-[#ffd700]/10 border-[#ffd700]/30 hover:border-[#ffd700]' },
                      { quality: 5, label: 'Easy', color: '#00ff88', bg: 'bg-[#00ff88]/10 border-[#00ff88]/30 hover:border-[#00ff88]' },
                    ].map(btn => (
                      <button
                        key={btn.quality}
                        onClick={() => rateAnswer(btn.quality)}
                        className={`py-3 rounded-xl border text-xs font-semibold transition-all ${btn.bg}`}
                        style={{ color: btn.color }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // Hub view
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Badge variant="tier2" size="sm">Practice</Badge>
        <h1 className="text-xl font-bold text-white mt-1">Spaced Review</h1>
        <p className="text-[#8892b0] text-sm mt-1">SM-2 algorithm — items resurface exactly when memory is fading</p>
      </div>

      {/* Due now card */}
      <div className={`rounded-2xl p-5 border ${
        dueCount > 0
          ? 'bg-[#00d4ff]/08 border-[#00d4ff]/30'
          : 'bg-[#16213e] border-[#1e2a4a]'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff]">Due now</p>
          <span className={`text-2xl font-bold ${dueCount > 0 ? 'text-[#00d4ff]' : 'text-[#8892b0]'}`}>{dueCount}</span>
        </div>
        {dueCount > 0 ? (
          <p className="text-sm text-[#b0b8cc]">
            {dueCount} item{dueCount > 1 ? 's' : ''} ready for review. Each takes ~10 seconds.
          </p>
        ) : (
          <p className="text-sm text-[#8892b0]">All caught up. Check back tomorrow.</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total tracked', value: allItems.length, color: '#8892b0' },
          { label: 'Mastered', value: masteredCount, color: '#00ff88' },
          { label: 'New', value: newCount, color: '#ffd700' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-3 text-center">
            <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#8892b0] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-[#16213e] border border-[#1e2a4a] rounded-2xl p-5">
        <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-3">How it works</p>
        <div className="flex flex-col gap-2">
          {[
            { icon: '🧠', text: 'Patterns you unlock through levels are automatically added to your review queue' },
            { icon: '📅', text: 'SM-2 algorithm schedules each item just before your memory would fade' },
            { icon: '⚡', text: 'Rate your recall (Blank → Easy) to adjust future intervals' },
            { icon: '🏆', text: `+${XP_PER_REVIEW} XP per correct recall` },
          ].map(item => (
            <div key={item.icon} className="flex gap-3 items-start">
              <span className="text-base">{item.icon}</span>
              <p className="text-xs text-[#8892b0] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Items list preview */}
      {dueCount > 0 && (
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-2">Items due</p>
          <div className="flex flex-col gap-1.5">
            {dueItems.slice(0, 5).map(item => {
              const pattern = getPatternBySlug(item.id)
              return (
                <div key={item.id} className="bg-[#16213e] border border-[#1e2a4a] rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{pattern?.name ?? item.id}</p>
                    <p className="text-[10px] text-[#8892b0] font-mono uppercase">{item.type} · {item.repetitions} reviews</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{
                      color: item.repetitions >= 3 ? '#00ff88' : item.repetitions >= 1 ? '#ffd700' : '#8892b0'
                    }}>
                      {item.repetitions >= 3 ? 'Mature' : item.repetitions >= 1 ? 'Learning' : 'New'}
                    </p>
                  </div>
                </div>
              )
            })}
            {dueCount > 5 && (
              <p className="text-xs text-[#8892b0] text-center py-1">+{dueCount - 5} more</p>
            )}
          </div>
        </div>
      )}

      <Button onClick={dueCount > 0 ? startReview : () => navigate('/codex')} fullWidth>
        {dueCount > 0 ? `Start review (${dueCount} items)` : 'Browse Pattern Codex →'}
      </Button>
    </div>
  )
}
