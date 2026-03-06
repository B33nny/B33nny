import { useParams, useNavigate } from 'react-router-dom'
import { getLevelById } from '../../data/levels'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

export function LevelComingSoon() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const level = getLevelById(Number(id))

  if (!level) return null

  return (
    <div className="flex flex-col items-center text-center gap-6 py-12">
      <div className="text-5xl">🚧</div>
      <div>
        <Badge variant={`tier${level.tier}` as 'tier1'} size="sm">Tier {level.tier}</Badge>
        <h1 className="text-2xl font-bold text-white mt-3">{level.title}</h1>
        <p className="text-[#8892b0] text-sm mt-2">{level.description}</p>
      </div>
      <div className="bg-[#16213e] border border-[#1e2a4a] rounded-2xl p-5 max-w-sm w-full text-left">
        <p className="text-xs font-mono uppercase tracking-wider text-[#8892b0] mb-2">Skill</p>
        <p className="text-sm text-[#b0b8cc]">{level.skill}</p>
        {level.aiPowered && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="uncommon" size="sm">AI-Powered</Badge>
            <span className="text-xs text-[#8892b0]">Requires Ollama setup</span>
          </div>
        )}
      </div>
      <p className="text-sm text-[#ffd700]">Coming in Phase 2 — check back soon.</p>
      <Button onClick={() => navigate('/map')} variant="secondary">← Back to Map</Button>
    </div>
  )
}
