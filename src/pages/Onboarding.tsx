import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgressStore } from '../store/progressStore'

const questions = [
  {
    id: 'context',
    question: 'Where do you most want to improve your communication?',
    options: [
      { value: 'relationship', label: 'Romantic relationships', icon: '💑' },
      { value: 'workplace', label: 'Work & professional', icon: '💼' },
      { value: 'family', label: 'Family dynamics', icon: '👪' },
      { value: 'general', label: 'General — all of the above', icon: '🌐' },
    ],
  },
  {
    id: 'goal',
    question: 'What is your primary goal right now?',
    options: [
      { value: 'recognise', label: 'Recognise toxic patterns when they happen', icon: '🔍' },
      { value: 'respond', label: 'Respond better in heated moments', icon: '🧠' },
      { value: 'recover', label: 'Understand what happened in a past situation', icon: '🔄' },
      { value: 'master', label: 'Become genuinely masterful at all of it', icon: '🏆' },
    ],
  },
  {
    id: 'experience',
    question: 'How familiar are you with this material?',
    options: [
      { value: 'beginner', label: 'New to it — start from basics', icon: '🌱' },
      { value: 'some', label: 'Some awareness — ready to go deeper', icon: '📈' },
      { value: 'practised', label: 'Practised — I want advanced challenges', icon: '⚡' },
    ],
  },
  {
    id: 'time',
    question: 'How much time can you commit daily?',
    options: [
      { value: '5min', label: 'Just the daily 2-min practice', icon: '⏱' },
      { value: '15min', label: '15 minutes', icon: '📅' },
      { value: '30min', label: '30+ minutes', icon: '🚀' },
    ],
  },
]

export function Onboarding() {
  const navigate = useNavigate()
  const { setOnboardingComplete } = useProgressStore()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const current = questions[step]
  const isLast = step === questions.length - 1

  const select = (value: string) => {
    const newAnswers = { ...answers, [current.id]: value }
    setAnswers(newAnswers)

    setTimeout(() => {
      if (isLast) {
        setOnboardingComplete(newAnswers.context ?? 'general')
        navigate('/', { replace: true })
      } else {
        setStep(s => s + 1)
      }
    }, 300)
  }

  return (
    <div className="min-h-dvh bg-[#0f0f1a] flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-white">Signal &amp; Static</h1>
        <p className="text-[#8892b0] text-sm mt-1">Communication mastery training</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {questions.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === step ? '24px' : '8px',
              backgroundColor: i <= step ? '#00d4ff' : '#1e2a4a',
            }}
          />
        ))}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm"
        >
          <h2 className="text-xl font-bold text-white text-center mb-6">
            {current.question}
          </h2>

          <div className="flex flex-col gap-3">
            {current.options.map(option => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.97 }}
                onClick={() => select(option.value)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-2xl border text-left
                  transition-all duration-150
                  ${answers[current.id] === option.value
                    ? 'bg-[#00d4ff]/10 border-[#00d4ff] text-white'
                    : 'bg-[#16213e] border-[#1e2a4a] text-[#b0b8cc] hover:border-[#2a3a5e] hover:text-white'
                  }
                `}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="font-medium text-sm">{option.label}</span>
              </motion.button>
            ))}
          </div>

          <p className="text-center text-[#3a3a5e] text-xs mt-6">
            {step + 1} of {questions.length}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
