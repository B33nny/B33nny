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

const level = getLevelById(12)!

interface TimelineEvent {
  week: number
  event: string
  pattern: string
  emotional: string
}

const timeline: TimelineEvent[] = [
  {
    week: 1,
    event: 'They text you constantly, plan elaborate dates, say "I\'ve never felt this way before."',
    pattern: 'love-bombing',
    emotional: 'You feel euphoric, special, chosen.',
  },
  {
    week: 3,
    event: 'Suddenly distant. They\'re "busy," respond late. When they do, it\'s cold.',
    pattern: 'intermittent-reinforcement',
    emotional: 'You feel anxious, confused. You try harder to get their attention back.',
  },
  {
    week: 5,
    event: 'They reappear with apologies and affection. "I was scared of how much I care."',
    pattern: 'hoovering',
    emotional: 'Relief floods you. You feel grateful, bonded, willing to overlook the hurt.',
  },
  {
    week: 7,
    event: 'They pull away again, but this time you\'re more anxious. You initiate contact desperately.',
    pattern: 'intermittent-reinforcement',
    emotional: 'You feel desperate, willing to accept crumbs of attention.',
  },
  {
    week: 9,
    event: 'They reappear with promises: "I\'ve changed. Let\'s move in together / get married."',
    pattern: 'future-faking',
    emotional: 'You feel hopeful, invested. You overlook red flags.',
  },
  {
    week: 11,
    event: 'The cycle repeats. You\'re now emotionally trapped, constantly seeking the high.',
    pattern: 'intermittent-reinforcement',
    emotional: 'You feel addicted, unable to leave despite the pain.',
  },
]

export function L12_ReinforcementTrap() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { unlockPattern } = useCodexStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [phase, setPhase] = useState<'intro' | 'timeline' | 'analysis' | 'done'>('intro')
  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set())
  const [score, setScore] = useState(0)

  const correctIdentifications = [0, 1, 2, 3, 4, 5]

  const handleToggleEvent = (idx: number) => {
    const newSelected = new Set(selectedEvents)
    if (newSelected.has(idx)) {
      newSelected.delete(idx)
    } else {
      newSelected.add(idx)
    }
    setSelectedEvents(newSelected)
  }

  const handleSubmit = () => {
    const correct = correctIdentifications.filter(idx => selectedEvents.has(idx)).length
    const accuracy = Math.round((correct / correctIdentifications.length) * 100)
    setScore(accuracy)
    setPhase('analysis')
  }

  const finish = () => {
    completeLevel({
      levelId: 12,
      completedAt: new Date().toISOString(),
      score,
      maxScore: 100,
      timeSeconds: 0,
      patternsEncountered: ['intermittent-reinforcement', 'love-bombing', 'hoovering', 'future-faking'],
    })
    unlockPattern('intermittent-reinforcement')
    unlockPattern('love-bombing')
    unlockPattern('hoovering')
    unlockPattern('future-faking')
    addDailyXP(level.xpReward)
    showToast(level.xpReward)
    setPhase('done')
  }

  if (phase === 'done') {
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">🎢</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP · Reinforcement trap decoded</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">Intermittent reinforcement is one of the most powerful psychological hooks. Awareness is the first step to breaking free.</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  if (phase === 'analysis') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Badge variant="tier3" size="sm">Level 12</Badge>
          <h1 className="text-xl font-bold text-white mt-1">Analysis</h1>
        </div>

        <Card>
          <div className="text-center">
            <div className="text-5xl mb-3">
              {score === 100 ? '🎯' : score >= 75 ? '✅' : '🤔'}
            </div>
            <p className="text-lg font-bold text-white">Score: {score}%</p>
            <p className="text-sm text-[#8892b0] mt-2">
              {score === 100 && 'Perfect! You see the full cycle of intermittent reinforcement.'}
              {score >= 75 && score < 100 && 'Good catch. You identified most of the pattern.'}
              {score < 75 && 'The trap is subtle. Review the timeline again.'}
            </p>
          </div>
        </Card>

        <Card className="border-[#ffd700]/30">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-2">Key insight</p>
          <p className="text-sm text-[#b0b8cc]">
            Intermittent reinforcement is more addictive than consistent reward. Your brain releases dopamine when you\'re uncertain — this is why slot machines are addictive, and why this cycle is so hard to escape.
          </p>
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
          <Badge variant="tier3" size="sm">Level 12</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
          <p className="text-[#8892b0] text-sm mt-2">{level.skill}</p>
        </div>

        <Card>
          <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-3">The trap</p>
          <p className="text-sm text-[#b0b8cc] leading-relaxed">
            Intermittent reinforcement is one of the most powerful psychological hooks. A reward that comes unpredictably is more addictive than one that\'s consistent.
          </p>
          <p className="text-sm text-[#b0b8cc] mt-3">
            In this level, you\'ll see an 11-week timeline of a relationship caught in this cycle. Your job: identify every moment where the pattern appears.
          </p>
        </Card>

        <div className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-2">The cycle</p>
          <ul className="space-y-2">
            <li className="text-xs text-[#8892b0]"><span className="text-white">Love-bombing</span>: Intense affection</li>
            <li className="text-xs text-[#8892b0]"><span className="text-white">Withdrawal</span>: Sudden coldness</li>
            <li className="text-xs text-[#8892b0]"><span className="text-white">Hoovering</span>: Return with apologies</li>
            <li className="text-xs text-[#8892b0]"><span className="text-white">Repeat</span>: Each cycle gets more intense</li>
          </ul>
        </div>

        <Button onClick={() => setPhase('timeline')} fullWidth>
          View Timeline →
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div>
        <Badge variant="tier3" size="sm">Level 12</Badge>
        <h1 className="text-lg font-bold text-white mt-1">{level.title}</h1>
        <p className="text-xs text-[#8892b0] mt-2">Click each event that shows intermittent reinforcement or related patterns</p>
      </div>

      <div className="space-y-3">
        {timeline.map((event, idx) => (
          <motion.button
            key={idx}
            onClick={() => handleToggleEvent(idx)}
            className={`w-full text-left p-4 rounded-lg border transition-all ${
              selectedEvents.has(idx)
                ? 'bg-[#00d4ff]/20 border-[#00d4ff]'
                : 'bg-[#1a2a4a] border-[#2a3a5a] hover:border-[#00d4ff]'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center text-xs font-bold ${
                selectedEvents.has(idx)
                  ? 'bg-[#00d4ff] border-[#00d4ff] text-[#0a1a2e]'
                  : 'border-[#8892b0]'
              }`}>
                {selectedEvents.has(idx) ? '✓' : ''}
              </div>
              <div className="flex-1">
                <p className="text-xs font-mono text-[#8892b0] mb-1">Week {event.week}</p>
                <p className="text-sm text-white">{event.event}</p>
                <p className="text-xs text-[#8892b0] mt-2">
                  <span className="text-[#ffd700]">Feeling:</span> {event.emotional}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <Button onClick={handleSubmit} fullWidth variant="primary">
        Submit Analysis →
      </Button>
    </div>
  )
}
