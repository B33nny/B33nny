import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getLevelById } from '../../data/levels'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { useSessionStore } from '../../store/sessionStore'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(13)!

interface NVCScenario {
  id: string
  situation: string
  example: string
  components: {
    observation: string
    feeling: string
    need: string
    request: string
  }
}

const scenarios: NVCScenario[] = [
  {
    id: 'nvc1',
    situation: 'Your partner forgot your birthday.',
    example: 'When you forgot my birthday, I felt hurt and disappointed. I need to feel valued and remembered. Would you be willing to set a reminder?',
    components: {
      observation: 'When you forgot my birthday',
      feeling: 'I felt hurt and disappointed',
      need: 'I need to feel valued and remembered',
      request: 'Would you be willing to set a reminder?',
    },
  },
  {
    id: 'nvc2',
    situation: 'Your colleague takes credit for your work.',
    example: 'When you presented my idea as yours in the meeting, I felt frustrated and disrespected. I need recognition for my contributions. I\'d like you to clarify my role next time.',
    components: {
      observation: 'When you presented my idea as yours in the meeting',
      feeling: 'I felt frustrated and disrespected',
      need: 'I need recognition for my contributions',
      request: 'I\'d like you to clarify my role next time',
    },
  },
  {
    id: 'nvc3',
    situation: 'Your friend cancels plans last minute.',
    example: 'When you cancelled last minute, I felt disappointed and let down. I need reliability and connection. Can we reschedule and both commit to it?',
    components: {
      observation: 'When you cancelled last minute',
      feeling: 'I felt disappointed and let down',
      need: 'I need reliability and connection',
      request: 'Can we reschedule and both commit to it?',
    },
  },
]

export function L13_NVCWorkshop() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { resetSession } = useSessionStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [phase, setPhase] = useState<'intro' | 'learn' | 'practice' | 'done'>('intro')
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0)
  const [userNVC, setUserNVC] = useState({
    observation: '',
    feeling: '',
    need: '',
    request: '',
  })
  const [scores, setScores] = useState<number[]>([])
  const [feedback, setFeedback] = useState<string>('')

  const currentScenario = scenarios[currentScenarioIdx]

  const scoreNVC = () => {
    let score = 0
    let feedbackText = ''

    // Simple heuristic scoring
    if (userNVC.observation.length > 10) {
      score += 25
    } else {
      feedbackText += 'Observation could be more specific. '
    }

    if (userNVC.feeling.length > 5) {
      score += 25
    } else {
      feedbackText += 'Include a feeling word. '
    }

    if (userNVC.need.length > 10) {
      score += 25
    } else {
      feedbackText += 'Name a universal human need. '
    }

    if (userNVC.request.length > 10) {
      score += 25
    } else {
      feedbackText += 'Make a specific, doable request. '
    }

    setScores([...scores, score])
    setFeedback(feedbackText || 'Great NVC statement!')

    setTimeout(() => {
      if (currentScenarioIdx < scenarios.length - 1) {
        setCurrentScenarioIdx(i => i + 1)
        setUserNVC({ observation: '', feeling: '', need: '', request: '' })
        setFeedback('')
      } else {
        setPhase('done')
      }
    }, 2000)
  }

  const finish = () => {
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0
    completeLevel({
      levelId: 13,
      completedAt: new Date().toISOString(),
      score: avgScore,
      maxScore: 100,
      timeSeconds: 0,
      patternsEncountered: [],
    })
    addDailyXP(level.xpReward)
    showToast(level.xpReward)
    resetSession()
    navigate('/map')
  }

  if (phase === 'done') {
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">💬</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP · NVC mastered</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">Score: {avgScore}%</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">Nonviolent Communication transforms conflict into connection. Practice makes it natural.</p>
        <Button onClick={finish}>Continue →</Button>
      </div>
    )
  }

  if (phase === 'learn') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Badge variant="tier3" size="sm">Level 13</Badge>
          <h1 className="text-xl font-bold text-white mt-1">NVC Structure</h1>
        </div>

        <Card>
          <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-3">The four components</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-white">1. Observation</p>
              <p className="text-xs text-[#8892b0]">What happened, without judgment or interpretation.</p>
              <p className="text-xs text-[#b0b8cc] mt-1 italic">Example: "When you raised your voice in the meeting..."</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white">2. Feeling</p>
              <p className="text-xs text-[#8892b0]">Your genuine emotional response.</p>
              <p className="text-xs text-[#b0b8cc] mt-1 italic">Example: "...I felt embarrassed and anxious..."</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white">3. Need</p>
              <p className="text-xs text-[#8892b0]">A universal human need that wasn\'t met.</p>
              <p className="text-xs text-[#b0b8cc] mt-1 italic">Example: "...because I need respect and safety..."</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white">4. Request</p>
              <p className="text-xs text-[#8892b0]">A specific, doable action you\'re asking for.</p>
              <p className="text-xs text-[#b0b8cc] mt-1 italic">Example: "...Would you be willing to speak more quietly?"</p>
            </div>
          </div>
        </Card>

        <Card className="border-[#00d400]/30">
          <p className="text-xs font-mono uppercase tracking-wider text-[#00d400] mb-2">Full example</p>
          <p className="text-sm text-[#b0b8cc]">"{currentScenario.example}"</p>
        </Card>

        <Button onClick={() => setPhase('practice')} fullWidth>
          Try It Yourself →
        </Button>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Badge variant="tier3" size="sm">Level 13</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
          <p className="text-[#8892b0] text-sm mt-2">{level.skill}</p>
        </div>

        <Card>
          <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-3">What is NVC?</p>
          <p className="text-sm text-[#b0b8cc] leading-relaxed">
            Nonviolent Communication (NVC) is a framework for expressing yourself in a way that\'s honest, clear, and compassionate. Instead of blame or judgment, you focus on:
          </p>
          <ul className="mt-3 space-y-2">
            <li className="text-sm text-[#b0b8cc]">What you observed</li>
            <li className="text-sm text-[#b0b8cc]">How you felt</li>
            <li className="text-sm text-[#b0b8cc]">What you need</li>
            <li className="text-sm text-[#b0b8cc]">What you\'re asking for</li>
          </ul>
        </Card>

        <div className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-2">Why it works</p>
          <p className="text-xs text-[#8892b0]">
            NVC bypasses defensiveness because it\'s not an attack. You\'re not saying "You\'re bad." You\'re saying "I need something." That\'s hard to argue with.
          </p>
        </div>

        <Button onClick={() => setPhase('learn')} fullWidth>
          Learn the Structure →
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div>
        <Badge variant="tier3" size="sm">Level 13</Badge>
        <h1 className="text-lg font-bold text-white mt-1">Practice NVC</h1>
        <p className="text-xs text-[#8892b0] mt-2">
          {currentScenarioIdx + 1} / {scenarios.length}
        </p>
      </div>        <Card>
          <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-2">Situation</p>       <p className="text-sm text-white font-medium">{currentScenario.situation}</p>
      </Card>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] block mb-2">
            1. Observation (what happened)
          </label>
          <textarea
            value={userNVC.observation}
            onChange={(e) => setUserNVC({ ...userNVC, observation: e.target.value })}
            placeholder="When you..."
            className="w-full bg-[#1a2a4a] border border-[#2a3a5a] rounded-lg p-3 text-sm text-white placeholder-[#8892b0] focus:outline-none focus:border-[#00d4ff]"
            rows={2}
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] block mb-2">
            2. Feeling (your emotion)
          </label>
          <textarea
            value={userNVC.feeling}
            onChange={(e) => setUserNVC({ ...userNVC, feeling: e.target.value })}
            placeholder="I felt..."
            className="w-full bg-[#1a2a4a] border border-[#2a3a5a] rounded-lg p-3 text-sm text-white placeholder-[#8892b0] focus:outline-none focus:border-[#00d4ff]"
            rows={2}
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] block mb-2">
            3. Need (universal human need)
          </label>
          <textarea
            value={userNVC.need}
            onChange={(e) => setUserNVC({ ...userNVC, need: e.target.value })}
            placeholder="I need..."
            className="w-full bg-[#1a2a4a] border border-[#2a3a5a] rounded-lg p-3 text-sm text-white placeholder-[#8892b0] focus:outline-none focus:border-[#00d4ff]"
            rows={2}
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] block mb-2">
            4. Request (specific action)
          </label>
          <textarea
            value={userNVC.request}
            onChange={(e) => setUserNVC({ ...userNVC, request: e.target.value })}
            placeholder="Would you be willing to..."
            className="w-full bg-[#1a2a4a] border border-[#2a3a5a] rounded-lg p-3 text-sm text-white placeholder-[#8892b0] focus:outline-none focus:border-[#00d4ff]"
            rows={2}
          />
        </div>
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${
            feedback.includes('Great')
              ? 'bg-[#00d400]/20 border border-[#00d400] text-[#00d400]'
              : 'bg-[#ffd700]/20 border border-[#ffd700] text-[#ffd700]'
          }`}
        >
          {feedback}
        </motion.div>
      )}

      <Button
        onClick={scoreNVC}
        fullWidth
        disabled={!userNVC.observation || !userNVC.feeling || !userNVC.need || !userNVC.request}
      >
        Submit & Continue →
      </Button>
    </div>
  )
}
