import { useState } from 'react'
import { motion } from 'framer-motion'
import { buildReplayAnalysisPrompt, chat } from '../../services/llm'
import type { ConversationMessage } from '../../hooks/useLLMConversation'
import { Button } from '../ui/Button'

interface ReplayAnalysisProps {
  messages: ConversationMessage[]
  levelTitle: string
  onDone: () => void
}

interface Analysis {
  summary: string
  playerStrengths: string[]
  playerWeaknesses: string[]
  keyMoments: Array<{
    exchange: string
    what: string
    playerResponse: string
    quality: 'good' | 'neutral' | 'poor'
    alternative: string
  }>
  overallScore: number
  masteryInsight: string
}

function qualityColor(q: string) {
  if (q === 'good') return '#00ff88'
  if (q === 'poor') return '#ff3366'
  return '#ffd700'
}

export function ReplayAnalysis({ messages, levelTitle: _levelTitle, onDone }: ReplayAnalysisProps) {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const transcript = messages
        .map(m => `${m.role === 'user' ? 'PLAYER' : 'OPPONENT'}: ${m.content}`)
        .join('\n')

      const raw = await chat([
        { role: 'system', content: 'You are a communication coach. Always respond with valid JSON only.' },
        { role: 'user', content: buildReplayAnalysisPrompt(transcript) },
      ])

      // Extract JSON from response (LLMs sometimes wrap in markdown)
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')
      const parsed = JSON.parse(jsonMatch[0]) as Analysis
      setAnalysis(parsed)
    } catch {
      setError('Could not generate analysis — make sure Ollama is running.')
    } finally {
      setLoading(false)
    }
  }

  if (!analysis && !loading) {
    return (
      <div className="flex flex-col gap-4 text-center py-4">
        <div className="text-4xl">🎬</div>
        <div>
          <h3 className="font-bold text-white text-lg">Replay Analysis</h3>
          <p className="text-sm text-[#8892b0] mt-1">
            Get AI-powered feedback on exactly what happened and what you could have done differently.
          </p>
        </div>
        {error && <p className="text-xs text-[#ff3366]">{error}</p>}
        <div className="flex flex-col gap-2">
          <Button onClick={runAnalysis} fullWidth>Analyse my performance</Button>
          <Button onClick={onDone} variant="ghost" fullWidth>Skip → Continue</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full"
        />
        <p className="text-sm text-[#8892b0]">Analysing conversation…</p>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-lg">Replay Analysis</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#00d4ff]">{analysis.overallScore}</p>
          <p className="text-xs text-[#8892b0]">/ 100</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4">
        <p className="text-sm text-[#b0b8cc] leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Strengths / Weaknesses */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#00ff88]/08 border border-[#00ff88]/20 rounded-xl p-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[#00ff88] mb-2">Strengths</p>
          <ul className="flex flex-col gap-1.5">
            {analysis.playerStrengths.map((s, i) => (
              <li key={i} className="text-xs text-[#b0b8cc] flex items-start gap-1.5">
                <span className="text-[#00ff88] shrink-0 mt-0.5">✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#ff3366]/08 border border-[#ff3366]/20 rounded-xl p-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[#ff3366] mb-2">Missed</p>
          <ul className="flex flex-col gap-1.5">
            {analysis.playerWeaknesses.map((w, i) => (
              <li key={i} className="text-xs text-[#b0b8cc] flex items-start gap-1.5">
                <span className="text-[#ff3366] shrink-0 mt-0.5">›</span>{w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key moments */}
      {analysis.keyMoments.length > 0 && (
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-3">Key moments</p>
          <div className="flex flex-col gap-3">
            {analysis.keyMoments.map((m, i) => (
              <div key={i} className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: qualityColor(m.quality) }} />
                  <p className="text-xs font-semibold" style={{ color: qualityColor(m.quality) }}>
                    {m.quality.charAt(0).toUpperCase() + m.quality.slice(1)}
                  </p>
                  <p className="text-xs text-[#8892b0]">— {m.what}</p>
                </div>
                <p className="text-xs text-[#8892b0] italic mb-2">"{m.exchange}"</p>
                <p className="text-xs text-[#b0b8cc]">{m.playerResponse}</p>
                {m.alternative && (
                  <div className="mt-2 pt-2 border-t border-[#1e2a4a]">
                    <p className="text-xs text-[#00d4ff]">Try instead: {m.alternative}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mastery insight */}
      <div className="bg-[#ffd700]/08 border border-[#ffd700]/20 rounded-xl p-4">
        <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-2">Mastery insight</p>
        <p className="text-sm text-[#b0b8cc] italic">{analysis.masteryInsight}</p>
      </div>

      <Button onClick={onDone} fullWidth>Continue →</Button>
    </div>
  )
}
