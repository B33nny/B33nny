import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { patterns } from '../data/patterns'
import { useCodexStore } from '../store/codexStore'
import { PatternCard } from '../components/game/PatternCard'
import type { PatternCategory } from '../types'

const categories: Array<{ value: PatternCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'manipulation', label: 'Manipulation' },
  { value: 'control', label: 'Control' },
  { value: 'attack', label: 'Attack' },
  { value: 'avoidance', label: 'Avoidance' },
  { value: 'cycle', label: 'Cycles' },
]

export function PatternCodex() {
  const navigate = useNavigate()
  const { isUnlocked, viewedPatterns } = useCodexStore()
  const [filter, setFilter] = useState<PatternCategory | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = patterns.filter(p => {
    if (filter !== 'all' && p.category !== filter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const unlockedCount = patterns.filter(p => isUnlocked(p.slug)).length

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Pattern Codex</h1>
        <p className="text-[#8892b0] text-sm mt-1">
          {unlockedCount} / 30 entries unlocked. Patterns are revealed as you encounter them in levels.
        </p>
      </div>

      {/* Completion bar */}
      <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedCount / 30) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88]"
        />
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search patterns..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-[#16213e] border border-[#1e2a4a] rounded-xl px-4 py-3 text-white placeholder:text-[#3a3a5e] focus:outline-none focus:border-[#00d4ff]/50 text-sm"
      />

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === cat.value
                ? 'bg-[#00d4ff] text-[#0f0f1a]'
                : 'bg-[#16213e] text-[#8892b0] border border-[#1e2a4a] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map(pattern => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            unlocked={isUnlocked(pattern.slug)}
            isNew={isUnlocked(pattern.slug) && !viewedPatterns.includes(pattern.slug)}
            onClick={() => isUnlocked(pattern.slug) && navigate(`/codex/${pattern.slug}`)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[#8892b0] text-sm py-8">No patterns match your search.</p>
      )}
    </div>
  )
}
