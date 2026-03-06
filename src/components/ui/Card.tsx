import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  glow?: 'cyan' | 'orange' | 'green' | 'yellow' | 'red' | 'none'
  padding?: 'sm' | 'md' | 'lg'
}

const glowColors = {
  cyan: 'hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] hover:border-[#00d4ff]/30',
  orange: 'hover:shadow-[0_0_20px_rgba(255,107,53,0.15)] hover:border-[#ff6b35]/30',
  green: 'hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/30',
  yellow: 'hover:shadow-[0_0_20px_rgba(255,215,0,0.15)] hover:border-[#ffd700]/30',
  red: 'hover:shadow-[0_0_20px_rgba(255,51,102,0.15)] hover:border-[#ff3366]/30',
  none: '',
}

const paddings = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
}

export function Card({
  children,
  className = '',
  onClick,
  glow = 'none',
  padding = 'md',
}: CardProps) {
  const interactive = Boolean(onClick)
  return (
    <motion.div
      whileHover={interactive ? { y: -2 } : undefined}
      onClick={onClick}
      className={`
        bg-[#16213e] border border-[#1e2a4a] rounded-2xl
        transition-all duration-200
        ${interactive ? 'cursor-pointer ' + glowColors[glow] : ''}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
