import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { emotions } from '../../data/emotions'
import { getLevelById } from '../../data/levels'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(1)!

// Scenarios for matching
const scenarios = [
  { id: 's1', text: 'Your partner dismisses your concerns as "overreacting" — again. In front of others.', targetEmotions: ['Humiliated', 'Dismissed', 'Invalidated'] },
  { id: 's2', text: 'You realize mid-conversation that the story you believed for years wasn\'t true.', targetEmotions: ['Betrayed', 'Gaslit', 'Disoriented'] },
  { id: 's3', text: 'They said they\'d change. They said it again. The pattern hasn\'t shifted.', targetEmotions: ['Despondent', 'Powerless', 'Disheartened'] },
  { id: 's4', text: 'The argument has no resolution — it just circles back forever.', targetEmotions: ['Frustrated', 'Trapped', 'Overwhelmed'] },
  { id: 's5', text: 'You walk into the room and the conversation stops. People look at you and look away.', targetEmotions: ['Hypervigilant', 'Self-conscious', 'Uneasy'] },
]

const shuffledEmotions = [...emotions].sort(() => Math.random() - 0.5).slice(0, 12)

function DraggableEmotion({ id, label, used }: { id: string; label: string; used: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: used })

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: transform ? `translate(${transform.x}px,${transform.y}px)` : undefined }}
      className={`
        px-3 py-2 rounded-xl border text-sm font-medium cursor-grab active:cursor-grabbing transition-all
        ${used ? 'opacity-30 cursor-not-allowed border-[#1a1a2e] text-[#3a3a5e] bg-[#0f0f1a]' : ''}
        ${isDragging ? 'opacity-0' : ''}
        ${!used && !isDragging ? 'bg-[#16213e] border-[#2a3a5e] text-white hover:border-[#00d4ff]/50' : ''}
      `}
    >
      {label}
    </motion.div>
  )
}

function DropZone({ id, label, dropped, correct }: { id: string; label: string; dropped: string[]; correct: boolean | null }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[44px] rounded-xl border-2 border-dashed p-2 flex flex-wrap gap-1.5 transition-colors
        ${isOver ? 'border-[#00d4ff] bg-[#00d4ff]/5' : 'border-[#1e2a4a]'}
        ${correct === true ? 'border-[#00ff88]/60 bg-[#00ff88]/5' : ''}
        ${correct === false ? 'border-[#ff3366]/60 bg-[#ff3366]/5' : ''}
      `}
    >
      {dropped.length === 0 && (
        <p className="text-xs text-[#3a3a5e] self-center pl-1">{label}</p>
      )}
      {dropped.map(em => (
        <span key={em} className="px-2 py-1 bg-[#00d4ff]/20 text-[#00d4ff] rounded-lg text-xs font-medium">{em}</span>
      ))}
    </div>
  )
}

export function L01_EmotionDecoder() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [drops, setDrops] = useState<string[]>([])
  const [usedEmotions, setUsedEmotions] = useState<Set<string>>(new Set())
  const [dragging, setDragging] = useState<string | null>(null)
  const [checked, setChecked] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const scenario = scenarios[currentIdx]

  const handleDragStart = (e: DragStartEvent) => setDragging(String(e.active.id))
  const handleDragEnd = (e: DragEndEvent) => {
    setDragging(null)
    if (!e.over || e.over.id !== 'dropzone') return
    const emotionLabel = String(e.active.id).replace('emotion-', '')
    if (!drops.includes(emotionLabel)) {
      setDrops(d => [...d, emotionLabel])
      setUsedEmotions(u => new Set([...u, emotionLabel]))
    }
  }

  const check = () => {
    const matched = drops.filter(em => scenario.targetEmotions.includes(em)).length
    const correct = matched >= 1
    setChecked(correct)
    if (correct) setScore(s => s + (drops.some(em => ['Humiliated', 'Betrayed', 'Gaslit', 'Despondent', 'Powerless', 'Hypervigilant'].includes(em)) ? 2 : 1))
  }

  const next = () => {
    setDrops([])
    setChecked(null)
    if (currentIdx + 1 >= scenarios.length) {
      const finalScore = score
      completeLevel({ levelId: 1, completedAt: new Date().toISOString(), score: finalScore, maxScore: scenarios.length * 2, timeSeconds: 0, patternsEncountered: [] })
      addDailyXP(level.xpReward)
      showToast(level.xpReward)
      setDone(true)
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  if (done) {
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">🎉</div>
        <div>
          <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
          <p className="text-[#8892b0] mt-2">Score: {score} / {scenarios.length * 2}</p>
          <p className="text-[#00d4ff] text-sm mt-1">+{level.xpReward} XP earned</p>
        </div>
        <p className="text-sm text-[#b0b8cc] max-w-sm">The larger your emotional vocabulary, the harder you are to gaslight. Precision matters.</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="tier1" size="sm">Level 1</Badge>
            <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
          </div>
          <p className="text-sm text-[#8892b0]">{currentIdx + 1}/{scenarios.length}</p>
        </div>

        {/* Instruction */}
        <p className="text-sm text-[#8892b0]">
          Drag the most <span className="text-[#00d4ff]">precise</span> emotion label(s) onto the scenario. Bonus for granularity.
        </p>

        {/* Scenario */}
        <div className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-2xl p-5">
          <p className="text-[#b0b8cc] leading-relaxed italic">"{scenario.text}"</p>
        </div>

        {/* Drop zone */}
        <div>
          <p className="text-xs text-[#8892b0] mb-2">Your answers:</p>
          <DropZone id="dropzone" label="Drop emotion labels here" dropped={drops} correct={checked} />
        </div>

        {/* Result feedback */}
        <AnimatePresence>
          {checked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 border ${checked ? 'bg-[#00ff88]/10 border-[#00ff88]/30' : 'bg-[#ff3366]/10 border-[#ff3366]/30'}`}
            >
              <p className={`font-semibold text-sm mb-1 ${checked ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                {checked ? 'Well labelled' : 'Try to be more precise'}
              </p>
              <p className="text-xs text-[#8892b0]">Precise options: {scenario.targetEmotions.join(', ')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emotion bank */}
        <div>
          <p className="text-xs text-[#8892b0] mb-2">Emotion bank — drag to match:</p>
          <div className="flex flex-wrap gap-2">
            {shuffledEmotions.map(em => (
              <DraggableEmotion
                key={em.label}
                id={`emotion-${em.label}`}
                label={em.label}
                used={usedEmotions.has(em.label)}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {checked === null ? (
            <Button onClick={check} disabled={drops.length === 0} fullWidth>Check</Button>
          ) : (
            <Button onClick={next} fullWidth>
              {currentIdx + 1 >= scenarios.length ? 'Finish Level' : 'Next →'}
            </Button>
          )}
        </div>
      </div>

      <DragOverlay>
        {dragging && (
          <div className="px-3 py-2 bg-[#00d4ff] text-[#0f0f1a] rounded-xl text-sm font-bold shadow-lg">
            {dragging.replace('emotion-', '')}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
