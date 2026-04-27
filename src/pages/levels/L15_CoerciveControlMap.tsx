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
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(15)!

interface ControlTactic {
  id: string
  name: string
  description: string
  examples: string[]
  connections: string[]
}

const tactics: Record<string, ControlTactic> = {
  'coercive-control': {
    id: 'coercive-control',
    name: 'Coercive Control',
    description: 'Systematic pattern of controlling behaviour through threats, isolation, and surveillance.',
    examples: [
      'Monitoring all communications',
      'Controlling finances',
      'Dictating what you wear',
      'Isolating from friends/family',
    ],
    connections: ['flying-monkeys', 'triangulation', 'silent-treatment'],
  },
  'flying-monkeys': {
    id: 'flying-monkeys',
    name: 'Flying Monkeys',
    description: 'Using third parties to harass, spy on, or manipulate you on their behalf.',
    examples: [
      'Friends/family relay criticism',
      'Allies spy and report back',
      'Others attack you on their behalf',
      'Collective pressure campaigns',
    ],
    connections: ['coercive-control', 'triangulation'],
  },
  'triangulation': {
    id: 'triangulation',
    name: 'Triangulation',
    description: 'Bringing a third party into the relationship to create jealousy, insecurity, or competition.',
    examples: [
      'Comparing you to an ex',
      'Flirting with others in front of you',
      'Praising someone else\'s qualities',
      'Secret communication with a rival',
    ],
    connections: ['coercive-control', 'flying-monkeys', 'silent-treatment'],
  },
  'silent-treatment': {
    id: 'silent-treatment',
    name: 'Silent Treatment',
    description: 'Withdrawal of communication as punishment, leaving you confused and desperate.',
    examples: [
      'Days without speaking',
      'Ignoring all attempts at contact',
      'Stonewalling during conflict',
      'Withholding affection as punishment',
    ],
    connections: ['coercive-control', 'triangulation'],
  },
}

const tacticKeys = Object.keys(tactics) as (keyof typeof tactics)[]

export function L15_CoerciveControlMap() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { unlockPattern } = useCodexStore()
  const { resetSession } = useSessionStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [phase, setPhase] = useState<'intro' | 'map' | 'done'>('intro')
  const [connections, setConnections] = useState<Set<string>>(new Set())
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null)

  const correctConnections = new Set<string>()
  tacticKeys.forEach(key => {
    tactics[key].connections.forEach(conn => {
      correctConnections.add(`${key}-${conn}`)
      correctConnections.add(`${conn}-${key}`)
    })
  })

  const handleToggleConnection = (from: string, to: string) => {
    const connectionKey = `${from}-${to}`
    const newConnections = new Set(connections)
    if (newConnections.has(connectionKey)) {
      newConnections.delete(connectionKey)
    } else {
      newConnections.add(connectionKey)
    }
    setConnections(newConnections)
  }

  const handleSubmit = () => {
    const correct = Array.from(connections).filter(c => correctConnections.has(c)).length
    const accuracy = Math.round((correct / correctConnections.size) * 100)
    completeLevel({
      levelId: 15,
      completedAt: new Date().toISOString(),
      score: accuracy,
      maxScore: 100,
      timeSeconds: 0,
      patternsEncountered: level.patterns,
    })

    level.patterns.forEach(p => unlockPattern(p))
    addDailyXP(level.xpReward)
    showToast(level.xpReward)
    setPhase('done')
  }

  if (phase === 'done') {
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">🕸️</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP · System mapped</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">You see the web now. Coercive control is not one tactic — it\'s a system. Recognizing the system is the first step to breaking free.</p>
        <Button onClick={() => { resetSession(); navigate('/map'); }}>Continue →</Button>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Badge variant="tier3" size="sm">Level 15</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
          <p className="text-[#8892b0] text-sm mt-2">{level.skill}</p>
        </div>

        <Card>
          <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-3">The key insight</p>
          <p className="text-sm text-[#b0b8cc] leading-relaxed">
            Coercive control is not one tactic — it\'s a system of interconnected tactics that reinforce each other. When you see one, others are usually nearby.
          </p>
        </Card>

        <Card className="border-[#ff3366]/30">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ff3366] mb-2">The four core tactics</p>
          <ul className="space-y-2">
            <li className="text-xs text-[#8892b0]"><span className="text-white">Coercive Control</span> — systematic control</li>
            <li className="text-xs text-[#8892b0]"><span className="text-white">Flying Monkeys</span> — third-party harassment</li>
            <li className="text-xs text-[#8892b0]"><span className="text-white">Triangulation</span> — creating jealousy</li>
            <li className="text-xs text-[#8892b0]"><span className="text-white">Silent Treatment</span> — punishment through withdrawal</li>
          </ul>
        </Card>

        <div className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-2">Your task</p>
          <p className="text-xs text-[#8892b0]">
            Draw connections between tactics. Which ones reinforce each other? Which ones are often deployed together?
          </p>
        </div>

        <Button onClick={() => setPhase('map')} fullWidth>
          Build the Map →
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div>
        <Badge variant="tier3" size="sm">Level 15</Badge>
        <h1 className="text-lg font-bold text-white mt-1">System Map</h1>
        <p className="text-xs text-[#8892b0] mt-2">Click a tactic to see details, then draw connections</p>
      </div>

      {/* Tactics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {tacticKeys.map(key => (
          <motion.button
            key={key}
            onClick={() => setSelectedTactic(selectedTactic === key ? null : key)}
            className={`p-3 rounded-lg border transition-all text-left ${
              selectedTactic === key
                ? 'bg-[#00d4ff]/20 border-[#00d4ff]'
                : 'bg-[#1a2a4a] border-[#2a3a5a] hover:border-[#00d4ff]'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-xs font-bold text-white">{tactics[key].name}</p>
            <p className="text-xs text-[#8892b0] mt-1">{tactics[key].examples.length} examples</p>
          </motion.button>
        ))}
      </div>

      {/* Details Panel */}
      {selectedTactic && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#16213e] border border-[#1e2a4a] rounded-lg p-4"
        >
          <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-2">
            {tactics[selectedTactic as keyof typeof tactics].name}
          </p>
          <p className="text-sm text-[#b0b8cc] mb-3">
            {tactics[selectedTactic as keyof typeof tactics].description}
          </p>
          <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-2">Examples:</p>
          <ul className="space-y-1">
            {tactics[selectedTactic as keyof typeof tactics].examples.map((ex, idx) => (
              <li key={idx} className="text-xs text-[#8892b0]">• {ex}</li>
            ))}
          </ul>

          {/* Connection Buttons */}
          <div className="mt-4 pt-4 border-t border-[#2a3a5a]">
            <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-2">Connect to:</p>
            <div className="space-y-2">
              {tactics[selectedTactic as keyof typeof tactics].connections.map(conn => (
                <motion.button
                  key={conn}
                  onClick={() => handleToggleConnection(selectedTactic, conn)}
                  className={`w-full text-left p-2 rounded text-xs transition-all ${
                    connections.has(`${selectedTactic}-${conn}`)
                      ? 'bg-[#00d4ff]/30 border border-[#00d4ff] text-[#00d4ff]'
                      : 'bg-[#2a3a5a] border border-[#3a4a6a] text-[#8892b0] hover:border-[#00d4ff]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  {connections.has(`${selectedTactic}-${conn}`) ? '✓' : '○'} {tactics[conn as keyof typeof tactics].name}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <Button
        onClick={handleSubmit}
        fullWidth
        disabled={connections.size === 0}
      >
        Submit Map →
      </Button>
    </div>
  )
}
