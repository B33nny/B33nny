import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'tier1' | 'tier2' | 'tier3' | 'tier4' | 'common' | 'uncommon' | 'rare' | 'locked' | 'new'
  size?: 'sm' | 'md'
}

const variants = {
  tier1: 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30',
  tier2: 'bg-[#ffd700]/15 text-[#ffd700] border border-[#ffd700]/30',
  tier3: 'bg-[#ff6b35]/15 text-[#ff6b35] border border-[#ff6b35]/30',
  tier4: 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30',
  common: 'bg-[#8892b0]/15 text-[#8892b0] border border-[#8892b0]/30',
  uncommon: 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30',
  rare: 'bg-[#ffd700]/15 text-[#ffd700] border border-[#ffd700]/30',
  locked: 'bg-[#1a1a2e] text-[#3a3a5e] border border-[#2a2a4e]',
  new: 'bg-[#ff6b35]/15 text-[#ff6b35] border border-[#ff6b35]/30 animate-pulse',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-2.5 py-1 text-xs rounded-lg',
}

export function Badge({ children, variant = 'common', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-mono font-semibold tracking-wider uppercase ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}
