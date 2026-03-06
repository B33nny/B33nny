import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPatternBySlug, patterns } from '../data/patterns'
import { useCodexStore } from '../store/codexStore'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { PatternCard } from '../components/game/PatternCard'

const categoryColors: Record<string, string> = {
  manipulation: '#00d4ff',
  control: '#ff3366',
  avoidance: '#ffd700',
  attack: '#ff6b35',
  cycle: '#9b59b6',
}

export function PatternDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isUnlocked, markViewed } = useCodexStore()

  const pattern = slug ? getPatternBySlug(slug) : undefined

  useEffect(() => {
    if (slug && isUnlocked(slug)) markViewed(slug)
  }, [slug])

  if (!pattern) {
    return (
      <div className="text-center py-16">
        <p className="text-[#8892b0]">Pattern not found.</p>
        <Button onClick={() => navigate('/codex')} variant="ghost" className="mt-4">← Back to Codex</Button>
      </div>
    )
  }

  if (!isUnlocked(pattern.slug)) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-white mb-2">Locked</h2>
        <p className="text-[#8892b0] mb-6">Complete more levels to unlock this pattern.</p>
        <Button onClick={() => navigate('/codex')} variant="secondary">← Back to Codex</Button>
      </div>
    )
  }

  const accentColor = categoryColors[pattern.category]
  const relatedPatterns = patterns.filter(p => pattern.relatedPatterns.includes(p.id))

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => navigate('/codex')}
        className="text-sm text-[#8892b0] hover:text-white transition-colors self-start"
      >
        ← Back to Codex
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 border"
        style={{ backgroundColor: `${accentColor}08`, borderColor: `${accentColor}30` }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-2xl font-bold text-white">{pattern.name}</h1>
          <Badge variant={pattern.rarity as 'common'}>{pattern.rarity}</Badge>
        </div>
        <p className="text-xs uppercase tracking-wider font-mono mb-4" style={{ color: accentColor }}>
          {pattern.category}
        </p>
        <p className="text-[#b0b8cc] leading-relaxed">{pattern.description}</p>
      </motion.div>

      {/* Feels like */}
      <div className="bg-[#16213e] border border-[#1e2a4a] rounded-2xl p-5">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-3">Feels like</h2>
        <p className="italic leading-relaxed" style={{ color: accentColor }}>{pattern.feelsLike}</p>
      </div>

      {/* Triggers */}
      <div className="bg-[#16213e] border border-[#1e2a4a] rounded-2xl p-5">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-3">When it appears</h2>
        <ul className="flex flex-col gap-2">
          {pattern.triggers.map((trigger, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#b0b8cc]">
              <span style={{ color: accentColor }} className="shrink-0 mt-0.5">›</span>
              {trigger}
            </li>
          ))}
        </ul>
      </div>

      {/* Counter-move */}
      <div className="bg-[#16213e] border border-[#00ff88]/20 rounded-2xl p-5">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#00ff88] mb-3">Counter-move</h2>
        <p className="text-[#b0b8cc] leading-relaxed text-sm">{pattern.counterMove}</p>
      </div>

      {/* Neuroscience */}
      {pattern.neuroscience && (
        <div className="bg-[#16213e] border border-[#9b59b6]/20 rounded-2xl p-5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#9b59b6] mb-3">The neuroscience</h2>
          <p className="text-[#8892b0] leading-relaxed text-sm">{pattern.neuroscience}</p>
        </div>
      )}

      {/* Related patterns */}
      {relatedPatterns.length > 0 && (
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-3">Related patterns</h2>
          <div className="grid grid-cols-1 gap-2">
            {relatedPatterns.map(rp => (
              <PatternCard
                key={rp.id}
                pattern={rp}
                unlocked={isUnlocked(rp.slug)}
                compact
                onClick={() => isUnlocked(rp.slug) && navigate(`/codex/${rp.slug}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
