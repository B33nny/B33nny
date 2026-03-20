import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLevelById } from '../../data/levels'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { useSessionStore } from '../../store/sessionStore'
import { buildTacticalEmpathyCoachPrompt } from '../../services/llm'
import { useLLMConversation } from '../../hooks/useLLMConversation'
import { ConversationUI } from '../../components/game/ConversationUI'
import { RegulationMeter } from '../../components/game/RegulationMeter'
import { ReplayAnalysis } from '../../components/game/ReplayAnalysis'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(9)!

const techniques = [
  { id: 'mirror', label: 'Mirror', description: 'Repeat last 1–3 words with slight upward inflection', example: 'Them: "Nobody ever listens to me." → You: "Nobody ever listens?"' },
  { id: 'label', label: 'Label', description: 'Name the emotion: "It seems like… / It sounds like… / It looks like…"', example: '"It sounds like you\'re feeling completely unheard right now."' },
  { id: 'calibrated', label: 'Calibrated Q', description: 'Open "how/what" question (never "why" — sounds accusatory)', example: '"What\'s the most frustrating part of this for you?"' },
  { id: 'audit', label: 'Accusation Audit', description: 'Proactively name the negatives they might be thinking about you', example: '"I know this might seem like I\'m deflecting… I know you probably feel like your concerns don\'t matter to me…"' },
]

const scenarios = [
  { context: 'A colleague is visibly angry about being left off the project. They haven\'t said why yet.' },
  { context: 'Your partner says they feel like a roommate, not a partner. They\'re shutting down.' },
  { context: 'A team member pushes back hard in a meeting. They feel their work isn\'t being credited.' },
]

// Simple fallback for offline use
const fallbackResponses: Record<string, string[]> = {
  mirror: ["...yeah. Nobody does.", "Exactly. That's been going on for months.", "Right. Nobody does."],
  label: ["That's... actually exactly it. I feel like I'm invisible here.", "I didn't think you'd noticed. Yes.", "Yeah, that's fair."],
  calibrated: ["What bothers me most is that I put in the work and nobody acknowledges it.", "I just want to feel like my contributions matter.", "Honestly? I don't even know how to bring it up anymore."],
  audit: ["I didn't expect that. No, I don't think you're deflecting. I just... feel stuck.", "That's more honest than I expected.", "I'm listening."],
}

export function L09_TacticalEmpathy() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { resetSession } = useSessionStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [scenarioIdx] = useState(0)
  const [inputVal, setInputVal] = useState('')
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null)
  const [phase, setPhase] = useState<'intro' | 'conversation' | 'replay' | 'done'>('intro')
  const [useFallback, setUseFallback] = useState(false)
  const [fallbackMessages, setFallbackMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: string }>>([])
  const [techniqueUses, setTechniqueUses] = useState<Record<string, number>>({})

  const { messages, streaming, connected, error, send } = useLLMConversation({
    systemPrompt: buildTacticalEmpathyCoachPrompt(),
    regulationDeltaOnBait: 8,
    regulationDeltaOnGood: -8,
  })

  const displayMessages = useFallback ? fallbackMessages : messages

  const handleSend = (text: string) => {
    if (!selectedTechnique) return

    // Track technique usage
    setTechniqueUses(prev => ({ ...prev, [selectedTechnique]: (prev[selectedTechnique] ?? 0) + 1 }))

    if (useFallback) {
      const userMsg = { id: crypto.randomUUID(), role: 'user' as const, content: text, timestamp: new Date().toISOString() }
      const pool = fallbackResponses[selectedTechnique] ?? fallbackResponses.mirror
      const aiResponse = pool[Math.floor(Math.random() * pool.length)]
      const aiMsg = { id: crypto.randomUUID(), role: 'assistant' as const, content: aiResponse, timestamp: new Date().toISOString() }
      setFallbackMessages(prev => [...prev, userMsg, aiMsg])
    } else {
      send(text)
    }
    setSelectedTechnique(null)
  }

  const finish = () => {
    const score = Math.min(100, displayMessages.filter(m => m.role === 'user').length * 15)
    completeLevel({ levelId: 9, completedAt: new Date().toISOString(), score, maxScore: 100, timeSeconds: 0, patternsEncountered: [] })
    addDailyXP(level.xpReward)
    showToast(level.xpReward)
    setPhase('replay')
  }

  const handleDone = () => {
    resetSession()
    setPhase('done')
  }

  if (phase === 'done') {
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">🧠</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">Tactical empathy isn't warmth — it's precision. The label works because it shows you saw them, not because it agrees with them.</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  if (phase === 'replay') {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <Badge variant="tier2" size="sm">Level 9</Badge>
          <h1 className="text-xl font-bold text-white mt-1">Post-session Review</h1>
        </div>
        <ReplayAnalysis messages={displayMessages} levelTitle={level.title} onDone={handleDone} />
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Badge variant="tier2" size="sm">Level 9</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
        </div>

        <div className="bg-[#16213e] border border-[#1e2a4a] rounded-2xl p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-2">Your scenario</p>
          <p className="text-sm text-[#b0b8cc] leading-relaxed">{scenarios[scenarioIdx].context}</p>
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-3">Your toolkit</p>
          <div className="flex flex-col gap-2">
            {techniques.map(t => (
              <div key={t.id} className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-3">
                <p className="font-semibold text-white text-sm">{t.label}</p>
                <p className="text-xs text-[#8892b0] mt-0.5">{t.description}</p>
                <p className="text-xs text-[#00d4ff] mt-1 italic">e.g. "{t.example}"</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={() => setPhase('conversation')} fullWidth>Start practice</Button>
          <button
            onClick={() => { setUseFallback(true); setPhase('conversation') }}
            className="text-xs text-[#8892b0] underline text-center"
          >
            Ollama not running? Use scripted fallback →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div className="flex items-center justify-between">
        <div>
          <Badge variant="tier2" size="sm">Level 9</Badge>
          <h1 className="text-lg font-bold text-white mt-0.5">{level.title}</h1>
        </div>
        <Button onClick={finish} variant="secondary" size="sm">End &amp; Review</Button>
      </div>

      <RegulationMeter compact />

      {/* Technique selector */}
      <div>
        <p className="text-xs text-[#8892b0] mb-2 font-mono uppercase tracking-wider">Select your technique first, then type:</p>
        <div className="grid grid-cols-2 gap-2">
          {techniques.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTechnique(t.id)}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                selectedTechnique === t.id
                  ? 'bg-[#00d4ff]/15 border-[#00d4ff] text-[#00d4ff]'
                  : 'bg-[#16213e] border-[#1e2a4a] text-[#8892b0] hover:text-white'
              }`}
            >
              {t.label}
              {techniqueUses[t.id] ? <span className="ml-1 text-[#ffd700]">×{techniqueUses[t.id]}</span> : null}
            </button>
          ))}
        </div>
      </div>

      <ConversationUI
        messages={displayMessages}
        streaming={streaming && !useFallback}
        error={error}
        connected={connected}
        onSend={handleSend}
        inputValue={inputVal}
        onInputChange={setInputVal}
        disabled={!selectedTechnique}
        placeholder={selectedTechnique ? `Use ${techniques.find(t => t.id === selectedTechnique)?.label}…` : 'Select a technique above first'}
        personaName="Them"
      />

      {displayMessages.length >= 6 && (
        <Button onClick={finish} variant="secondary" fullWidth>Finish session →</Button>
      )}
    </div>
  )
}
