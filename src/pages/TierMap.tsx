import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { levels, tierNames } from '../data/levels'
import { useProgressStore } from '../store/progressStore'
import { Badge } from '../components/ui/Badge'

const tierColors: Record<number, string> = {
  1: '#00d4ff',
  2: '#ffd700',
  3: '#ff6b35',
  4: '#00ff88',
}

const tierBadge: Record<number, 'tier1' | 'tier2' | 'tier3' | 'tier4'> = {
  1: 'tier1', 2: 'tier2', 3: 'tier3', 4: 'tier4',
}

export function TierMap() {
  const navigate = useNavigate()
  const { completedLevels, isLevelUnlocked, getLevelScore } = useProgressStore()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Game Levels</h1>
        <p className="text-[#8892b0] text-sm mt-1">20 levels across 4 tiers. Each unlocks the next.</p>
      </div>

      {[1, 2, 3, 4].map(tier => (
        <div key={tier}>
          {/* Tier header */}
          <div
            className="flex items-center gap-3 mb-4 py-2 px-4 rounded-xl"
            style={{ backgroundColor: `${tierColors[tier]}15`, borderLeft: `3px solid ${tierColors[tier]}` }}
          >
            <Badge variant={tierBadge[tier]}>Tier {tier}</Badge>
            <h2 className="font-bold" style={{ color: tierColors[tier] }}>
              {tierNames[tier]}
            </h2>
          </div>

          {/* Levels */}
          <div className="flex flex-col gap-3 pl-2">
            {levels.filter(l => l.tier === tier).map((level, i) => {
              const unlocked = isLevelUnlocked(level.id)
              const completed = Boolean(completedLevels[level.id])
              const score = getLevelScore(level.id)

              return (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => unlocked && navigate(`/level/${level.id}`)}
                  className={`
                    flex items-start gap-4 p-4 rounded-xl border transition-all
                    ${unlocked
                      ? 'bg-[#16213e] border-[#1e2a4a] cursor-pointer hover:border-[#2a3a5e]'
                      : 'bg-[#0d1020] border-[#141828] cursor-not-allowed opacity-50'
                    }
                    ${completed ? 'border-l-2' : ''}
                  `}
                  style={completed ? { borderLeftColor: tierColors[tier] } : {}}
                >
                  {/* Level number */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                    style={
                      completed
                        ? { backgroundColor: tierColors[tier], color: '#0f0f1a' }
                        : unlocked
                        ? { backgroundColor: `${tierColors[tier]}20`, color: tierColors[tier] }
                        : { backgroundColor: '#1a1a2e', color: '#3a3a5e' }
                    }
                  >
                    {completed ? '✓' : level.id}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold text-sm ${unlocked ? 'text-white' : 'text-[#3a3a5e]'}`}>
                        {level.title}
                      </h3>
                      {level.aiPowered && unlocked && (
                        <Badge variant="uncommon" size="sm">AI</Badge>
                      )}
                      {!unlocked && (
                        <span className="text-[#3a3a5e] text-sm">🔒</span>
                      )}
                    </div>
                    {unlocked && (
                      <>
                        <p className="text-xs text-[#8892b0] mt-1 line-clamp-1">{level.skill}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-[#ffd700] font-mono">+{level.xpReward} XP</span>
                          <span className="text-xs text-[#8892b0]">~{level.estimatedMinutes} min</span>
                          {completed && score > 0 && (
                            <span className="text-xs font-bold" style={{ color: tierColors[tier] }}>
                              {score}%
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
