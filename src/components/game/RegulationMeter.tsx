import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useSessionStore } from '../../store/sessionStore'

function BreathingOverlay({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold1' | 'out' | 'hold2'>('in')
  const [count, setCount] = useState(4)
  const intervalRef = useRef<number | null>(null)
  let cyclesRef = 0

  const phases: Array<{ key: typeof phase; label: string; duration: number; next: typeof phase }> = [
    { key: 'in',    label: 'Breathe in',  duration: 4, next: 'hold1' },
    { key: 'hold1', label: 'Hold',         duration: 4, next: 'out'   },
    { key: 'out',   label: 'Breathe out', duration: 4, next: 'hold2' },
    { key: 'hold2', label: 'Hold',         duration: 4, next: 'in'    },
  ]

  const currentPhase = phases.find(p => p.key === phase)!

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhase(prev => {
            const idx = phases.findIndex(p => p.key === prev)
            const next = phases[(idx + 1) % 4]
            if (next.key === 'in') {
              cyclesRef += 1
              if (cyclesRef >= 1) { // 1 full cycle (~16 seconds)
                setTimeout(onComplete, 800)
                if (intervalRef.current) clearInterval(intervalRef.current)
              }
            }
            return next.key
          })
          return currentPhase.duration
        }
        return c - 1
      })
    }, 1000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [phase])

  const circleScale = phase === 'in' ? 1.3 : phase === 'out' ? 0.7 : phase === 'hold1' ? 1.3 : 0.7

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f0f1a]/95 backdrop-blur-md"
    >
      <p className="text-[#ff3366] font-mono text-sm mb-2 tracking-widest uppercase">
        Regulation required
      </p>
      <p className="text-[#8892b0] text-sm mb-12 max-w-xs text-center">
        Your stress meter is full. Complete one breathing cycle to continue.
      </p>

      <div className="relative flex items-center justify-center mb-12">
        <motion.div
          animate={{ scale: circleScale }}
          transition={{ duration: currentPhase.duration - 0.1, ease: 'easeInOut' }}
          className="w-40 h-40 rounded-full bg-[#00d4ff]/10 border-2 border-[#00d4ff]/40"
        />
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-bold text-[#00d4ff]">{count}</span>
        </div>
      </div>

      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-medium text-white mb-2"
      >
        {currentPhase.label}
      </motion.p>
      <p className="text-[#8892b0] text-sm font-mono">4 · 4 · 4 · 4 box breathing</p>
    </motion.div>
  )
}

interface RegulationMeterProps {
  compact?: boolean
}

export function RegulationMeter({ compact = false }: RegulationMeterProps) {
  const { regulationLevel, breathingRequired, completeBreathing } = useSessionStore()

  const color =
    regulationLevel >= 80 ? '#ff3366' :
    regulationLevel >= 60 ? '#ff6b35' :
    regulationLevel >= 40 ? '#ffd700' :
    '#00ff88'

  const zone =
    regulationLevel >= 80 ? 'Critical' :
    regulationLevel >= 60 ? 'High' :
    regulationLevel >= 40 ? 'Elevated' :
    'Regulated'

  if (compact) {
    return (
      <>
        <AnimatePresence>
          {breathingRequired && <BreathingOverlay onComplete={completeBreathing} />}
        </AnimatePresence>
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${regulationLevel}%` }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full transition-colors duration-300"
              style={{ backgroundColor: color }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color }}>{zone}</span>
        </div>
      </>
    )
  }

  return (
    <>
      <AnimatePresence>
        {breathingRequired && <BreathingOverlay onComplete={completeBreathing} />}
      </AnimatePresence>

      <motion.div
        animate={regulationLevel >= 80 ? { boxShadow: [`0 0 0px ${color}00`, `0 0 20px ${color}44`] } : {}}
        transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
        className="rounded-xl p-3 bg-[#16213e] border border-[#1e2a4a]"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono text-[#8892b0] uppercase tracking-wider">Regulation</span>
          <span className="text-xs font-mono" style={{ color }}>{zone}</span>
        </div>
        <div className="h-3 bg-[#1a1a2e] rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${regulationLevel}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full rounded-full transition-colors duration-500"
            style={{ backgroundColor: color }}
          />
        </div>
        {regulationLevel >= 60 && (
          <p className="text-xs text-[#8892b0] mt-1.5">
            {regulationLevel >= 80 ? 'Take a breath before responding.' : 'Stay centred — you\'re the calm in the room.'}
          </p>
        )}
      </motion.div>
    </>
  )
}
