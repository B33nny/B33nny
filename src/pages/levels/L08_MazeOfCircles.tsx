import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getLevelById } from '../../data/levels'
import { useProgressStore } from '../../store/progressStore'
import { useStreakStore } from '../../store/streakStore'
import { useCodexStore } from '../../store/codexStore'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { XPToast, useXPToast } from '../../components/game/XPToast'

const level = getLevelById(8)!

// Each node is a conversational move. Edges show what happens next.
interface MazeNode {
  id: string
  text: string
  isLoop: boolean    // does following this lead back in circles?
  isExit: boolean    // is this the disengage option?
  nextIds: string[]
}

interface Maze {
  title: string
  pattern: string
  startId: string
  nodes: MazeNode[]
  loopExplanation: string
  exitExplanation: string
}

const mazes: Maze[] = [
  {
    title: 'The Circular Argument',
    pattern: 'Circular Conversations',
    startId: 'a1',
    loopExplanation: "You've raised the same point three times. Each time they deflect, the conversation resets. This is circular — there's no resolution available here.",
    exitExplanation: "Naming the loop and disengaging is the only productive move. You cannot resolve a circular conversation by continuing it.",
    nodes: [
      { id: 'a1', text: '"You said you\'d be home by 7."', isLoop: false, isExit: false, nextIds: ['a2', 'a3'] },
      { id: 'a2', text: 'They say: "I said around 7. You never listen properly." → Challenge the interpretation', isLoop: false, isExit: false, nextIds: ['a4', 'a5'] },
      { id: 'a3', text: '"Let\'s talk about the pattern of you coming home late." → Broaden the topic', isLoop: true, isExit: false, nextIds: ['a6'] },
      { id: 'a4', text: '"I heard \'7\'. Can we focus on how to handle this going forward?" → Stay forward-focused', isLoop: false, isExit: false, nextIds: ['a7', 'a8'] },
      { id: 'a5', text: '"Actually, I definitely heard \'7\' not \'around 7\'." → Argue the facts', isLoop: true, isExit: false, nextIds: ['a1'] },
      { id: 'a6', text: 'They turn it into a list of all your grievances. You\'re now 3 loops in.', isLoop: true, isExit: false, nextIds: ['a1'] },
      { id: 'a7', text: '"I notice we keep going in circles on this. I\'m going to step away and we can revisit this later." → EXIT', isLoop: false, isExit: true, nextIds: [] },
      { id: 'a8', text: '"Fine, let\'s say it was \'around 7\' — why were you still late?" → Continue', isLoop: true, isExit: false, nextIds: ['a2'] },
    ],
  },
  {
    title: 'Moving the Goalposts',
    pattern: 'Moving Goalposts',
    startId: 'b1',
    loopExplanation: "Every time you meet the standard they set, a new one appears. This isn't about your performance — the goalposts are moving deliberately.",
    exitExplanation: "When standards shift every time you meet them, the only move is to name the pattern and stop chasing approval.",
    nodes: [
      { id: 'b1', text: 'You completed the project on time. They say: "But the format was wrong."', isLoop: false, isExit: false, nextIds: ['b2', 'b3'] },
      { id: 'b2', text: '"You never mentioned a specific format. What format did you want?" → Ask', isLoop: false, isExit: false, nextIds: ['b4', 'b5'] },
      { id: 'b3', text: '"I\'ll redo it in whatever format you need." → Comply', isLoop: true, isExit: false, nextIds: ['b6'] },
      { id: 'b4', text: 'They say format X. You reformat. They say: "The data was incomplete." → Track the shift', isLoop: false, isExit: false, nextIds: ['b7', 'b8'] },
      { id: 'b5', text: '"I thought what I submitted was what we agreed." → Defend position', isLoop: true, isExit: false, nextIds: ['b1'] },
      { id: 'b6', text: 'You redo it. New complaint: "The tone was unprofessional." Third goalpost.', isLoop: true, isExit: false, nextIds: ['b1'] },
      { id: 'b7', text: '"I\'m noticing each time I meet the standard, a new one appears. I\'d like us to agree in writing what success looks like before I proceed." → Name it + stop chasing', isLoop: false, isExit: true, nextIds: [] },
      { id: 'b8', text: '"Let me add the missing data." → Keep complying', isLoop: true, isExit: false, nextIds: ['b1'] },
    ],
  },
]

export function L08_MazeOfCircles() {
  const navigate = useNavigate()
  const { completeLevel } = useProgressStore()
  const { addDailyXP } = useStreakStore()
  const { unlockPattern } = useCodexStore()
  const { toast, show: showToast, hide: hideToast } = useXPToast()

  const [mazeIdx, setMazeIdx] = useState(0)
  const [currentNodeId, setCurrentNodeId] = useState(mazes[0].startId)
  const [path, setPath] = useState<string[]>([mazes[0].startId])
  const [loopCount, setLoopCount] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'loop-detected' | 'exited' | 'done'>('playing')
  const [score, setScore] = useState(0)

  const maze = mazes[mazeIdx]
  const currentNode = maze.nodes.find(n => n.id === currentNodeId)!
  const loopDetected = loopCount >= 2

  const choose = (nextId: string) => {
    const nextNode = maze.nodes.find(n => n.id === nextId)!
    const newPath = [...path, nextId]
    setPath(newPath)
    setCurrentNodeId(nextId)

    if (nextNode.isLoop) {
      setLoopCount(c => c + 1)
    }

    if (nextNode.isExit) {
      const roundScore = Math.max(0, 100 - loopCount * 20)
      setScore(s => s + roundScore)
      unlockPattern('circular-conversations')
      unlockPattern('moving-goalposts')
      setPhase('exited')
    } else if (newPath.length > 2 && path.includes(nextId)) {
      setLoopCount(c => c + 1)
    }
  }

  const nextMaze = () => {
    if (mazeIdx + 1 >= mazes.length) {
      completeLevel({ levelId: 8, completedAt: new Date().toISOString(), score, maxScore: 200, timeSeconds: 0, patternsEncountered: ['circular-conversations', 'moving-goalposts', 'whataboutism'] })
      addDailyXP(level.xpReward)
      showToast(level.xpReward)
      setPhase('done')
    } else {
      const nextMazeData = mazes[mazeIdx + 1]
      setMazeIdx(i => i + 1)
      setCurrentNodeId(nextMazeData.startId)
      setPath([nextMazeData.startId])
      setLoopCount(0)
      setPhase('playing')
    }
  }

  if (phase === 'done') {
    return (
      <div className="text-center flex flex-col items-center gap-6 py-12">
        <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />
        <div className="text-5xl">🌀</div>
        <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
        <p className="text-[#00d4ff] text-sm">+{level.xpReward} XP · Circular patterns unlocked</p>
        <p className="text-sm text-[#b0b8cc] max-w-sm">Circular conversations feel like they should resolve if you just explain better. They won't. The exit is the only productive path.</p>
        <Button onClick={() => navigate('/map')}>Continue →</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <XPToast amount={toast.amount} show={toast.show} onDone={hideToast} />

      <div className="flex items-center justify-between">
        <div>
          <Badge variant="tier2" size="sm">Level 8</Badge>
          <h1 className="text-xl font-bold text-white mt-1">{level.title}</h1>
        </div>
        <p className="text-sm text-[#8892b0]">Maze {mazeIdx + 1}/{mazes.length}</p>
      </div>

      <div className="bg-[#16213e] border border-[#1e2a4a] rounded-xl p-4">
        <p className="text-xs font-mono uppercase tracking-wider text-[#ffd700] mb-1">{maze.pattern}</p>
        <p className="text-sm font-semibold text-white">{maze.title}</p>
        <p className="text-xs text-[#8892b0] mt-1">Find the exit before you loop too many times. Score drops with each loop.</p>
      </div>

      {/* Loop warning */}
      {loopDetected && phase === 'playing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#ff3366]/10 border border-[#ff3366]/30 rounded-xl p-3"
        >
          <p className="text-xs text-[#ff3366] font-semibold">🌀 You're in a loop</p>
          <p className="text-xs text-[#8892b0] mt-1">You've been here before. There's no resolution down this path.</p>
        </motion.div>
      )}

      {/* Path tracker */}
      <div className="flex gap-1.5 flex-wrap">
        {path.slice(-6).map((nodeId, i) => {
          const node = maze.nodes.find(n => n.id === nodeId)!
          return (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: node.isLoop ? '#ff3366' : node.isExit ? '#00ff88' : '#00d4ff' }}
            />
          )
        })}
      </div>

      {/* Current node */}
      <AnimatePresence mode="wait">
        {phase === 'playing' && (
          <motion.div
            key={currentNodeId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3"
          >
            <div className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-2xl p-5">
              <p className="text-sm text-[#b0b8cc] leading-relaxed">{currentNode.text}</p>
            </div>

            <p className="text-xs text-[#8892b0]">Choose your response:</p>

            <div className="flex flex-col gap-2">
              {currentNode.nextIds.map(nextId => {
                const nextNode = maze.nodes.find(n => n.id === nextId)!
                return (
                  <motion.button
                    key={nextId}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => choose(nextId)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all
                      ${nextNode.isExit
                        ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88] hover:border-[#00ff88]'
                        : 'bg-[#16213e] border-[#1e2a4a] text-[#b0b8cc] hover:border-[#00d4ff]/30 hover:text-white'
                      }
                    `}
                  >
                    {nextNode.text}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {phase === 'exited' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-2xl p-5">
              <p className="text-sm font-semibold text-[#00ff88] mb-2">✓ Exit found — {loopCount} loops taken</p>
              <p className="text-sm text-[#b0b8cc] leading-relaxed">{maze.exitExplanation}</p>
            </div>
            {loopCount > 0 && (
              <div className="bg-[#ffd700]/08 border border-[#ffd700]/20 rounded-xl p-4">
                <p className="text-xs font-mono text-[#ffd700] uppercase tracking-wider mb-1">Why you looped</p>
                <p className="text-sm text-[#8892b0]">{maze.loopExplanation}</p>
              </div>
            )}
            <Button onClick={nextMaze} fullWidth>
              {mazeIdx + 1 >= mazes.length ? 'Finish Level' : 'Next maze →'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
