import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface XPToastProps {
  amount: number
  show: boolean
  onDone?: () => void
}

export function XPToast({ amount, show, onDone }: XPToastProps) {
  useEffect(() => {
    if (show && onDone) {
      const t = setTimeout(onDone, 2000)
      return () => clearTimeout(t)
    }
  }, [show, onDone])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        >
          <div className="bg-[#ffd700] text-[#0f0f1a] font-bold px-5 py-2.5 rounded-full text-sm shadow-lg shadow-[#ffd700]/20">
            +{amount} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useXPToast() {
  const [toast, setToast] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false })

  const show = (amount: number) => setToast({ amount, show: true })
  const hide = () => setToast(t => ({ ...t, show: false }))

  return { toast, show, hide }
}
