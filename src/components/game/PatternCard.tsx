import { motion } from 'framer-motion'
import type { ToxicPattern } from '../../types'
import { Badge } from '../ui/Badge'

interface PatternCardProps {
  pattern: ToxicPattern
  unlocked: boolean
  onClick?: () => void
  compact?: boolean
  isNew?: boolean
}

const categoryColors: Record<string, string> = {
  manipulation: '#00d4ff',
  control: '#ff3366',
  avoidance: '#ffd700',
  attack: '#ff6b35',
  cycle: '#9b59b6',
}

const rarityBadge: Record<string, 'common' | 'uncommon' | 'rare'> = {
  common: 'common',
  uncommon: 'uncommon',
  rare: 'rare',
}

export function PatternCard({ pattern, unlocked, onClick, compact = false, isNew = false }: PatternCardProps) {
  if (!unlocked) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-xl p-4 flex items-center gap-3 cursor-default"
      >
        <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] flex items-center justify-center text-[#2a2a4e] text-lg">?</div>
        <div>
          <div className="h-3 w-24 bg-[#1a1a2e] rounded mb-1.5" />
          <div className="h-2 w-16 bg-[#1a1a2e] rounded" />
        </div>
      </motion.div>
    )
  }

  const accentColor = categoryColors[pattern.category]

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        onClick={onClick}
        className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-3 cursor-pointer hover:border-[#00d4ff]/30 transition-colors relative"
      >
        {isNew && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff6b35] rounded-full animate-pulse" />
        )}
        <div className="flex items-start gap-2.5">
          <div
            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{pattern.name}</p>
            <p className="text-xs text-[#8892b0] capitalize">{pattern.category}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="bg-[#16213e] border border-[#1e2a4a] rounded-2xl p-5 cursor-pointer hover:border-[#00d4ff]/20 transition-all relative overflow-hidden"
    >
      {isNew && (
        <div className="absolute top-3 right-3">
          <Badge variant="new" size="sm">NEW</Badge>
        </div>
      )}

      {/* accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: accentColor }} />

      <div className="pl-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-white leading-snug">{pattern.name}</h3>
          <Badge variant={rarityBadge[pattern.rarity]} size="sm">{pattern.rarity}</Badge>
        </div>

        <p className="text-xs text-[#8892b0] capitalize mb-2">{pattern.category}</p>

        <p className="text-sm text-[#b0b8cc] leading-relaxed line-clamp-2">{pattern.description}</p>

        <div className="mt-3 pt-3 border-t border-[#1e2a4a]">
          <p className="text-xs text-[#8892b0] mb-1">Feels like</p>
          <p className="text-xs italic" style={{ color: accentColor }}>{pattern.feelsLike}</p>
        </div>
      </div>
    </motion.div>
  )
}
