import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number       // 0–100
  max?: number
  color?: 'cyan' | 'green' | 'yellow' | 'orange' | 'red' | 'gradient'
  showLabel?: boolean
  height?: 'sm' | 'md' | 'lg'
  label?: string
}

const colors = {
  cyan: 'bg-[#00d4ff]',
  green: 'bg-[#00ff88]',
  yellow: 'bg-[#ffd700]',
  orange: 'bg-[#ff6b35]',
  red: 'bg-[#ff3366]',
  gradient: 'bg-gradient-to-r from-[#00ff88] via-[#ffd700] to-[#ff3366]',
}

const heights = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export function ProgressBar({
  value,
  max = 100,
  color = 'cyan',
  showLabel = false,
  height = 'md',
  label,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div className="w-full">
      {(label || showLabel) && (
        <div className="flex justify-between mb-1.5 text-xs text-[#8892b0]">
          <span>{label}</span>
          {showLabel && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full bg-[#1a1a2e] rounded-full overflow-hidden ${heights[height]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`${heights[height]} rounded-full ${colors[color]}`}
        />
      </div>
    </div>
  )
}
