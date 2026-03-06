import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { techniques } from '../data/techniques'
import { Card } from '../components/ui/Card'

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

const techniqueIcons: Record<string, string> = {
  'selective-validation': '🎯',
  'tactical-empathy': '🧠',
  'leaps': '⚡',
  'nvc': '💬',
  'motivational-interviewing': '🌱',
  'dear-man': '📋',
  'give': '🤝',
  'fast': '🛡',
}

export function Library() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Disarmament Library</h1>
        <p className="text-[#8892b0] text-sm mt-1">Research-backed frameworks for de-escalation and precision communication.</p>
      </div>

      {/* Core frameworks */}
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-3">Core Frameworks</p>
        <div className="flex flex-col gap-3">
          {techniques.slice(0, 5).map((technique, i) => {
            const color = techniqueColors[technique.slug] ?? '#00d4ff'
            const icon = techniqueIcons[technique.slug] ?? '📚'
            return (
              <motion.div
                key={technique.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card onClick={() => navigate(`/library/${technique.slug}`)} glow="cyan">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white">{technique.name}</h3>
                      <p className="text-xs text-[#8892b0] mb-2">{technique.origin}</p>
                      <p className="text-sm text-[#b0b8cc] line-clamp-2">{technique.summary}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* DBT skills */}
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-3">DBT Interpersonal Effectiveness</p>
        <div className="grid grid-cols-1 gap-3">
          {techniques.slice(5).map(technique => {
            const color = techniqueColors[technique.slug] ?? '#00d4ff'
            const icon = techniqueIcons[technique.slug] ?? '📚'
            return (
              <Card key={technique.slug} onClick={() => navigate(`/library/${technique.slug}`)} glow="green">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">{technique.name}</h3>
                    <p className="text-xs text-[#8892b0] mt-0.5">{technique.summary.slice(0, 80)}...</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Top 10 escalation mistakes note */}
      <Card className="border-[#ff3366]/20" glow="red">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-white mb-1">Top 10 Escalation Mistakes</h3>
            <p className="text-sm text-[#8892b0]">Studied during The Phrase Lab (Level 5). Each mistake pairs with its de-escalating alternative.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
