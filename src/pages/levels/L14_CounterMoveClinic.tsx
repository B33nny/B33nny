import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getLevelById } from '../../data/levels'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { useCodexStore } from '../../store/codexStore'
import { useSessionStore } from '../../store/sessionStore'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(14)!

interface RapidFireRound {
  id: string
  pattern: string
  example: string
  correctMoves: string[]
  incorrectMoves: string[]
}

const rounds: RapidFireRound[] = [
  {
    id: 'r1',
    pattern: 'DARVO',
    example: '"You\'re being too sensitive. I never said that. You\'re the one who\'s been mean to me."',
    correctMoves: ['Re-anchor to original issue', 'Stay calm, don\'t defend', 'Label the pattern'],
    incorrectMoves: ['Defend yourself', 'Argue about what was said', 'Get emotional'],
  },
  {
    id: 'r2',
    pattern: 'Gaslighting',
    example: '"That never happened. You\'re making things up. I think you need therapy."',
    correctMoves: ['Trust your memory', 'Document facts', 'Disengage from debate'],
    incorrectMoves: ['Convince them you\'re right', 'Over-explain', 'Question your reality'],
  },
  {
    id: 'r3',
    pattern: 'Stonewalling',
    example: 'They go silent, won\'t respond to messages, won\'t engage.',
    correctMoves: ['Give space', 'Set a boundary on wait time', 'Disengage'],
    incorrectMoves: ['Keep pushing for response', 'Escalate pressure', 'Blame yourself'],
  },
  {
    id: 'r4',
    pattern: 'Contempt',
    example: '"You\'re so stupid. I can\'t believe I\'m with someone like you."',
    correctMoves: ['Don\'t accept the premise', 'Leave the situation', 'Seek support'],
    incorrectMoves: ['Try to prove your worth', 'Apologize for existing', 'Stay and absorb it'],
  },
  {
    id: 'r5',
    pattern: 'Circular Conversations',
    example: 'They keep bringing up the same point, never reaching resolution.',
    correctMoves: ['Name the loop', 'Suggest a break', 'Refuse to re-litigate'],
    incorrectMoves: ['Keep trying to explain', 'Get frustrated', 'Capitulate to end it'],
  },
  {
    id: 'r6',
    pattern: 'Baiting',
    example: '"If you really loved me, you\'d do this for me."',
    correctMoves: ['Don\'t take the bait', 'Respond to the actual request', 'Maintain your boundary'],
    incorrectMoves: ['React emotionally', 'Prove your love', 'Comply to show you care'],
  },
]

export function L14_CounterMoveClinic() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { unlockPattern } = useCodexStore()
  const { resetSession } = useSessionStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro')
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [selectedMoves, setSelectedMoves] = useState<Set<string>>(new Set())
  const [scores, setScores] = useState<number[]>([])
  const [streak, setStreak] = useState(0)

  const currentRound = rounds[currentRoundIdx]
  const allMoves = [...currentRound.correctMoves, ...currentRound.incorrectMoves].sort(
    () => Math.random() - 0.5
  )

  const handleSelectMove = (move: string) => {
    const newSelected = new Set(selectedMoves)
    if (newSelected.has(move)) {
      newSelected.delete(move)
    } else {
      newSelected.add(move)
    }
    setSelectedMoves(newSelected)
  }

  const handleSubmit = () => {
    const correct = currentRound.correctMoves.filter(m => selectedMoves.has(m)).length
    const incorrect = currentRound.incorrectMoves.filter(m => selectedMoves.has(m)).length
    const score = correct > 0 && incorrect === 0 ? 100 : Math.max(0, correct * 33 - incorrect * 50)

    setScores([...scores, score])

    if (score === 100) {
      setStreak(streak + 1)
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      if (currentRoundIdx < rounds.length - 1) {
        setCurrentRoundIdx(i => i + 1)
        setSelectedMoves(new Set())
      } else {
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0
        completeLevel({
          levelId: 14,
          completedAt: new Date().toISOString(),
          score: avgScore,
          maxScore: 100,
          timeSeconds: 0,
          patternsEncountered: level.patterns,
        })
        level.patterns.forEach(p => unlockPattern(p))
        addDailyXP(level.xpReward)
        showToast(level.xpReward)
        setPhase('done')
      }
    }, 1500)
  }

  if (phase === 'done') {
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">⚡</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP · Counter-moves mastered</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">Score: {avgScore}%</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">Speed and pattern recognition are your superpowers. The faster you name it, the faster you can respond.</p>
        <Button onClick={() => { resetSession(); navigate('/map'); }}>Continue →</Button>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Badge variant="tier3" size="sm">Level 14</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
          <p className="text-[#8892b0] text-sm mt-2">{level.skill}</p>
        </div>

        <Card>
          <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-3">How it works</p>
          <p className="text-sm text-[#b0b8cc] leading-relaxed">
            You\'ll see six rapid-fire scenarios. For each:
          </p>
          <ol className="mt-3 space-y-2">
            <li className="text-sm text-[#b0b8cc]">1. Identify the toxic pattern</li>
            <li className="text-sm text-[#b0b8cc]">2. Select all the RIGHT counter-moves</li>
            <li className="text-sm text-[#b0b8cc]">3. Avoid the traps (wrong moves)</li>
          </ol>
        </Card>

        <div className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-2">Scoring</p>
          <p className="text-xs text-[#8892b0]">
            ✓ All correct, no incorrect = 100 points<br/>
            ✓ Partial correct = partial points<br/>
            ✗ Any incorrect selected = penalty
          </p>
        </div>

        <Button onClick={() => setPhase('playing')} fullWidth>
          Start Clinic →
        </Button>
      </div>
    )
  }

  const isAnswered = selectedMoves.size > 0
  const correctSelected = currentRound.correctMoves.filter(m => selectedMoves.has(m)).length
  const incorrectSelected = currentRound.incorrectMoves.filter(m => selectedMoves.has(m)).length

  return (
    <div className="flex flex-col gap-6">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div className="flex items-center justify-between">
        <div>
          <Badge variant="tier3" size="sm">Level 14</Badge>
          <h1 className="text-lg font-bold text-white mt-0.5">Counter-Move Clinic</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#8892b0]">
            {currentRoundIdx + 1} / {rounds.length}
          </p>
          {streak > 0 && (
            <p className="text-xs text-[#ffd700] font-bold">🔥 Streak: {streak}</p>
          )}
        </div>
      </div>

      <ProgressBar value={currentRoundIdx} max={rounds.length} />

      <Card className="border-[#ff3366]/30">
        <p className="text-xs font-mono uppercase tracking-wider text-[#ff3366] mb-2">Pattern: {currentRound.pattern}</p>
        <p className="text-sm text-[#ff9999] italic">"{currentRound.example}"</p>
      </Card>

      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-3">Select the right counter-moves:</p>
        <div className="space-y-2">
          {allMoves.map((move, idx) => {
            const isCorrect = currentRound.correctMoves.includes(move)
            const isSelected = selectedMoves.has(move)

            return (
              <motion.button
                key={idx}
                onClick={() => handleSelectMove(move)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? isCorrect
                      ? 'bg-[#00d400]/20 border-[#00d400] text-[#00d400]'
                      : 'bg-[#ff3366]/20 border-[#ff3366] text-[#ff9999]'
                    : 'bg-[#1a2a4a] border-[#2a3a5a] text-[#b0b8cc] hover:border-[#00d4ff]'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? isCorrect
                        ? 'bg-[#00d400] border-[#00d400] text-[#0a1a2e]'
                        : 'bg-[#ff3366] border-[#ff3366] text-white'
                      : 'border-[#8892b0]'
                  }`}>
                    {isSelected ? (isCorrect ? '✓' : '✗') : ''}
                  </div>
                  <span className="text-sm">{move}</span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-center text-[#8892b0]"
        >
          {correctSelected}/{currentRound.correctMoves.length} correct
          {incorrectSelected > 0 && ` · ${incorrectSelected} incorrect`}
        </motion.div>
      )}

      <Button
        onClick={handleSubmit}
        fullWidth
        disabled={!isAnswered}
      >
        Submit →
      </Button>
    </div>
  )
}
