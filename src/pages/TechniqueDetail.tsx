import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getTechniqueBySlug } from '../data/techniques'
import { Button } from '../components/ui/Button'

const techniqueColors: Record<string, string> = {
  'selective-validation': '#00d4ff',
  'tactical-empathy': '#ffd700',
  'leaps': '#ff6b35',
  'nvc': '#00ff88',
  'motivational-interviewing': '#9b59b6',
  'dear-man': '#00d4ff',
  'give': '#00ff88',
  'fast': '#ff3366',
}

export function TechniqueDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const technique = slug ? getTechniqueBySlug(slug) : undefined
  const accentColor = slug ? (techniqueColors[slug] ?? '#00d4ff') : '#00d4ff'

  if (!technique) {
    return (
      <div className="text-center py-16">
        <p className="text-[#8892b0]">Technique not found.</p>
        <Button onClick={() => navigate('/library')} variant="ghost" className="mt-4">← Library</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate('/library')} className="text-sm text-[#8892b0] hover:text-white self-start">
        ← Library
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 border"
        style={{ backgroundColor: `${accentColor}08`, borderColor: `${accentColor}30` }}
      >
        <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: accentColor }}>
          {technique.origin}
        </p>
        <h1 className="text-2xl font-bold text-white mb-3">{technique.name}</h1>
        <p className="text-[#b0b8cc] leading-relaxed">{technique.summary}</p>
      </motion.div>

      {/* Steps */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-4">The Steps</h2>
        <div className="flex flex-col gap-3">
          {technique.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm mb-1">{step.label}</p>
                  <p className="text-sm text-[#8892b0] leading-relaxed">{step.description}</p>
                  {step.example && (
                    <div className="mt-2 bg-[#0f0f1a] rounded-lg p-3 border border-[#1a1a2e]">
                      <p className="text-xs font-mono" style={{ color: accentColor }}>{step.example}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div className="bg-[#16213e] border border-[#1e2a4a] rounded-2xl p-5">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-3">Use when</h2>
        <ul className="flex flex-col gap-2">
          {technique.useCases.map((uc, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#b0b8cc]">
              <span style={{ color: accentColor }} className="shrink-0">✓</span>
              {uc}
            </li>
          ))}
        </ul>
      </div>

      {/* Avoid when */}
      {technique.avoidWhen && technique.avoidWhen.length > 0 && (
        <div className="bg-[#16213e] border border-[#ff3366]/20 rounded-2xl p-5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#ff3366] mb-3">Avoid when</h2>
          <ul className="flex flex-col gap-2">
            {technique.avoidWhen.map((aw, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#8892b0]">
                <span className="text-[#ff3366] shrink-0">×</span>
                {aw}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Phrase substitutions */}
      {technique.phrases && technique.phrases.length > 0 && (
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-3">Phrase substitutions</h2>
          <div className="flex flex-col gap-3">
            {technique.phrases.map((phrase, i) => (
              <div key={i} className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[#ff3366] text-xs shrink-0 mt-0.5">✗</span>
                    <p className="text-sm text-[#8892b0] italic">"{phrase.bad}"</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#00ff88] text-xs shrink-0 mt-0.5">✓</span>
                    <p className="text-sm text-white">"{phrase.good}"</p>
                  </div>
                  {phrase.why && (
                    <p className="text-xs text-[#5a6a8e] pl-4 mt-1">{phrase.why}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
