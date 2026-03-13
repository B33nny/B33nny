import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getLevelById } from '../../data/levels'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { useCodexStore } from '../../store/codexStore'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(10)!

interface BaitRound {
  id: string
  baits: string[]           // escalating messages, one revealed per tick
  baitPattern: string
  winText: string           // what to say when player holds
  failText: string          // reminder when player bites
  impulseRise: number       // per bait message
}

const rounds: BaitRound[] = [
  {
    id: 'r1',
    baitPattern: 'Baiting',
    impulseRise: 18,
    winText: "The win is silence. Non-response is the highest-yield move when someone is baiting.",
    failText: "You bit the hook. They now control the conversation.",
    baits: [
      "You know what your problem is? You're completely delusional.",
      "No response? Typical. Proves my point — you can't handle the truth.",
      "Everyone agrees with me by the way. You're the only one who doesn't see it.",
      "You're a coward for not responding. That says everything.",
    ],
  },
  {
    id: 'r2',
    baitPattern: 'JADE Trap',
    impulseRise: 15,
    winText: "You held the boundary without over-explaining. No explanation required.",
    failText: "Every explanation you give becomes ammunition. 'No' is a complete sentence.",
    baits: [
      "Why won't you come to the family dinner? Just give me a reason.",
      "You can't even give a simple explanation? What's wrong with you?",
      "Fine. I'll tell everyone you refused to explain yourself. They'll understand.",
      "This is exactly the kind of selfish behaviour that ruins this family.",
    ],
  },
  {
    id: 'r3',
    baitPattern: 'Reactive Abuse',
    impulseRise: 22,
    winText: "You didn't give them the reaction they were engineering. That's the whole defence.",
    failText: "Once you react, your reaction becomes the story — not their behaviour.",
    baits: [
      "You really think you're better than everyone, don't you.",
      "Go ahead, act calm. Everyone can see through your fake composure.",
      "I've told everyone what you did. Don't pretend you're the reasonable one.",
      "Just admit you're wrong for once in your life. You never take responsibility.",
    ],
  },
]

const TICK_INTERVAL = 3500  // ms between bait messages

export function L10_SpotTheTrap() {
  const navigate = useNavigate()
  const { completeLevel, recordPerformance } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { unlockPattern } = useCodexStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [roundIdx, setRoundIdx] = useState(0)
  const [baitIdx, setBaitIdx] = useState(0)           // which bait message is showing
  const [impulse, setImpulse] = useState(0)
  const [phase, setPhase] = useState<'intro' | 'round' | 'result' | 'done'>('intro')
  const [bit, setBit] = useState(false)               // player took the bait
  const [held, setHeld] = useState(false)             // player held successfully
  const [score, setScore] = useState(0)
  const tickRef = useRef<number | null>(null)

  const round = rounds[roundIdx]

  const startTicking = () => {
    tickRef.current = window.setInterval(() => {
      setBaitIdx(prev => {
        const next = prev + 1
        if (next >= round.baits.length) {
          // All baits exhausted — player held!
          clearInterval(tickRef.current!)
          setHeld(true)
          setPhase('result')
          const roundScore = Math.round(100 - impulse)
          setScore(s => s + Math.max(0, roundScore))
          unlockPattern('baiting')
          unlockPattern('jade-trap')
          unlockPattern('reactive-abuse')
          recordPerformance({ patternSlug: 'baiting', correct: true, timestamp: new Date().toISOString(), levelId: 10 })
          return prev
        }
        setImpulse(i => Math.min(100, i + round.impulseRise))
        return next
      })
    }, TICK_INTERVAL)
  }

  const startRound = () => {
    setBaitIdx(0)
    setImpulse(0)
    setBit(false)
    setHeld(false)
    setPhase('round')
    startTicking()
  }

  const takeBait = () => {
    if (tickRef.current) clearInterval(tickRef.current)
    setBit(true)
    setPhase('result')
    recordPerformance({ patternSlug: 'baiting', correct: false, timestamp: new Date().toISOString(), levelId: 10 })
  }

  const nextRound = () => {
    if (roundIdx + 1 >= rounds.length) {
      completeLevel({ levelId: 10, completedAt: new Date().toISOString(), score, maxScore: rounds.length * 100, timeSeconds: 0, patternsEncountered: ['baiting', 'jade-trap', 'reactive-abuse'] })
      addDailyXP(level.xpReward)
      showToast(level.xpReward)
      setPhase('done')
    } else {
      setRoundIdx(i => i + 1)
      setPhase('intro')
    }
  }

  useEffect(() => {
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [])

  const impulseColor = impulse >= 80 ? '#ff3366' : impulse >= 50 ? '#ff6b35' : impulse >= 30 ? '#ffd700' : '#00ff88'

  if (phase === 'done') {
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">🧊</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP · Impulse control trained</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">The highest-scoring player gives the least. Non-response is not weakness — it's the complete refusal to hand control to someone using bait.</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Badge variant="tier2" size="sm">Level 10</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
          <p className="text-[#8892b0] text-sm mt-1">{level.skill}</p>
        </div>

        <div className="bg-[#16213e] border border-[#1e2a4a] rounded-2xl p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-2">Round {roundIdx + 1} — {round.baitPattern}</p>
          <p className="text-sm text-[#b0b8cc] leading-relaxed">
            Bait messages will appear one by one. Your <span className="text-[#ff3366]">impulse meter</span> rises with each one.
          </p>
          <p className="text-sm text-[#b0b8cc] mt-2">
            The win is <span className="text-[#00ff88] font-semibold">NOT responding</span>. Hold until all baits are exhausted.
          </p>
        </div>

        <div className="bg-[#ff3366]/08 border border-[#ff3366]/20 rounded-xl p-4">
          <p className="text-xs font-mono text-[#ff3366] uppercase tracking-wider mb-1">The trap</p>
          <p className="text-xs text-[#8892b0]">Every response you give gives them control. Every non-response costs them power.</p>
        </div>

        <Button onClick={startRound} fullWidth>Start round {roundIdx + 1}</Button>
      </div>
    )
  }

  if (phase === 'round') {
    return (
      <div className="flex flex-col gap-5">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

        <div className="flex items-center justify-between">
          <div>
            <Badge variant="tier2" size="sm">Level 10</Badge>
            <h1 className="text-lg font-bold text-white mt-0.5">{level.title}</h1>
          </div>
          <p className="text-sm font-mono text-[#ffd700]">Round {roundIdx + 1}/{rounds.length}</p>
        </div>

        {/* Impulse meter */}
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-mono text-[#8892b0] uppercase tracking-wider">Impulse meter</span>
            <span className="text-xs font-mono font-bold" style={{ color: impulseColor }}>{Math.round(impulse)}%</span>
          </div>
          <motion.div className="h-4 bg-[#1a1a2e] rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${impulse}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full transition-colors duration-500"
              style={{ backgroundColor: impulseColor }}
            />
          </motion.div>
        </div>

        {/* Bait messages */}
        <div className="flex flex-col gap-2 min-h-[200px]">
          {round.baits.slice(0, baitIdx + 1).map((bait, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#ff3366]/10 border border-[#ff3366]/20 rounded-2xl p-4 rounded-bl-sm"
            >
              <p className="text-xs text-[#8892b0] font-mono mb-1">Them</p>
              <p className="text-sm text-[#b0b8cc]">{bait}</p>
            </motion.div>
          ))}
        </div>

        {/* Player options */}
        <div className="flex flex-col gap-2">
          <div className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-3 text-center">
            <p className="text-xs text-[#8892b0]">Holding… say nothing and wait</p>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#00ff88] mx-auto mt-2"
            />
          </div>
          <button
            onClick={takeBait}
            className="w-full py-3 rounded-xl border border-[#ff3366]/30 text-[#ff3366] text-sm font-medium hover:bg-[#ff3366]/10 transition-colors"
          >
            🪝 I can't help it — respond
          </button>
        </div>
      </div>
    )
  }

  // Result phase
  return (
    <div className="flex flex-col gap-5">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div>
        <Badge variant="tier2" size="sm">Level 10</Badge>
        <h1 className="text-xl font-bold text-white mt-1">{level.title} — Result</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl p-6 border text-center ${
          held ? 'bg-[#00ff88]/10 border-[#00ff88]/30' : 'bg-[#ff3366]/10 border-[#ff3366]/30'
        }`}
      >
        <p className="text-4xl mb-3">{held ? '🧊' : '🪝'}</p>
        <p className={`text-lg font-bold mb-2 ${held ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
          {held ? 'You held.' : 'Bait taken.'}
        </p>
        <p className="text-sm text-[#b0b8cc] leading-relaxed">
          {held ? round.winText : round.failText}
        </p>
      </motion.div>

      <Button onClick={nextRound} fullWidth>
        {roundIdx + 1 >= rounds.length ? 'Finish Level' : 'Next round →'}
      </Button>
    </div>
  )
}
