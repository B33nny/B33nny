import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit'
  className?: string
}

const variants = {
  primary: 'bg-[#00d4ff] text-[#0f0f1a] font-bold hover:bg-[#00b8d9] active:bg-[#009ab8]',
  secondary: 'bg-[#1e2a4a] text-[#e8e8f0] border border-[#2a3a5e] hover:border-[#00d4ff] hover:text-[#00d4ff]',
  ghost: 'text-[#8892b0] hover:text-[#e8e8f0] hover:bg-[#1a1a2e]',
  danger: 'bg-[#ff3366] text-white font-bold hover:bg-[#e0224f]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-7 py-3.5 text-lg rounded-xl',
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-colors duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
