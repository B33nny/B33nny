import { NavLink, Outlet } from 'react-router-dom'
import { CrisisBanner } from './CrisisBanner'
import { useCodexStore } from '../../store/codexStore'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors text-xs font-medium
        ${isActive
          ? 'text-[#00d4ff] bg-[#00d4ff]/10'
          : 'text-[#8892b0] hover:text-white hover:bg-[#1a1a2e]'
        }`
      }
    >
      <span className="text-xl">{icon}</span>
      <span className="hidden sm:block">{label}</span>
    </NavLink>
  )
}

export function AppShell() {
  const { hasNewEntries } = useCodexStore()
  const { totalXP } = useProgressStore()
  const { currentStreak, isStreakAlive } = useStreakStore()

  return (
    <div className="min-h-dvh flex flex-col bg-[#0f0f1a]">
      <CrisisBanner />

      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-[#0f0f1a]/90 backdrop-blur-md border-b border-[#1a1a2e]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">
              Signal &amp; Static
            </span>
            <span className="text-[#3a3a5e] text-xs font-mono hidden sm:block">// communication mastery</span>
          </div>
          <div className="flex items-center gap-3">
            {isStreakAlive() && (
              <div className="flex items-center gap-1 bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-full px-2.5 py-1">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-bold text-[#ff6b35]">{currentStreak}</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-[#ffd700]/10 border border-[#ffd700]/20 rounded-full px-2.5 py-1">
              <span className="text-xs font-mono text-[#ffd700] font-bold">{totalXP.toLocaleString()} XP</span>
            </div>
            <NavLink to="/settings" className="text-[#8892b0] hover:text-white transition-colors text-lg">⚙️</NavLink>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 z-20 bg-[#0f0f1a]/95 backdrop-blur-md border-t border-[#1a1a2e] safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-around">
          <NavItem to="/" label="Home" icon="⚡" />
          <NavItem to="/map" label="Levels" icon="🗺" />
          <NavItem to="/daily" label="Daily" icon="📅" />
          <NavItem to="/codex" label={hasNewEntries() ? 'Codex ·' : 'Codex'} icon="📖" />
          <NavItem to="/library" label="Library" icon="🎯" />
        </div>
      </nav>
    </div>
  )
}
