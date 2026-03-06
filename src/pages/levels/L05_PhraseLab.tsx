import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { escalatingPhrases } from '../../data/phrases'
import { getLevelById } from '../../data/levels'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(5)!

// Pick 8 phrases for the level
const levelPhrases = [...escalatingPhrases].sort(() => Math.random() - 0.5).slice(0, 8)

export function L05_PhraseLab() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [trashed, setTrashed] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const phrase = levelPhrases[currentIdx]

  const handleTrash = () => {
    setTrashed(true)
    setScore(s => s + 1)
  }

  const next = () => {
    setTrashed(false)
    if (currentIdx + 1 >= levelPhrases.length) {
      completeLevel({ levelId: 5, completedAt: new Date().toISOString(), score: score + 1, maxScore: levelPhrases.length, timeSeconds: 0, patternsEncountered: [] })
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
        <div className="text-5xl">🔬</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP · 8 escalating phrases retired</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">Words are tools. The wrong tool doesn't just fail to help — it actively makes things worse. Now you have the right ones.</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div className="flex items-center justify-between">
        <div>
          <Badge variant="tier1" size="sm">Level 5</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
        </div>
        <p className="text-sm text-[#8892b0]">{currentIdx + 1}/{levelPhrases.length}</p>
      </div>

      <p className="text-sm text-[#8892b0]">Retire the escalating phrase — then see its de-escalating replacement.</p>

      {/* Progress */}
      <div className="flex gap-1">
        {levelPhrases.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full"
            style={{ backgroundColor: i < currentIdx ? '#00ff88' : i === currentIdx ? '#00d4ff' : '#1a1a2e' }}
          />
        ))}
      </div>

      {/* Escalating phrase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`phrase-${currentIdx}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: trashed ? 0 : 1, scale: trashed ? 0.8 : 1, x: trashed ? 200 : 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#ff3366]/10 border-2 border-[#ff3366]/30 rounded-2xl p-6"
        >
          <p className="text-xs font-mono uppercase tracking-wider text-[#ff3366] mb-3">⚠ Escalating phrase</p>
          <p className="text-lg font-medium text-white leading-relaxed">"{phrase.bad}"</p>
          {phrase.why && (
            <p className="text-xs text-[#8892b0] mt-3 italic">{phrase.why}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Trash zone */}
      {!trashed && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleTrash}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-[#ff3366]/40 text-[#ff3366] font-semibold text-sm hover:border-[#ff3366] hover:bg-[#ff3366]/5 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl">🗑</span>
          Retire this phrase
        </motion.button>
      )}

      {/* De-escalating replacement */}
      <AnimatePresence>
        {trashed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="bg-[#00ff88]/10 border-2 border-[#00ff88]/30 rounded-2xl p-6">
              <p className="text-xs font-mono uppercase tracking-wider text-[#00ff88] mb-3">✓ De-escalating alternative</p>
              <p className="text-lg font-medium text-white leading-relaxed">"{phrase.good}"</p>
            </div>
            <Button onClick={next} fullWidth>
              {currentIdx + 1 >= levelPhrases.length ? 'Finish Level' : 'Next phrase →'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
