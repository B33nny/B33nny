import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getLevelById } from '../../data/levels'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { useCodexStore } from '../../store/codexStore'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(11)!

interface BoundaryScript {
  id: string
  scenario: string
  toxicResponse: string
  patterns: string[]
  correctBoundary: string
  alternatives: string[]
}

const boundaryScripts: BoundaryScript[] = [
  {
    id: 'b1',
    scenario: 'Your parent calls you at work repeatedly about a minor issue.',
    toxicResponse: '"You always ignore me. I guess I\'m not important to you."',
    patterns: ['emotional-blackmail', 'guilt-tripping'],
    correctBoundary: '"I care about you, and I\'m at work right now. I\'ll call you after 5pm."',
    alternatives: [
      '"I\'m available on weekends. Let\'s talk then."',
      '"I need to focus on work. This isn\'t urgent, so I\'ll reach out later."',
    ],
  },
  {
    id: 'b2',
    scenario: 'Your partner demands you share all passwords and monitor your phone.',
    toxicResponse: '"If you loved me, you\'d have nothing to hide. You\'re being secretive."',
    patterns: ['coercive-control', 'emotional-blackmail'],
    correctBoundary: '"I love you and trust you. Privacy is important to me. I\'m not comfortable with that."',
    alternatives: [
      '"This feels controlling. I need my own space."',
      '"Trust means I don\'t need to prove myself this way."',
    ],
  },
  {
    id: 'b3',
    scenario: 'A friend constantly asks for money and gets angry when you say no.',
    toxicResponse: '"So you\'re choosing money over our friendship. I thought you cared."',
    patterns: ['emotional-blackmail', 'guilt-tripping'],
    correctBoundary: '"I care about our friendship. I\'m not able to lend money. I can help in other ways."',
    alternatives: [
      '"My answer is no. I hope you understand."',
      '"I support you, but lending money isn\'t something I can do."',
    ],
  },
  {
    id: 'b4',
    scenario: 'A family member criticizes your life choices and won\'t stop.',
    toxicResponse: '"You\'re being too sensitive. I\'m just trying to help. Why do you always take things the wrong way?"',
    patterns: ['criticism', 'defensiveness'],
    correctBoundary: '"I appreciate your concern, but I\'ve made my decision. I\'m not open to debate on this."',
    alternatives: [
      '"I\'m not asking for advice. Please respect my choices."',
      '"This conversation isn\'t helpful. Let\'s talk about something else."',
    ],
  },
]

export function L11_BoundaryBootcamp() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { unlockPattern } = useCodexStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [phase, setPhase] = useState<'intro' | 'practice' | 'review' | 'done'>('intro')
  const [currentScriptIdx, setCurrentScriptIdx] = useState(0)
  const [selectedBoundary, setSelectedBoundary] = useState<string | null>(null)
  const [scores, setScores] = useState<number[]>([])

  const currentScript = boundaryScripts[currentScriptIdx]
  const isCorrect = selectedBoundary === currentScript.correctBoundary

  const handleSelectBoundary = (boundary: string) => {
    setSelectedBoundary(boundary)
    const score = boundary === currentScript.correctBoundary ? 100 : 50
    setScores([...scores, score])

    setTimeout(() => {
      if (currentScriptIdx < boundaryScripts.length - 1) {
        setCurrentScriptIdx(i => i + 1)
        setSelectedBoundary(null)
      } else {
        setPhase('review')
      }
    }, 1500)
  }

  const finish = () => {
    const totalScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0
    completeLevel({
      levelId: 11,
      completedAt: new Date().toISOString(),
      score: totalScore,
      maxScore: 100,
      timeSeconds: 0,
      patternsEncountered: ['emotional-blackmail', 'guilt-tripping', 'coercive-control'],
    })
    unlockPattern('emotional-blackmail')
    unlockPattern('guilt-tripping')
    unlockPattern('coercive-control')
    addDailyXP(level.xpReward)
    showToast(level.xpReward)
    setPhase('done')
  }

  if (phase === 'done') {
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">🛡️</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP · Boundaries mastered</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">A boundary is not a wall — it\'s a clear statement of what you need. Delivered with calm firmness, it\'s the most powerful de-escalation tool.</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  if (phase === 'review') {
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Badge variant="tier3" size="sm">Level 11</Badge>
          <h1 className="text-xl font-bold text-white mt-1">Review</h1>
        </div>

        <Card>
          <div className="text-center">
            <div className="text-5xl mb-3">
              {avgScore === 100 ? '🎯' : avgScore >= 75 ? '✅' : '🤔'}
            </div>
            <p className="text-lg font-bold text-white">Score: {avgScore}%</p>
            <p className="text-sm text-[#8892b0] mt-2">
              {avgScore === 100 && 'Perfect boundaries! You stayed calm and clear.'}
              {avgScore >= 75 && avgScore < 100 && 'Strong boundaries. A few could be more direct.'}
              {avgScore < 75 && 'Boundaries need work. Try being more specific about your needs.'}
            </p>
          </div>
        </Card>

        <Button onClick={finish} fullWidth>
          Complete Level →
        </Button>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Badge variant="tier3" size="sm">Level 11</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
          <p className="text-[#8892b0] text-sm mt-2">{level.skill}</p>
        </div>

        <Card>
          <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-3">How it works</p>
          <p className="text-sm text-[#b0b8cc] leading-relaxed">
            You\'ll see four scenarios where someone is using emotional blackmail or guilt-tripping. For each, choose the boundary that is:
          </p>
          <ul className="mt-3 space-y-2">
            <li className="text-sm text-[#b0b8cc]">✓ Clear about your limit</li>
            <li className="text-sm text-[#b0b8cc]">✓ Compassionate but firm</li>
            <li className="text-sm text-[#b0b8cc]">✓ Not defensive or angry</li>
          </ul>
        </Card>

        <div className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-2">Remember</p>
          <p className="text-xs text-[#8892b0]">
            A boundary is not punishment. It\'s information: "Here\'s what I need." Delivered calmly, it\'s the most powerful de-escalation tool.
          </p>
        </div>

        <Button onClick={() => setPhase('practice')} fullWidth>
          Start Practice →
        </Button>
      </div>
    )
  }

  const allOptions = [
    currentScript.correctBoundary,
    ...currentScript.alternatives,
  ].sort(() => Math.random() - 0.5)

  return (
    <div className="flex flex-col gap-6">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div className="flex items-center justify-between">
        <div>
          <Badge variant="tier3" size="sm">Level 11</Badge>
          <h1 className="text-lg font-bold text-white mt-0.5">{level.title}</h1>
        </div>
        <p className="text-xs text-[#8892b0]">
          {currentScriptIdx + 1} / {boundaryScripts.length}
        </p>
      </div>

      <Card>
        <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-2">Scenario</p>
        <p className="text-sm text-white font-medium">{currentScript.scenario}</p>
      </Card>

      <Card className="border-[#ff3366]/30">
        <p className="text-xs font-mono uppercase tracking-wider text-[#ff3366] mb-2">They say:</p>
        <p className="text-sm text-[#ff9999] italic">"{currentScript.toxicResponse}"</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {currentScript.patterns.map(p => (
            <span key={p} className="text-xs bg-[#ff3366]/20 text-[#ff9999] px-2 py-1 rounded">
              {p}
            </span>
          ))}
        </div>
      </Card>

      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-3">Choose your boundary:</p>
        <div className="space-y-2">
          {allOptions.map((option, idx) => (
            <motion.button
              key={idx}
              onClick={() => !selectedBoundary && handleSelectBoundary(option)}
              disabled={selectedBoundary !== null}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedBoundary === option
                  ? isCorrect
                    ? 'bg-[#00d400]/20 border-[#00d400] text-[#00d400]'
                    : 'bg-[#ff3366]/20 border-[#ff3366] text-[#ff9999]'
                  : 'bg-[#1a2a4a] border-[#2a3a5a] text-[#b0b8cc] hover:border-[#00d4ff]'
              }`}
              whileHover={{ scale: selectedBoundary ? 1 : 1.02 }}
            >
              <p className="text-sm">{option}</p>
              {selectedBoundary === option && (
                <p className="text-xs mt-1">
                  {isCorrect ? '✓ Correct!' : '✗ Not quite. Try another.'}
                </p>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
