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

const level = getLevelById(3)!

const horsemenData = {
  criticism: {
    label: 'Criticism',
    color: '#ff3366',
    description: 'Attacking character, not behaviour. Implies a global defect.',
    antidote: 'Complaint — specific, observable, about the behaviour not the person.',
  },
  contempt: {
    label: 'Contempt',
    color: '#ff6b35',
    description: 'Treating someone as inferior. Eye-rolls, sarcasm, mockery, name-calling.',
    antidote: 'Culture of appreciation. Build more positives than negatives.',
  },
  defensiveness: {
    label: 'Defensiveness',
    color: '#ffd700',
    description: 'Counter-attacking, making excuses, cross-complaining in response to feedback.',
    antidote: 'Accept responsibility for some part of the complaint — even 1%.',
  },
  stonewalling: {
    label: 'Stonewalling',
    color: '#8892b0',
    description: 'Emotional shutdown and withdrawal from interaction.',
    antidote: 'Physiological self-soothing. Take a break, set a return time.',
  },
}

const exercises = [
  {
    id: 'e1',
    horseman: 'criticism' as const,
    toxic: '"You\'re so lazy — you never help around the house."',
    healthy: '"The dishes from Monday are still in the sink. I feel exhausted and I need more support with this."',
    explanation: 'Criticism attacks who they are ("lazy"). The complaint names a specific, observable event and uses "I feel" + need.',
  },
  {
    id: 'e2',
    horseman: 'contempt' as const,
    toxic: '"[eye-roll] Oh sure, because everything is always about YOU. Grow up."',
    healthy: '"I feel like I\'m being cut off before I finish. I\'d like us both to be able to speak without interruption."',
    explanation: 'Contempt uses mockery and positions the person as inferior. The antidote states the need without attacking the person\'s worth.',
  },
  {
    id: 'e3',
    horseman: 'defensiveness' as const,
    toxic: '"Well if YOU\'d told me, I\'d have known! Don\'t blame this on me."',
    healthy: '"You\'re right, I should have checked. I missed that. What can I do now?"',
    explanation: 'Defensiveness counter-attacks. The antidote accepts a specific part of the responsibility, even briefly.',
  },
  {
    id: 'e4',
    horseman: 'stonewalling' as const,
    toxic: '[Closes the laptop. Leaves the room. Does not return. No time set.]',
    healthy: '"I\'m overwhelmed right now and I need 30 minutes. Can we come back to this at 8pm?"',
    explanation: 'Stonewalling leaves things unresolved and creates anxiety. The antidote names the need and commits to a return time.',
  },
]

export function L03_FourHorsemen() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { unlockPattern } = useCodexStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [phase, setPhase] = useState<'intro' | 'exercise' | 'done'>('intro')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)

  const exercise = exercises[currentIdx]
  const horseman = horsemenData[exercise.horseman]

  const handleReveal = () => {
    setRevealed(true)
    setScore(s => s + 1)
    unlockPattern(exercise.horseman)
    unlockPattern('contempt')
    unlockPattern('stonewalling')
    unlockPattern('defensiveness')
  }

  const next = () => {
    setRevealed(false)
    if (currentIdx + 1 >= exercises.length) {
      completeLevel({ levelId: 3, completedAt: new Date().toISOString(), score, maxScore: exercises.length, timeSeconds: 0, patternsEncountered: ['criticism', 'contempt', 'defensiveness', 'stonewalling'] })
      addDailyXP(level.xpReward)
      showToast(level.xpReward)
      setPhase('done')
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Badge variant="tier1" size="sm">Level 3</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
          <p className="text-[#8892b0] text-sm mt-2">Gottman's research identified four communication patterns that predict relationship breakdown with over 90% accuracy.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(horsemenData).map(([key, h]) => (
            <div key={key} className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4">
              <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: h.color }} />
              <p className="font-bold text-white text-sm mb-1">{h.label}</p>
              <p className="text-xs text-[#8892b0] leading-relaxed">{h.description}</p>
            </div>
          ))}
        </div>

        <Button onClick={() => setPhase('exercise')} fullWidth>Start exercises →</Button>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP earned · 4 patterns unlocked in Codex</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">The antidote for all four horsemen begins with taking responsibility for your own state, not attacking theirs.</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="tier1" size="sm">Level 3</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
        </div>
        <p className="text-sm text-[#8892b0]">{currentIdx + 1}/{exercises.length}</p>
      </div>

      {/* Horseman label */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: horseman.color }} />
        <Badge variant="common" size="sm">{horseman.label}</Badge>
        <p className="text-xs text-[#8892b0]">— Antidote: {horseman.antidote.split('.')[0]}</p>
      </div>

      {/* Side by side */}
      <div className="grid grid-cols-1 gap-3">
        {/* Toxic */}
        <div className="bg-[#ff3366]/08 border border-[#ff3366]/20 rounded-2xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ff3366] mb-2">✗ Toxic</p>
          <p className="text-sm text-[#b0b8cc] italic leading-relaxed">{exercise.toxic}</p>
        </div>

        {/* Healthy (blurred until revealed) */}
        <div className={`bg-[#00ff88]/08 border border-[#00ff88]/20 rounded-2xl p-4 transition-all ${revealed ? '' : 'blur-sm select-none'}`}>
          <p className="text-xs font-mono uppercase tracking-wider text-[#00ff88] mb-2">✓ Healthy alternative</p>
          <p className="text-sm text-[#b0b8cc] italic leading-relaxed">{exercise.healthy}</p>
        </div>
      </div>

      {/* Reveal button / explanation */}
      <AnimatePresence>
        {!revealed ? (
          <Button onClick={handleReveal} variant="secondary" fullWidth>
            Reveal healthy alternative
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4 mb-3">
              <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-2">Why it works</p>
              <p className="text-sm text-[#b0b8cc] leading-relaxed">{exercise.explanation}</p>
            </div>
            <Button onClick={next} fullWidth>
              {currentIdx + 1 >= exercises.length ? 'Finish Level' : 'Next →'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
