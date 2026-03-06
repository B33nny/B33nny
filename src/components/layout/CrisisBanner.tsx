import { useState } from 'react'

export function CrisisBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-4 left-4 z-30 bg-[#1e2a4a] text-[#8892b0] text-xs px-3 py-1.5 rounded-full border border-[#2a3a5e] hover:text-white transition-colors"
        aria-label="Show safety resources"
      >
        🛡 Resources
      </button>
    )
  }

  return (
    <div className="bg-[#0f0f1a] border-b border-[#1e2a4a] px-4 py-2 flex items-center justify-between gap-4">
      <p className="text-xs text-[#8892b0]">
        <span className="text-[#ff3366] font-semibold">If you are in danger: </span>
        <a
          href="https://www.thehotline.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00d4ff] underline hover:text-white"
        >
          National DV Hotline
        </a>
        {' · '}
        <a
          href="tel:18007997233"
          className="text-[#00d4ff] underline hover:text-white"
        >
          1-800-799-7233
        </a>
        {' · '}
        <a
          href="https://www.coercivecontrol.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00d4ff] underline hover:text-white"
        >
          Coercive Control Resources
        </a>
      </p>
      <button
        onClick={() => setVisible(false)}
        className="text-[#3a3a5e] hover:text-[#8892b0] text-sm shrink-0"
        aria-label="Dismiss crisis banner"
      >
        ×
      </button>
    </div>
  )
}
