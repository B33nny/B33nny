import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getLevelById } from '../../data/levels'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { useCodexStore } from '../../store/codexStore'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(6)!

interface MessageLine {
  id: string
  sender: 'them' | 'you'
  text: string
  isToxic: boolean
  patternSlug?: string
  tacticName?: string
  explanation?: string
}

const threads: MessageLine[][] = [
  [
    { id: 'm1', sender: 'you', text: 'I felt hurt when you told Sarah about what I shared with you in confidence.', isToxic: false },
    { id: 'm2', sender: 'them', text: "I never said that. You're making things up again.", isToxic: true, patternSlug: 'gaslighting', tacticName: 'Flat denial', explanation: "Flatly denying something that happened — making you question your own memory." },
    { id: 'm3', sender: 'you', text: 'Sarah told me herself. She was upset about it.', isToxic: false },
    { id: 'm4', sender: 'them', text: "Sarah misunderstood. And honestly, you're way too sensitive about this stuff.", isToxic: true, patternSlug: 'minimizing', tacticName: 'Minimising', explanation: '"You\'re too sensitive" dismisses the impact and makes your reaction the problem.' },
    { id: 'm5', sender: 'them', text: "I can't believe you'd take her word over mine. After everything I've done for you.", isToxic: true, patternSlug: 'guilt-tripping', tacticName: 'Guilt-trip', explanation: 'Redirecting to your debt to them instead of addressing the actual issue.' },
    { id: 'm6', sender: 'you', text: "I'm not taking sides — I'm just saying I was hurt.", isToxic: false },
    { id: 'm7', sender: 'them', text: "Well if you're going to be like this, maybe we just shouldn't talk.", isToxic: true, patternSlug: 'stonewalling', tacticName: 'Threat of withdrawal', explanation: 'Threatening to end the conversation as punishment for raising a concern.' },
  ],
  [
    { id: 'n1', sender: 'you', text: "You were really short with me at dinner in front of everyone.", isToxic: false },
    { id: 'n2', sender: 'them', text: "That didn't happen. You're remembering it wrong.", isToxic: true, patternSlug: 'gaslighting', tacticName: 'Memory manipulation', explanation: 'Telling you your memory is wrong — a core gaslighting move.' },
    { id: 'n3', sender: 'them', text: "And if I was short, it was because you'd been ignoring me all week.", isToxic: true, patternSlug: 'blame-shifting', tacticName: 'Blame-shifting', explanation: 'Even while denying the event, shifting blame for it to you.' },
    { id: 'n4', sender: 'you', text: "I haven't been ignoring you. I've been busy with the project.", isToxic: false },
    { id: 'n5', sender: 'them', text: "Everyone at dinner thought you were being difficult, by the way.", isToxic: true, patternSlug: 'flying-monkeys', tacticName: 'Invoking others', explanation: "Using unnamed 'everyone' to validate their position and isolate you." },
    { id: 'n6', sender: 'them', text: "You always do this — turn things around and make me the villain.", isToxic: true, patternSlug: 'darvo', tacticName: 'DARVO', explanation: "Reversing victim and offender — claiming they're the one being wronged by you raising the issue." },
  ],
]

export function L06_GaslightDetective() {
  const navigate = useNavigate()
  const { completeLevel, recordPerformance } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { unlockPattern } = useCodexStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [threadIdx, setThreadIdx] = useState(0)
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const thread = threads[threadIdx]
  const toxicMessages = thread.filter(m => m.isToxic)

  const toggleFlag = (id: string) => {
    if (checked) return
    setFlagged(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const checkAnswers = () => {
    setChecked(true)
    const correctFlags = toxicMessages.filter(m => flagged.has(m.id))
    const falsePositives = [...flagged].filter(id => !toxicMessages.find(m => m.id === id))
    const roundScore = Math.max(0, correctFlags.length - falsePositives.length)
    setScore(s => s + roundScore)

    toxicMessages.forEach(m => {
      if (m.patternSlug) {
        const caught = flagged.has(m.id)
        recordPerformance({ patternSlug: m.patternSlug, correct: caught, timestamp: new Date().toISOString(), levelId: 6 })
        if (caught) unlockPattern(m.patternSlug)
      }
    })
  }

  const nextThread = () => {
    if (threadIdx + 1 >= threads.length) {
      completeLevel({ levelId: 6, completedAt: new Date().toISOString(), score, maxScore: threads.reduce((a, t) => a + t.filter(m => m.isToxic).length, 0), timeSeconds: 0, patternsEncountered: ['gaslighting', 'minimizing', 'blame-shifting', 'darvo'] })
      addDailyXP(level.xpReward)
      showToast(level.xpReward)
      setDone(true)
    } else {
      setFlagged(new Set())
      setChecked(false)
      setThreadIdx(i => i + 1)
    }
  }

  if (done) {
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">🔍</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP · Evidence collected</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">Gaslighting works by accumulation — any single instance feels deniable. The pattern only becomes visible across multiple exchanges.</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div className="flex items-center justify-between">
        <div>
          <Badge variant="tier2" size="sm">Level 6</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
        </div>
        <p className="text-sm text-[#8892b0]">Thread {threadIdx + 1}/{threads.length}</p>
      </div>

      <p className="text-sm text-[#8892b0]">
        Tap each message that contains a <span className="text-[#ffd700]">toxic tactic</span>. Precision matters — false flags cost points.
      </p>

      {/* Thread */}
      <div className="flex flex-col gap-2">
        {thread.map(msg => {
          const isFlagged = flagged.has(msg.id)
          const isCorrect = checked && msg.isToxic && isFlagged
          const isMissed = checked && msg.isToxic && !isFlagged
          const isFalsePositive = checked && !msg.isToxic && isFlagged

          return (
            <motion.div
              key={msg.id}
              whileTap={!checked && msg.sender === 'them' ? { scale: 0.98 } : {}}
              onClick={() => msg.sender === 'them' && toggleFlag(msg.id)}
              className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all
                ${msg.sender === 'you'
                  ? 'bg-[#1e2a4a] text-[#8892b0] border border-[#2a3a5e]'
                  : isFalsePositive ? 'bg-[#ff3366]/20 border-2 border-[#ff3366] text-white cursor-pointer'
                  : isCorrect ? 'bg-[#ffd700]/15 border-2 border-[#ffd700] text-white cursor-pointer'
                  : isMissed ? 'bg-[#ff3366]/10 border-2 border-[#ff3366]/50 text-white'
                  : isFlagged ? 'bg-[#ffd700]/10 border-2 border-[#ffd700]/60 text-white cursor-pointer'
                  : 'bg-[#16213e] border border-[#1e2a4a] text-[#b0b8cc] cursor-pointer hover:border-[#ffd700]/30'
                }
              `}>
                {msg.sender === 'them' && !checked && (
                  <p className="text-[10px] font-mono text-[#8892b0] mb-1">Them {isFlagged ? '🚩' : ''}</p>
                )}
                <p>{msg.text}</p>

                {/* Post-check explanation */}
                <AnimatePresence>
                  {checked && msg.isToxic && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 pt-2 border-t border-[#ffd700]/20"
                    >
                      <p className="text-xs font-semibold text-[#ffd700] mb-0.5">{msg.tacticName}</p>
                      <p className="text-xs text-[#8892b0]">{msg.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Score feedback */}
      {checked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4"
        >
          <p className="text-sm text-[#8892b0]">
            Caught <span className="text-[#00ff88] font-bold">{toxicMessages.filter(m => flagged.has(m.id)).length}</span> of <span className="text-white">{toxicMessages.length}</span> toxic messages.
            {[...flagged].some(id => !toxicMessages.find(m => m.id === id)) && (
              <span className="text-[#ff3366]"> (Some false positives detected.)</span>
            )}
          </p>
        </motion.div>
      )}

      <div className="flex gap-3">
        {!checked ? (
          <Button onClick={checkAnswers} disabled={flagged.size === 0} fullWidth>Submit evidence</Button>
        ) : (
          <Button onClick={nextThread} fullWidth>
            {threadIdx + 1 >= threads.length ? 'Finish Level' : 'Next thread →'}
          </Button>
        )}
      </div>
    </div>
  )
}
