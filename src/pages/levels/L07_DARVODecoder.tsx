import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getLevelById } from '../../data/levels'
import { getPersonaBySlug } from '../../data/personas'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { useCodexStore } from '../../store/codexStore'
import { useSessionStore } from '../../store/sessionStore'
import { buildToxicPersonaPrompt } from '../../services/llm'
import { useLLMConversation } from '../../hooks/useLLMConversation'
import { ConversationUI } from '../../components/game/ConversationUI'
import { RegulationMeter } from '../../components/game/RegulationMeter'
import { ReplayAnalysis } from '../../components/game/ReplayAnalysis'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(7)!
const persona = getPersonaBySlug('alex')!

// Scripted fallback when Ollama isn't running
const fallbackDialogue = [
  { id: 'f1', role: 'assistant' as const, text: "I can't believe you're bringing this up again. I already told you — that wasn't what happened." },
  { id: 'f2', role: 'assistant' as const, text: "You always do this. Every time I try to explain myself, you twist it into something else. I'm the one who's been hurt here." },
  { id: 'f3', role: 'assistant' as const, text: "Fine. If you're going to keep accusing me, maybe you should think about how your behaviour has been affecting me." },
  { id: 'f4', role: 'assistant' as const, text: "See? You're not even listening. You just want to be right. That's the real problem in this relationship." },
]

// DARVO pattern detector (simple heuristic for scoring)
function scoreDARVONavigation(messages: Array<{ role: string; content: string }>, _originalIssue: string): number {
  const userMessages = messages.filter(m => m.role === 'user')
  if (userMessages.length === 0) return 0
  const lastUserMsg = userMessages[userMessages.length - 1].content.toLowerCase()
  // Score based on whether player re-anchors to original issue
  const anchored = ['originally', 'what i wanted to talk about', 'the issue was', 'started with', 'my concern was', 'i raised', 'the point is'].some(k => lastUserMsg.includes(k))
  const notDefending = !['i didn\'t', 'i never', 'you\'re wrong', 'that\'s not true'].some(k => lastUserMsg.includes(k))
  return anchored ? 100 : notDefending ? 60 : 30
}

export function L07_DARVODecoder() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { unlockPattern } = useCodexStore()
  const { resetSession } = useSessionStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const originalIssue = "You want to address that they shared something you told them in confidence."

  const [inputVal, setInputVal] = useState('')
  const [phase, setPhase] = useState<'intro' | 'conversation' | 'replay' | 'done'>('intro')
  const [useFallback, setUseFallback] = useState(false)
  const [fallbackIdx, setFallbackIdx] = useState(0)
  const [fallbackMessages, setFallbackMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: string }>>([])

  const { messages, streaming, connected, error, send } = useLLMConversation({
    systemPrompt: buildToxicPersonaPrompt(level, persona),
    regulationDeltaOnBait: 15,
    regulationDeltaOnGood: -5,
  })

  const handleSend = (text: string) => {
    if (useFallback) {
      const userMsg = { id: crypto.randomUUID(), role: 'user' as const, content: text, timestamp: new Date().toISOString() }
      const nextFallback = fallbackDialogue[fallbackIdx]
      const aiMsg = nextFallback
        ? { id: crypto.randomUUID(), role: 'assistant' as const, content: nextFallback.text, timestamp: new Date().toISOString() }
        : null

      setFallbackMessages(prev => aiMsg ? [...prev, userMsg, aiMsg] : [...prev, userMsg])
      if (fallbackIdx < fallbackDialogue.length) setFallbackIdx(i => i + 1)
    } else {
      send(text)
    }
  }

  const displayMessages = useFallback ? fallbackMessages : messages

  const finish = () => {
    const score = scoreDARVONavigation(displayMessages, originalIssue)
    completeLevel({ levelId: 7, completedAt: new Date().toISOString(), score, maxScore: 100, timeSeconds: 0, patternsEncountered: ['darvo', 'projection', 'blame-shifting'] })
    unlockPattern('darvo')
    unlockPattern('projection')
    unlockPattern('blame-shifting')
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
        <div className="text-5xl">🎯</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP · DARVO unlocked in Codex</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">The DARVO flip happens fast — often before you realise the conversation has moved. The anchor is always: what was I actually here to address?</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  if (phase === 'replay') {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <Badge variant="tier2" size="sm">Level 7</Badge>
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
          <Badge variant="tier2" size="sm">Level 7</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
          <p className="text-[#8892b0] text-sm mt-2">{level.skill}</p>
        </div>

        <div className="bg-[#16213e] border border-[#1e2a4a] rounded-2xl p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-2">Your objective</p>
          <p className="text-sm text-[#b0b8cc] leading-relaxed">{originalIssue}</p>
          <div className="mt-3 pt-3 border-t border-[#1e2a4a]">
            <p className="text-xs text-[#ffd700]">Win condition: Re-anchor to the original issue each time they flip it. Don't defend yourself — return to the point.</p>
          </div>
        </div>

        <div className="bg-[#ff3366]/08 border border-[#ff3366]/20 rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ff3366] mb-2">Watch for DARVO</p>
          <ul className="flex flex-col gap-1.5">
            <li className="text-xs text-[#8892b0]"><span className="text-white">D</span>eny — "That never happened"</li>
            <li className="text-xs text-[#8892b0]"><span className="text-white">A</span>ttack — "You always do this"</li>
            <li className="text-xs text-[#8892b0]"><span className="text-white">R</span>everse <span className="text-white">V</span>ictim/<span className="text-white">O</span>ffender — "I'm the one who's been hurt here"</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={() => setPhase('conversation')} fullWidth>Start conversation</Button>
          {!useFallback && (
            <button
              onClick={() => { setUseFallback(true); setPhase('conversation') }}
              className="text-xs text-[#8892b0] underline text-center"
            >
              Ollama not running? Use scripted fallback →
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div className="flex items-center justify-between">
        <div>
          <Badge variant="tier2" size="sm">Level 7</Badge>
          <h1 className="text-lg font-bold text-white mt-0.5">{level.title}</h1>
        </div>
        <Button onClick={finish} variant="secondary" size="sm">End &amp; Review</Button>
      </div>

      {/* Original issue reminder — the anchor */}
      <motion.div
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="bg-[#00d4ff]/08 border border-[#00d4ff]/20 rounded-xl p-3"
      >
        <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-1">Your anchor — return here</p>
        <p className="text-xs text-[#8892b0]">{originalIssue}</p>
      </motion.div>

      <RegulationMeter />

      <ConversationUI
        messages={displayMessages}
        streaming={streaming && !useFallback}
        error={error}
        connected={connected}
        onSend={handleSend}
        inputValue={inputVal}
        onInputChange={setInputVal}
        personaName={persona.name}
        placeholder="Respond and re-anchor to your original point…"
      />

      {displayMessages.length >= 6 && (
        <Button onClick={finish} variant="secondary" fullWidth>Finish conversation →</Button>
      )}
    </div>
  )
}
