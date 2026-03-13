import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProgressStore } from '../store/progressStore'
import { useStreakStore } from '../store/streakStore'
import { useCodexStore } from '../store/codexStore'
import { levels } from '../data/levels'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Badge } from '../components/ui/Badge'

const tierColors: Record<number, string> = {
  1: '#00d4ff',
  2: '#ffd700',
  3: '#ff6b35',
  4: '#00ff88',
}

function XPLevel(xp: number) {
  const thresholds = [0, 500, 1200, 2500, 4500, 7000, 10000, 14000, 19000, 25000]
  let level = 1
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1
  }
  const currentThreshold = thresholds[Math.min(level - 1, thresholds.length - 1)]
  const nextThreshold = thresholds[Math.min(level, thresholds.length - 1)]
  const progress = nextThreshold > currentThreshold
    ? Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    : 100
  return { level, progress }
}

export function Home() {
  const navigate = useNavigate()
  const { totalXP, completedLevels, isLevelUnlocked, onboardingComplete } = useProgressStore()
  const { currentStreak, isStreakAlive, getDailyXP } = useStreakStore()
  const { unlockedPatterns } = useCodexStore()

  const { level: playerLevel, progress: xpProgress } = XPLevel(totalXP)

  // Find next available level
  const nextLevel = levels.find(l => isLevelUnlocked(l.id) && !completedLevels[l.id]) ?? levels[0]

  // Completed count
  const completedCount = Object.keys(completedLevels).length
  const totalLevels = levels.length

  if (!onboardingComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Signal &amp; Static</h1>
          <p className="text-[#8892b0] mb-8 max-w-sm">
            Gamified training in communication mastery. Learn to recognise toxic patterns and respond with precision.
          </p>
          <Button onClick={() => navigate('/onboarding')} size="lg">
            Begin Training
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Player stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#16213e] to-[#0f0f1a] border border-[#1e2a4a] rounded-2xl p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-[#8892b0] font-mono uppercase tracking-wider mb-1">Player Level</p>
            <p className="text-4xl font-bold text-white">{playerLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8892b0] font-mono uppercase tracking-wider mb-1">Total XP</p>
            <p className="text-2xl font-bold text-[#ffd700]">{totalXP.toLocaleString()}</p>
          </div>
        </div>
        <ProgressBar value={xpProgress} color="gradient" height="sm" showLabel label="Next level" />
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-[#ff6b35]">
            {isStreakAlive() ? currentStreak : 0}
          </p>
          <p className="text-xs text-[#8892b0] mt-1">Day streak</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-[#00d4ff]">{unlockedPatterns.length}<span className="text-sm text-[#8892b0]">/30</span></p>
          <p className="text-xs text-[#8892b0] mt-1">Patterns</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-[#00ff88]">{completedCount}<span className="text-sm text-[#8892b0]">/{totalLevels}</span></p>
          <p className="text-xs text-[#8892b0] mt-1">Levels done</p>
        </Card>
      </div>

      {/* Next level CTA */}
      <Card
        onClick={() => navigate(`/level/${nextLevel.id}`)}
        glow="cyan"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[#0f0f1a] text-lg shrink-0"
            style={{ backgroundColor: tierColors[nextLevel.tier] }}
          >
            {nextLevel.id}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={`tier${nextLevel.tier}` as 'tier1'} size="sm">Tier {nextLevel.tier}</Badge>
              {completedLevels[nextLevel.id] && <Badge variant="common" size="sm">Completed</Badge>}
            </div>
            <h3 className="font-bold text-white">{nextLevel.title}</h3>
            <p className="text-sm text-[#8892b0] mt-1 line-clamp-2">{nextLevel.skill}</p>
            <p className="text-xs text-[#00d4ff] mt-2">+{nextLevel.xpReward} XP · ~{nextLevel.estimatedMinutes} min</p>
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/daily">
          <Card className="h-full" glow="orange">
            <p className="text-2xl mb-2">📅</p>
            <p className="font-semibold text-white text-sm">Daily Practice</p>
            <p className="text-xs text-[#8892b0] mt-1">2-min daily scenario</p>
            {getDailyXP() > 0 && (
              <p className="text-xs text-[#00ff88] mt-2">✓ Done today · {getDailyXP()} XP</p>
            )}
          </Card>
        </Link>
        <Link to="/codex">
          <Card className="h-full" glow="yellow">
            <p className="text-2xl mb-2">📖</p>
            <p className="font-semibold text-white text-sm">Pattern Codex</p>
            <p className="text-xs text-[#8892b0] mt-1">{unlockedPatterns.length} entries unlocked</p>
          </Card>
        </Link>
        <Link to="/review" className="col-span-2">
          <Card glow="cyan">
            <div className="flex items-center gap-3">
              <p className="text-2xl">🔁</p>
              <div>
                <p className="font-semibold text-white text-sm">Spaced Review</p>
                <p className="text-xs text-[#8892b0]">SM-2 recall training</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Level progress */}
      <Card>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-white">Progress</h3>
          <Link to="/map" className="text-xs text-[#00d4ff] hover:underline">View map →</Link>
        </div>
        <ProgressBar value={completedCount} max={totalLevels} color="cyan" label={`${completedCount} of ${totalLevels} levels`} />
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[1, 2, 3, 4].map(tier => {
            const tierLevels = levels.filter(l => l.tier === tier)
            const tierCompleted = tierLevels.filter(l => completedLevels[l.id]).length
            return (
              <div key={tier} className="text-center">
                <p className="text-xs font-bold mb-1" style={{ color: tierColors[tier] }}>
                  {tierCompleted}/{tierLevels.length}
                </p>
                <div className="h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(tierCompleted / tierLevels.length) * 100}%`,
                      backgroundColor: tierColors[tier],
                    }}
                  />
                </div>
                <p className="text-xs text-[#8892b0] mt-1">T{tier}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
