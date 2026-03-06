import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getLevelById } from '../../data/levels'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(4)!

interface Question {
  id: string
  situation: string
  emotion: string
  behaviour?: string
  options: Array<{ text: string; quality: 'best' | 'good' | 'neutral' | 'bad'; feedback: string }>
}

const questions: Question[] = [
  {
    id: 'q1',
    situation: 'Your friend texts: "I got passed over for the promotion again. I\'ve been working there for 5 years. I don\'t know what\'s wrong with me."',
    emotion: 'Defeated, self-doubting, hurt',
    options: [
      { text: '"At least you still have a job."', quality: 'bad', feedback: 'Minimises the experience. "At least" is a red flag — it signals dismissal.' },
      { text: '"That sounds genuinely painful. Five years of work and not getting recognition — I\'d be devastated too."', quality: 'best', feedback: 'Validates the specific feeling, names it, and communicates that the response is understandable. The gold standard.' },
      { text: '"Maybe it\'s a sign to look for other jobs!"', quality: 'neutral', feedback: 'Jumps to problem-solving before validating. The person isn\'t ready for solutions yet — they need to feel heard first.' },
      { text: '"That\'s so unfair! What happened?"', quality: 'good', feedback: 'Shows empathy and curiosity, which is good. But "so unfair" is your interpretation, not their feeling. Slight miss.' },
    ],
  },
  {
    id: 'q2',
    situation: 'Your partner says: "You\'re always on your phone when I\'m trying to talk to you. It makes me feel like I don\'t matter."',
    emotion: 'Unimportant, dismissed, disconnected',
    behaviour: 'They may have delivered this critically',
    options: [
      { text: '"I\'m not ALWAYS on my phone — you\'re exaggerating."', quality: 'bad', feedback: 'Defensiveness. Argues about the word "always" instead of hearing the feeling underneath.' },
      { text: '"I can see this matters to you. You\'re feeling like you\'re not a priority when I pick up my phone."', quality: 'best', feedback: 'Validates the emotional reality (feeling unimportant) without agreeing with every word. Classic selective validation.' },
      { text: '"Okay, I\'ll put the phone down."', quality: 'neutral', feedback: 'Solves the behaviour but skips the emotion entirely. The other person still feels unseen.' },
      { text: '"That hurts to hear. I didn\'t realise it was landing that way."', quality: 'good', feedback: 'Acknowledges the impact. Good, though doesn\'t explicitly name their feeling. Solid choice.' },
    ],
  },
  {
    id: 'q3',
    situation: 'A colleague confides: "I had a panic attack in the meeting today. I don\'t know how I\'m going to face everyone tomorrow."',
    emotion: 'Humiliated, anxious, exposed',
    options: [
      { text: '"Everyone has panic attacks sometimes. Don\'t worry about it."', quality: 'bad', feedback: 'Normalises to dismiss. "Don\'t worry about it" tells them how to feel — which is the opposite of validation.' },
      { text: '"That sounds mortifying. And the dread of facing it again tomorrow sounds exhausting."', quality: 'best', feedback: 'Names the specific emotion (mortifying) and validates the anticipatory anxiety. Full-spectrum validation.' },
      { text: '"Do you want me to help you with what to say tomorrow?"', quality: 'neutral', feedback: 'Good intention, but premature problem-solving before they feel heard.' },
      { text: '"That\'s a really hard thing to go through. How are you feeling now?"', quality: 'good', feedback: 'Validates and creates space for them to continue. Not as specific as "mortifying" but genuinely caring.' },
    ],
  },
  {
    id: 'q4',
    situation: 'Your sibling says: "You\'ve always been Mum\'s favourite. I\'ve never felt like I belonged in this family."',
    emotion: 'Invisible, unloved, resentful',
    options: [
      { text: '"That\'s not true — Mum loves us equally. You\'re being unfair."', quality: 'bad', feedback: 'Contradicts their experience. Whether or not it\'s factually accurate, their feeling is real. You\'ve just made it about you.' },
      { text: '"I didn\'t know you felt that way. That sounds like a painful thing to carry."', quality: 'best', feedback: 'Separates their emotional experience (valid) from the factual claim (which doesn\'t need to be debated right now). Creates space.' },
      { text: '"I\'m sure that\'s not how it was meant."', quality: 'bad', feedback: '"I\'m sure" invalidates. You\'re telling them what was meant, not acknowledging how it felt.' },
      { text: '"Wow, I\'ve never heard you say that before. Tell me more."', quality: 'good', feedback: 'Shows genuine curiosity and openness. Not explicitly validating, but creates the right conditions for it.' },
    ],
  },
  {
    id: 'q5',
    situation: 'A friend who just ended a difficult relationship says: "I know he was bad for me. So why do I miss him so much?"',
    emotion: 'Confused, grieving, self-judging',
    options: [
      { text: '"Because you have a pattern of choosing the wrong people."', quality: 'bad', feedback: 'Critical and unhelpful. Uses their vulnerability to judge them.' },
      { text: '"Missing someone and knowing they were bad for you can both be true at the same time. That\'s not a contradiction."', quality: 'best', feedback: 'Validates the confusion by naming it as legitimate — not a failure of logic. Deeply relieving to hear.' },
      { text: '"You\'ll get over it. Time heals everything."', quality: 'bad', feedback: 'Dismisses the present pain. "You\'ll get over it" is the verbal equivalent of a shrug.' },
      { text: '"Of course you miss him. Grief doesn\'t care about whether the relationship was healthy."', quality: 'good', feedback: 'Excellent. Grants permission to feel what they feel without judgment. Very close to best.' },
    ],
  },
]

export function L04_ValidateThis() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [trustPoints, setTrustPoints] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[currentIdx]

  const choose = (optIdx: number) => {
    if (selected !== null) return
    setSelected(optIdx)
    const quality = q.options[optIdx].quality
    if (quality === 'best') setTrustPoints(t => t + 3)
    else if (quality === 'good') setTrustPoints(t => t + 2)
    else if (quality === 'neutral') setTrustPoints(t => t + 1)
  }

  const next = () => {
    setSelected(null)
    if (currentIdx + 1 >= questions.length) {
      const score = trustPoints
      completeLevel({ levelId: 4, completedAt: new Date().toISOString(), score, maxScore: questions.length * 3, timeSeconds: 0, patternsEncountered: [] })
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
        <div className="text-5xl">{trustPoints >= 12 ? '🌟' : trustPoints >= 8 ? '✨' : '📈'}</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-[#00d4ff]">{trustPoints}</span>
          <span className="text-[#8892b0]">/ {questions.length * 3} trust points</span>
        </div>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP earned</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">Validation comes before anything else — before advice, before reassurance, before solutions. Feel first, fix second.</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  const qualityColors = { best: '#00ff88', good: '#00d4ff', neutral: '#ffd700', bad: '#ff3366' }
  const qualityLabels = { best: 'Best choice', good: 'Good', neutral: 'Neutral', bad: 'Avoid' }

  return (
    <div className="flex flex-col gap-5">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div className="flex items-center justify-between">
        <div>
          <Badge variant="tier1" size="sm">Level 4</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[#00d4ff]">{trustPoints} pts</p>
          <p className="text-xs text-[#8892b0]">{currentIdx + 1}/{questions.length}</p>
        </div>
      </div>

      <p className="text-sm text-[#8892b0]">Choose the <span className="text-[#00d4ff]">best</span> validating response. Validate the emotion — not the behaviour.</p>

      {/* Situation */}
      <div className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-2xl p-5">
        <p className="text-xs text-[#8892b0] mb-2 font-mono uppercase tracking-wider">Situation</p>
        <p className="text-[#b0b8cc] leading-relaxed text-sm">{q.situation}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-[#8892b0]">Feeling underneath:</span>
          <span className="text-xs text-[#ffd700] italic">{q.emotion}</span>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          const isSelected = selected === i
          const showResult = selected !== null
          const color = qualityColors[opt.quality]

          return (
            <motion.button
              key={i}
              whileTap={{ scale: selected !== null ? 1 : 0.98 }}
              onClick={() => choose(i)}
              className={`
                w-full text-left p-4 rounded-xl border text-sm transition-all
                ${!showResult ? 'bg-[#16213e] border-[#1e2a4a] text-white hover:border-[#00d4ff]/40 cursor-pointer' : ''}
                ${showResult && isSelected ? `border-2 text-white` : ''}
                ${showResult && !isSelected ? 'bg-[#0f0f1a] border-[#1a1a2e] text-[#3a3a5e]' : ''}
              `}
              style={showResult && isSelected ? { borderColor: color, backgroundColor: `${color}10` } : {}}
            >
              <p className="leading-relaxed">{opt.text}</p>
              {showResult && isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t"
                  style={{ borderColor: `${color}30` }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color }}>{qualityLabels[opt.quality]}</p>
                  <p className="text-xs text-[#8892b0]">{opt.feedback}</p>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {selected !== null && (
        <Button onClick={next} fullWidth>
          {currentIdx + 1 >= questions.length ? 'Finish Level' : 'Next →'}
        </Button>
      )}
    </div>
  )
}
