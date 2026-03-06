import { useParams, useNavigate } from 'react-router-dom'
import { getLevelById } from '../data/levels'
import { useProgressStore } from '../store/progressStore'
import { Button } from '../components/ui/Button'
import { L01_EmotionDecoder } from './levels/L01_EmotionDecoder'
import { L02_RedFlagBingo } from './levels/L02_RedFlagBingo'
import { L03_FourHorsemen } from './levels/L03_FourHorsemen'
import { L04_ValidateThis } from './levels/L04_ValidateThis'
import { L05_PhraseLab } from './levels/L05_PhraseLab'
import { LevelComingSoon } from './levels/LevelComingSoon'

const levelComponents: Record<number, React.ComponentType> = {
  1: L01_EmotionDecoder,
  2: L02_RedFlagBingo,
  3: L03_FourHorsemen,
  4: L04_ValidateThis,
  5: L05_PhraseLab,
}

export function LevelRouter() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isLevelUnlocked } = useProgressStore()

  const levelId = Number(id)
  const level = getLevelById(levelId)

  if (!level) {
    return (
      <div className="text-center py-16">
        <p className="text-[#8892b0]">Level not found.</p>
        <Button onClick={() => navigate('/map')} variant="ghost" className="mt-4">← Map</Button>
      </div>
    )
  }

  if (!isLevelUnlocked(levelId)) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-white mb-2">Locked</h2>
        <p className="text-[#8892b0] mb-6">Complete Level {levelId - 1} first.</p>
        <Button onClick={() => navigate('/map')} variant="secondary">← Map</Button>
      </div>
    )
  }

  const Component = levelComponents[levelId] ?? LevelComingSoon
  return <Component />
}
